/**
 * CSV Merge Logic for Augustine HubSpot Import
 *
 * Sync rules:
 *   1. Contact doesn't exist in HubSpot → Create it (from our data)
 *   2. Contact exists but missing fields → Fill blanks from our data, never overwrite
 *   3. Contact exists and data differs → Keep HubSpot's data (theirs takes priority)
 *   4. Dedup primarily by email; if no email, match on name + institution
 */

import { splitName, cleanEmail, mapRole, validateParRole, toStateAbbrev, extractZipFromString, formatInstitutionName, parseAddress, looksLikeInstitutionName } from './csv-export';

// ─── CSV Parsing ───────────────────────────────────────────────────────────

/**
 * RFC 4180-compliant CSV parser. Handles:
 *   - Quoted fields containing commas, newlines, and escaped quotes ("")
 *   - Multi-line quoted fields (field value spans multiple lines)
 *   - Mixed line endings (\r\n, \n, \r)
 */
export function parseCsv(raw: string): Record<string, string>[] {
  const text = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const records = parseCsvRecords(text);
  if (records.length < 2) return [];

  const headers = records[0];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < records.length; i++) {
    const values = records[i];
    // Skip blank rows (single empty cell)
    if (values.length === 1 && !values[0].trim()) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] ?? '').trim();
    }
    rows.push(row);
  }
  return rows;
}

/** Parse full CSV text into an array of records (each record is an array of field values). */
function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
        i++;
      } else if (ch === '\n') {
        fields.push(current);
        records.push(fields);
        fields = [];
        current = '';
        i++;
      } else {
        current += ch;
        i++;
      }
    }
  }

  // Push final record if there's content
  if (current || fields.length > 0) {
    fields.push(current);
    records.push(fields);
  }

  return records;
}

// ─── Normalization ─────────────────────────────────────────────────────────

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Strip junk from a Record ID field — keep only digits. */
function sanitizeRecordId(raw: string): string {
  if (!raw) return '';
  // Extract first sequence of digits found
  const match = raw.match(/\d+/);
  return match ? match[0] : '';
}

/** Clean a field value — collapse whitespace, strip control characters. */
function sanitizeField(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[\r\n\t]+/g, ' ')  // Replace newlines/tabs with space
    .replace(/\s{2,}/g, ' ')      // Collapse multiple spaces
    .trim();
}

/** Normalize a company name for fuzzy matching — strip state/zip suffix, common suffixes, punctuation. */
function normalizeCompanyName(name: string): string {
  let n = name.trim().toLowerCase();
  // Strip "Name - ST - 12345" suffix pattern
  n = n.replace(/\s*-\s*[a-z]{2}\s*-\s*\d{5}.*$/, '');
  // Strip common suffixes
  n = n.replace(/\b(parish|school|church|catholic|roman catholic|academy|diocese|archdiocese)\b/g, '');
  // Strip punctuation and collapse whitespace
  n = n.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  return n;
}

function normalizeNameKey(firstName: string, lastName: string, company: string): string {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}|${normalizeCompanyName(company)}`;
}

// ─── Output column spec ────────────────────────────────────────────────────

export const MERGED_CSV_COLUMNS = [
  'Record ID - Contact',
  'First Name',
  'Last Name',
  'Job Title',
  'PAR - Role',
  'Email',
  'Phone Number',
  'Record ID - Company',
  'Company name',
  'Street Address',
  'City',
  'State - Dropdown (COMPANY)',
  'Postal Code',
  'Source',           // "HubSpot", "CRM", or "Merged"
  'Match Type',       // "email", "name+institution", or "new"
] as const;

export type MergedRow = Record<(typeof MERGED_CSV_COLUMNS)[number], string>;

// ─── Normalize our CRM export row ──────────────────────────────────────────

function normalizeCrmRow(row: Record<string, string>): MergedRow {
  // Handle both old format (name, role, etc.) and new format (First Name, Last Name, etc.)
  let firstName = row['First Name'] ?? '';
  let lastName = row['Last Name'] ?? '';

  // If we have a single "name" field, split it
  if (!firstName && !lastName && row['name']) {
    [firstName, lastName] = splitName(row['name']);
  }

  // Clean email
  const rawEmail = row['Email'] ?? row['email'] ?? '';
  const email = cleanEmail(rawEmail) || '';

  // Role mapping
  const rawRole = row['Job Title'] ?? row['role'] ?? '';
  const [rawTitle, parRole] = mapRole(rawRole);

  // Phone
  const phone = row['Phone Number'] ?? row['contact_number'] ?? '';

  // Institution / Company
  const companyName = row['Company name'] ?? row['institution_name'] ?? '';
  const recordIdCompany = row['Record ID - Company'] ?? '';
  let streetAddress = row['Street Address'] ?? '';
  let city = row['City'] ?? '';
  let stateRaw = row['State - Dropdown (COMPANY)'] ?? row['State'] ?? '';
  let postalCode = row['Postal Code'] ?? '';

  // Fallback: parse institution address if individual fields are empty
  const rawAddress = row['address'] ?? row['Address'] ?? '';
  if (rawAddress && (!streetAddress || !city || !stateRaw || !postalCode)) {
    const parsed = parseAddress(rawAddress);
    if (!streetAddress && parsed.streetAddress) streetAddress = parsed.streetAddress;
    if (!city && parsed.city) city = parsed.city;
    if (!stateRaw && parsed.state) stateRaw = parsed.state;
    if (!postalCode && parsed.postalCode) postalCode = parsed.postalCode;
  }

  // Try to build institution name in "Name - ST - ZIP" format
  const stateAbbr = toStateAbbrev(stateRaw);
  const zip = postalCode || extractZipFromString(companyName);
  const formattedCompany = formatInstitutionName(companyName, stateAbbr, zip);

  return {
    'Record ID - Contact': sanitizeRecordId(row['Record ID - Contact'] ?? row['staff_id'] ?? ''),
    'First Name': sanitizeField(firstName),
    'Last Name': sanitizeField(lastName),
    'Job Title': sanitizeField(rawTitle),
    'PAR - Role': validateParRole(parRole),
    'Email': email,
    'Phone Number': sanitizeField(phone),
    'Record ID - Company': sanitizeRecordId(recordIdCompany),
    'Company name': sanitizeField(formattedCompany || companyName),
    'Street Address': sanitizeField(streetAddress),
    'City': sanitizeField(city),
    'State - Dropdown (COMPANY)': sanitizeField(stateRaw),
    'Postal Code': sanitizeField(zip),
    'Source': 'CRM',
    'Match Type': 'new',
  };
}

// ─── Normalize HubSpot export row ──────────────────────────────────────────

function normalizeHubSpotRow(row: Record<string, string>): MergedRow {
  return {
    'Record ID - Contact': sanitizeRecordId(row['Record ID - Contact'] ?? row['Record ID'] ?? ''),
    'First Name': sanitizeField(row['First Name'] ?? ''),
    'Last Name': sanitizeField(row['Last Name'] ?? ''),
    'Job Title': sanitizeField(row['Job Title'] ?? ''),
    'PAR - Role': validateParRole(row['PAR - Role']),
    'Email': (row['Email'] ?? '').trim(),
    'Phone Number': sanitizeField(row['Phone Number'] ?? ''),
    'Record ID - Company': sanitizeRecordId(row['Record ID - Company'] ?? ''),
    'Company name': sanitizeField(row['Company name'] ?? ''),
    'Street Address': sanitizeField(row['Street Address'] ?? ''),
    'City': sanitizeField(row['City'] ?? ''),
    'State - Dropdown (COMPANY)': sanitizeField(row['State - Dropdown (COMPANY)'] ?? row['State'] ?? ''),
    'Postal Code': sanitizeField(row['Postal Code'] ?? ''),
    'Source': 'HubSpot',
    'Match Type': '',
  };
}

// ─── Merge logic ───────────────────────────────────────────────────────────

/**
 * Fill blank fields in `target` from `source`. Never overwrite existing data.
 * Returns a new merged row.
 */
function fillBlanks(target: MergedRow, source: MergedRow, matchType: string): MergedRow {
  const merged = { ...target };
  for (const col of MERGED_CSV_COLUMNS) {
    if (col === 'Source' || col === 'Match Type') continue;
    if (!merged[col]?.trim() && source[col]?.trim()) {
      merged[col] = source[col];
    }
  }
  merged['Source'] = 'Merged';
  merged['Match Type'] = matchType;
  return merged;
}

/** A single field change in a matched record. */
export interface FieldChange {
  column: string;
  before: string;  // HubSpot value (was blank)
  after: string;   // CRM value (filled in)
}

/** A matched record with all its field-level changes. */
export interface MatchedRecordDiff {
  matchType: 'email' | 'name+institution';
  matchKey: string;           // email or "firstName lastName | company"
  hubspotName: string;        // display name from HubSpot
  crmName: string;            // display name from CRM
  company: string;
  changes: FieldChange[];     // fields that were blank in HS and filled from CRM
}

export interface MergeStats {
  hubspotTotal: number;
  crmTotal: number;
  matchedByEmail: number;
  matchedByName: number;
  newFromCrm: number;
  hubspotOnly: number;
  fieldsFilledIn: number;
  outputTotal: number;
}

export interface MergeResult {
  rows: MergedRow[];
  stats: MergeStats;
  /** Per-record diff for every matched contact showing what changed. */
  diffs: MatchedRecordDiff[];
}

/**
 * Merge two CSVs:
 *   hubspotCsv — Nate's HubSpot export (existing contacts, takes priority)
 *   crmCsv     — Our CRM export (new/enriched data)
 *
 * Returns merged rows + stats.
 */
export function mergeCsvs(hubspotRaw: Record<string, string>[], crmRaw: Record<string, string>[]): MergeResult {
  const stats: MergeStats = {
    hubspotTotal: hubspotRaw.length,
    crmTotal: crmRaw.length,
    matchedByEmail: 0,
    matchedByName: 0,
    newFromCrm: 0,
    hubspotOnly: 0,
    fieldsFilledIn: 0,
    outputTotal: 0,
  };

  // Normalize all rows, filtering out corrupt CRM records
  const hubspotRows = hubspotRaw.map(normalizeHubSpotRow);
  const crmRows = crmRaw.map(normalizeCrmRow).filter((row) => {
    // Skip corrupt records where First Name is an institution name
    if (looksLikeInstitutionName(row['First Name'])) return false;
    return true;
  });

  // Build HubSpot lookup indexes
  const hsByEmail = new Map<string, number>(); // email → index in hubspotRows
  const hsByNameInst = new Map<string, number>(); // name+institution → index

  for (let i = 0; i < hubspotRows.length; i++) {
    const hs = hubspotRows[i];
    const email = normalizeEmail(hs['Email']);
    if (email) hsByEmail.set(email, i);
    const nameKey = normalizeNameKey(hs['First Name'], hs['Last Name'], hs['Company name']);
    if (hs['First Name'] && hs['Last Name']) hsByNameInst.set(nameKey, i);
  }

  // Track which HubSpot rows were matched
  const matchedHsIndexes = new Set<number>();
  const output: MergedRow[] = [];
  const diffs: MatchedRecordDiff[] = [];

  /** Build a diff for a matched pair and count filled fields. */
  function processMatch(hs: MergedRow, crm: MergedRow, matchType: 'email' | 'name+institution', matchKey: string) {
    const changes: FieldChange[] = [];
    for (const col of MERGED_CSV_COLUMNS) {
      if (col === 'Source' || col === 'Match Type') continue;
      if (!hs[col]?.trim() && crm[col]?.trim()) {
        changes.push({ column: col, before: '', after: crm[col] });
      }
    }
    stats.fieldsFilledIn += changes.length;

    diffs.push({
      matchType,
      matchKey,
      hubspotName: [hs['First Name'], hs['Last Name']].filter(Boolean).join(' ') || '(no name)',
      crmName: [crm['First Name'], crm['Last Name']].filter(Boolean).join(' ') || '(no name)',
      company: hs['Company name'] || crm['Company name'],
      changes,
    });

    output.push(fillBlanks(hs, crm, matchType));
  }

  // Process each CRM row
  for (const crm of crmRows) {
    const email = normalizeEmail(crm['Email']);
    let matched = false;

    // 1. Try email match
    if (email && hsByEmail.has(email)) {
      const hsIdx = hsByEmail.get(email)!;
      matchedHsIndexes.add(hsIdx);
      processMatch(hubspotRows[hsIdx], crm, 'email', email);
      stats.matchedByEmail++;
      matched = true;
    }

    // 2. Try name + institution match (only if no email match)
    if (!matched && crm['First Name'] && crm['Last Name']) {
      const nameKey = normalizeNameKey(crm['First Name'], crm['Last Name'], crm['Company name']);
      if (hsByNameInst.has(nameKey)) {
        const hsIdx = hsByNameInst.get(nameKey)!;
        if (!matchedHsIndexes.has(hsIdx)) {
          matchedHsIndexes.add(hsIdx);
          const displayKey = `${crm['First Name']} ${crm['Last Name']} | ${crm['Company name']}`;
          processMatch(hubspotRows[hsIdx], crm, 'name+institution', displayKey);
          stats.matchedByName++;
          matched = true;
        }
      }
    }

    // 3. No match → new contact from CRM
    if (!matched) {
      crm['Source'] = 'CRM';
      crm['Match Type'] = 'new';
      output.push(crm);
      stats.newFromCrm++;
    }
  }

  // 4. Add unmatched HubSpot rows (contacts only in HubSpot)
  for (let i = 0; i < hubspotRows.length; i++) {
    if (!matchedHsIndexes.has(i)) {
      hubspotRows[i]['Source'] = 'HubSpot';
      hubspotRows[i]['Match Type'] = 'hubspot-only';
      output.push(hubspotRows[i]);
      stats.hubspotOnly++;
    }
  }

  stats.outputTotal = output.length;
  return { rows: output, stats, diffs };
}

// ─── CSV serialization ─────────────────────────────────────────────────────

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function mergedRowsToCsv(rows: MergedRow[]): string {
  const header = MERGED_CSV_COLUMNS.join(',');
  const body = rows.map((row) =>
    MERGED_CSV_COLUMNS.map((col) => escapeCsvCell(row[col] ?? '')).join(',')
  );
  return [header, ...body].join('\r\n');
}

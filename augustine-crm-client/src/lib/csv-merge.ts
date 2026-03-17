/**
 * CSV Merge Logic for Augustine HubSpot Import
 *
 * Sync rules:
 *   1. Contact doesn't exist in HubSpot → Create it (from our data)
 *   2. Contact exists but missing fields → Fill blanks from our data, never overwrite
 *   3. Contact exists and data differs → Keep HubSpot's data (theirs takes priority)
 *   4. Dedup primarily by email; if no email, match on name + institution
 */

import { splitName, cleanEmail, mapRole, toStateAbbrev, extractZipFromString, formatInstitutionName, parseAddress } from './csv-export';

// ─── CSV Parsing ───────────────────────────────────────────────────────────

/** Parse a CSV string into an array of objects keyed by header names. */
export function parseCsv(raw: string): Record<string, string>[] {
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j].trim()] = (values[j] ?? '').trim();
    }
    rows.push(row);
  }
  return rows;
}

/** Parse a single CSV line respecting quoted fields with commas and newlines. */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
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

function normalizeNameKey(firstName: string, lastName: string, company: string): string {
  return `${firstName.trim().toLowerCase()}|${lastName.trim().toLowerCase()}|${company.trim().toLowerCase()}`;
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
  const streetAddress = row['Street Address'] ?? '';
  const city = row['City'] ?? '';
  const stateRaw = row['State - Dropdown (COMPANY)'] ?? row['State'] ?? '';
  const postalCode = row['Postal Code'] ?? '';

  // Try to build institution name in "Name - ST - ZIP" format
  const stateAbbr = toStateAbbrev(stateRaw);
  const zip = postalCode || extractZipFromString(companyName);
  const formattedCompany = formatInstitutionName(companyName, stateAbbr, zip);

  return {
    'Record ID - Contact': sanitizeRecordId(row['Record ID - Contact'] ?? row['staff_id'] ?? ''),
    'First Name': sanitizeField(firstName),
    'Last Name': sanitizeField(lastName),
    'Job Title': sanitizeField(rawTitle),
    'PAR - Role': sanitizeField(parRole),
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
    'PAR - Role': sanitizeField(row['PAR - Role'] ?? ''),
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

  // Normalize all rows
  const hubspotRows = hubspotRaw.map(normalizeHubSpotRow);
  const crmRows = crmRaw.map(normalizeCrmRow);

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

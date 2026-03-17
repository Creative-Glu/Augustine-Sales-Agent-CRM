import type { Staff } from '@/types/execution';
import type { WebsitesUrl } from '@/types/websitesUrl';

// ─── Helpers ───────────────────────────────────────────────────────────────

export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value == null) return '';
  const s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// ─── Email cleaning ────────────────────────────────────────────────────────

const JUNK_EMAIL_RE =
  /spambot|protected|member|parish office|office@$|^office$|^email$|^contact$|^info$|^n\/a$|^none$|^-$/i;

/** Returns cleaned email or empty string if invalid / junk. */
export function cleanEmail(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed.includes('@') || !trimmed.split('@')[1]?.includes('.')) return '';
  if (JUNK_EMAIL_RE.test(trimmed)) return '';
  return trimmed;
}

// ─── Name splitting ────────────────────────────────────────────────────────

const NAME_PREFIXES = new Set([
  'fr', 'fr.', 'father', 'sr', 'sr.', 'sister', 'br', 'br.', 'brother',
  'rev', 'rev.', 'reverend', 'msgr', 'msgr.', 'monsignor',
  'deacon', 'dcn', 'dcn.', 'dr', 'dr.', 'doctor',
  'mr', 'mr.', 'mrs', 'mrs.', 'ms', 'ms.', 'miss',
  'prof', 'prof.', 'bishop', 'archbishop',
]);

/**
 * Split full name → [firstName, lastName]. Strips religious/honorific prefixes.
 * "Father Robert F. Grippo" → ["Robert F.", "Grippo"]
 * "Deacon Kurt Lucas" → ["Kurt", "Lucas"]
 */
export function splitName(name: string | null): [string, string] {
  if (!name?.trim()) return ['', ''];
  const parts = name.trim().split(/\s+/);
  while (parts.length > 1 && NAME_PREFIXES.has(parts[0].toLowerCase())) {
    parts.shift();
  }
  if (parts.length === 0) return ['', ''];
  if (parts.length === 1) return [parts[0], ''];
  const lastName = parts.pop()!;
  return [parts.join(' '), lastName];
}

// ─── Role mapping ──────────────────────────────────────────────────────────

const ROLE_MAP: [RegExp, string, string][] = [
  [/\bpastor\b/i, 'Pastor', 'Pastor'],
  [/\bparish priest\b/i, 'Pastor', 'Pastor'],
  [/\bparochial vicar\b/i, 'Pastor', 'Parochial Vicar'],
  [/\bpastor emeritus\b/i, 'Pastor', 'Pastor Emeritus'],
  [/\bpriest\b/i, 'Pastor', 'Priest'],
  [/\brector\b/i, 'Pastor', 'Rector'],
  [/\bchaplain\b/i, 'Pastor', 'Chaplain'],
  [/\b(dre|director of religious ed)/i, 'Director of Religious Education', 'Director of Religious Education'],
  [/\breligious ed(ucation)?\s*(director|coordinator)/i, 'Director of Religious Education', 'Director of Religious Education'],
  [/\bfaith formation\s*(director|coordinator)/i, 'Director of Religious Education', 'Faith Formation Director'],
  [/\bcatechetical\s*(director|leader)/i, 'Director of Religious Education', 'Catechetical Director'],
  [/\badult faith/i, 'Director of Religious Education', 'Adult Faith Formation Director'],
  [/\brcia\s*(director|coordinator)/i, 'Director of Religious Education', 'RCIA Director'],
  [/\byouth\s*(minister|ministry|coordinator|director|pastor)/i, 'Youth Ministry', 'Youth Ministry Coordinator'],
  [/\bcampus\s*minister/i, 'Youth Ministry', 'Campus Minister'],
  [/\byoung\s*adult/i, 'Youth Ministry', 'Young Adult Ministry'],
  [/\bprincipal\b/i, 'Principal', 'Principal'],
  [/\bhead\s*of\s*school/i, 'Principal', 'Head of School'],
  [/\bassistant\s*principal/i, 'Principal', 'Assistant Principal'],
  [/\bvice\s*principal/i, 'Principal', 'Vice Principal'],
  [/\bteacher\b/i, 'Teacher/Catechist', 'Teacher'],
  [/\bcatechist\b/i, 'Teacher/Catechist', 'Catechist'],
  [/\binstructor\b/i, 'Teacher/Catechist', 'Instructor'],
  [/\btheology\b/i, 'Teacher/Catechist', 'Theology Teacher'],
  [/\breligion\s*teacher/i, 'Teacher/Catechist', 'Religion Teacher'],
  [/\bdeacon\b/i, 'Deacon', 'Deacon'],
  [/\bmusic\s*(director|minister|coordinator)/i, 'Music/Liturgy', 'Music Director'],
  [/\bliturgy|liturgical/i, 'Music/Liturgy', 'Liturgy Director'],
  [/\bchoir\s*director/i, 'Music/Liturgy', 'Choir Director'],
  [/\bworship/i, 'Music/Liturgy', 'Worship Director'],
  [/\borganist\b/i, 'Music/Liturgy', 'Organist'],
  [/\badmin(istrative)?\s*(assistant|asst|coordinator)/i, 'Administrative Assistant/Secretary', 'Administrative Assistant'],
  [/\bsecretary\b/i, 'Administrative Assistant/Secretary', 'Secretary'],
  [/\bparish\s*secretary/i, 'Administrative Assistant/Secretary', 'Parish Secretary'],
  [/\breceptionist\b/i, 'Administrative Assistant/Secretary', 'Receptionist'],
  [/\bfront\s*(desk|office)/i, 'Administrative Assistant/Secretary', 'Front Office'],
  [/\bbusiness\s*manager/i, 'Office/Business Manager', 'Business Manager'],
  [/\boffice\s*manager/i, 'Office/Business Manager', 'Office Manager'],
  [/\bfinance\s*(director|manager|officer)/i, 'Office/Business Manager', 'Finance Director'],
  [/\bbookkeeper\b/i, 'Office/Business Manager', 'Bookkeeper'],
  [/\baccountant\b/i, 'Office/Business Manager', 'Accountant'],
  [/\bcommunications?\s*(director|coordinator|manager)/i, 'Communications', 'Communications Director'],
  [/\bmedia\s*(director|coordinator|manager)/i, 'Communications', 'Media Coordinator'],
  [/\bsocial\s*media/i, 'Communications', 'Social Media Coordinator'],
  [/\bmarketing/i, 'Communications', 'Marketing Coordinator'],
  [/\bbulletin\s*(editor|coordinator)/i, 'Communications', 'Bulletin Editor'],
  [/\bwebmaster\b/i, 'Communications', 'Webmaster'],
  [/\bpastoral\s*(associate|assistant|coordinator)/i, 'Pastoral Associate', 'Pastoral Associate'],
  [/\bpastoral\s*minister/i, 'Pastoral Associate', 'Pastoral Minister'],
  [/\bparish\s*(life|coordinator)/i, 'Pastoral Associate', 'Parish Life Coordinator'],
  [/\bvolunteer\s*(coordinator|director|manager)/i, 'Volunteer', 'Volunteer Coordinator'],
  [/\bexecutive\s*director/i, 'Director', 'Executive Director'],
  [/\bdirector\b/i, 'Director', 'Director'],
  [/\bcoordinator\b/i, 'Director', 'Coordinator'],
  [/\bmanager\b/i, 'Director', 'Manager'],
  [/\bmaintenance/i, 'Maintenance/Facilities', 'Maintenance'],
  [/\bfacilit(y|ies)/i, 'Maintenance/Facilities', 'Facilities Manager'],
  [/\bcustodian/i, 'Maintenance/Facilities', 'Custodian'],
  [/\btechnolog(y|ist)/i, 'Technology', 'Technology Director'],
  [/\bit\s*(director|manager|coordinator)/i, 'Technology', 'IT Director'],
];

/** Map raw title → [rawTitle, parRole, hubspotJobTitle]. Unmapped titles pass through as-is. */
export function mapRole(rawRole: string | null): [string, string, string] {
  const raw = rawRole?.trim() ?? '';
  if (!raw) return ['', '', ''];
  for (const [pattern, parRole, jobTitle] of ROLE_MAP) {
    if (pattern.test(raw)) return [raw, parRole, jobTitle];
  }
  return [raw, raw, raw];
}

// ─── State abbreviation ────────────────────────────────────────────────────

const STATE_ABBREV: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY', 'district of columbia': 'DC',
};

export function toStateAbbrev(state: string): string {
  if (!state) return '';
  const lower = state.trim().toLowerCase();
  if (lower.length === 2) return lower.toUpperCase();
  return STATE_ABBREV[lower] ?? state.trim();
}

// ─── Address parsing ──────────────────────────────────────────────────────

/** Extract a 5-digit US zip code from a string. */
export function extractZipFromString(s: string | null | undefined): string {
  if (!s) return '';
  const match = s.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : '';
}

const ABBREV_TO_STATE: Record<string, string> = {};
for (const [full, abbr] of Object.entries(STATE_ABBREV)) {
  ABBREV_TO_STATE[abbr.toLowerCase()] = full
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface ParsedAddress {
  streetAddress: string;
  city: string;
  state: string;
  stateAbbr: string;
  postalCode: string;
}

/**
 * Parse a US address string into components.
 * "530 W Kilgore Rd, Kalamazoo, MI 49008" → { street, city, state, zip }
 */
export function parseAddress(raw: string | null | undefined): ParsedAddress {
  const empty: ParsedAddress = { streetAddress: '', city: '', state: '', stateAbbr: '', postalCode: '' };
  if (!raw?.trim()) return empty;

  const addr = raw.trim();
  const zipMatch = addr.match(/\b(\d{5})(?:-\d{4})?\b/);
  const postalCode = zipMatch ? zipMatch[1] : '';
  let remaining = zipMatch ? addr.replace(zipMatch[0], '').trim().replace(/,\s*$/, '') : addr;

  let state = '';
  let stateAbbr = '';

  // Try 2-letter abbreviation at end
  const abbrMatch = remaining.match(/[,\s]+([A-Z]{2})\s*$/);
  if (abbrMatch) {
    const candidate = abbrMatch[1].toLowerCase();
    if (ABBREV_TO_STATE[candidate]) {
      stateAbbr = candidate.toUpperCase();
      state = ABBREV_TO_STATE[candidate];
      remaining = remaining.slice(0, abbrMatch.index).trim().replace(/,\s*$/, '');
    }
  }

  // Try full state name at end
  if (!stateAbbr) {
    for (const [fullName, abbr] of Object.entries(STATE_ABBREV)) {
      const re = new RegExp(`[,\\s]+${fullName}\\s*$`, 'i');
      const m = remaining.match(re);
      if (m) {
        stateAbbr = abbr;
        state = fullName.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        remaining = remaining.slice(0, m.index).trim().replace(/,\s*$/, '');
        break;
      }
    }
  }

  // Split remaining into street + city by last comma
  let streetAddress = '';
  let city = '';
  const lastComma = remaining.lastIndexOf(',');
  if (lastComma >= 0) {
    streetAddress = remaining.slice(0, lastComma).trim();
    city = remaining.slice(lastComma + 1).trim();
  } else {
    streetAddress = remaining;
  }

  return { streetAddress, city, state, stateAbbr, postalCode };
}

// ─── Postal code API fallback ─────────────────────────────────────────────

async function fetchPostalCodesByCityState(
  pairs: { city: string; state: string }[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const uniqueKeys = new Map<string, { city: string; stateAbbr: string }>();

  for (const { city, state } of pairs) {
    const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
    if (uniqueKeys.has(key)) continue;
    uniqueKeys.set(key, { city, stateAbbr: toStateAbbrev(state).toLowerCase() });
  }

  const entries = Array.from(uniqueKeys.entries());
  const BATCH = 10;
  for (let i = 0; i < entries.length; i += BATCH) {
    const batch = entries.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async ([key, { city, stateAbbr }]) => {
        try {
          const url = `https://api.zippopotam.us/us/${encodeURIComponent(stateAbbr)}/${encodeURIComponent(city)}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const json = await res.json();
          if (Array.isArray(json?.places) && json.places.length > 0) {
            result.set(key, json.places[0]['post code'] ?? '');
          }
        } catch { /* skip */ }
      })
    );
  }
  return result;
}

// ─── Company lookup ────────────────────────────────────────────────────────

export function lookupCompany(
  inst: Staff['institutions'],
  websitesUrlMap: Map<string, WebsitesUrl>
): WebsitesUrl | undefined {
  if (!inst) return undefined;
  if (inst.name && websitesUrlMap.has(inst.name)) return websitesUrlMap.get(inst.name);
  if (inst.website_url && websitesUrlMap.has(inst.website_url)) return websitesUrlMap.get(inst.website_url);
  if (inst.website_url) {
    try {
      const u = new URL(inst.website_url.startsWith('http') ? inst.website_url : `https://${inst.website_url}`);
      const domain = u.hostname.replace(/^www\./, '').toLowerCase();
      if (domain && websitesUrlMap.has(domain)) return websitesUrlMap.get(domain);
    } catch { /* ignore */ }
  }
  return undefined;
}

// ─── Location resolution ──────────────────────────────────────────────────

interface ResolvedRow {
  postalCode: string;
  state: string;
  stateAbbr: string;
  city: string;
  streetAddress: string;
}

export async function resolveLocationData(
  rows: Staff[],
  websitesUrlMap: Map<string, WebsitesUrl>
): Promise<Map<number, ResolvedRow>> {
  const result = new Map<number, ResolvedRow>();
  const needsLookup: { staffId: number; city: string; state: string }[] = [];

  for (const r of rows) {
    const company = lookupCompany(r.institutions, websitesUrlMap);

    let streetAddress = company?.['Street Address'] ?? '';
    let city = company?.City ?? '';
    let state = company?.['State - Dropdown (COMPANY)'] ?? '';
    let postalCode = '';

    // Fallback: parse institution address for missing components
    const instAddress = r.institutions?.address;
    if (instAddress && (!streetAddress || !city || !state || !postalCode)) {
      const parsed = parseAddress(instAddress);
      if (!streetAddress && parsed.streetAddress) streetAddress = parsed.streetAddress;
      if (!city && parsed.city) city = parsed.city;
      if (!state && parsed.state) state = parsed.state;
      if (!postalCode && parsed.postalCode) postalCode = parsed.postalCode;
    }

    if (!postalCode) postalCode = extractZipFromString(r.institutions?.name);
    if (!postalCode) postalCode = extractZipFromString(r.institutions?.address);

    const stateAbbr = toStateAbbrev(state);
    result.set(r.staff_id, { postalCode, state, stateAbbr, city, streetAddress });

    if (!postalCode && city && state) {
      needsLookup.push({ staffId: r.staff_id, city, state });
    }
  }

  if (needsLookup.length > 0) {
    const apiResults = await fetchPostalCodesByCityState(
      needsLookup.map(({ city, state }) => ({ city, state }))
    );
    for (const { staffId, city, state } of needsLookup) {
      const key = `${city.toLowerCase()}|${state.toLowerCase()}`;
      const postal = apiResults.get(key);
      if (postal) {
        const existing = result.get(staffId);
        if (existing) existing.postalCode = postal;
      }
    }
  }

  return result;
}

// ─── Institution name formatting ──────────────────────────────────────────

/** Format: "Name - ST - ZIP" (e.g. "St Gabriel Parish - PA - 19463") */
export function formatInstitutionName(name: string, stateAbbr: string, postalCode: string): string {
  if (!name) return '';
  if (/\s-\s[A-Z]{2}\s-\s\d{5}/.test(name)) return name;
  const parts = [name];
  if (stateAbbr) parts.push(stateAbbr);
  if (postalCode) parts.push(postalCode);
  return parts.join(' - ');
}

// ─── CSV generation ────────────────────────────────────────────────────────

const CSV_HEADER = [
  'Record ID - Contact',
  'First Name',
  'Last Name',
  'Job Title',
  'PAR - Role',
  'HubSpot Job Title',
  'Email',
  'Phone Number',
  'Record ID - Company',
  'Company name',
  'Phone Number (Company)',
  'Street Address',
  'City',
  'State - Dropdown (COMPANY)',
  'Postal Code',
].join(',');

export async function staffToCsv(
  rows: Staff[],
  websitesUrlMap: Map<string, WebsitesUrl>
): Promise<string> {
  const locationData = await resolveLocationData(rows, websitesUrlMap);

  const body = rows.map((r) => {
    const company = lookupCompany(r.institutions, websitesUrlMap);
    const loc = locationData.get(r.staff_id);
    const [firstName, lastName] = splitName(r.name);
    const [rawTitle, parRole, hubspotJobTitle] = mapRole(r.role);
    const email = cleanEmail(r.email);
    const institutionName = r.institutions?.name ?? '';
    const formattedCompanyName = formatInstitutionName(
      institutionName,
      loc?.stateAbbr ?? '',
      loc?.postalCode ?? ''
    );

    return [
      r.staff_id,                                            // Record ID - Contact
      firstName,                                             // First Name
      lastName,                                              // Last Name
      rawTitle,                                              // Job Title (raw scraped)
      parRole,                                               // PAR - Role (mapped)
      hubspotJobTitle,                                       // HubSpot Job Title (mapped)
      email,                                                 // Email (cleaned)
      r.contact_number ?? '',                                // Phone Number (contact)
      company?.['Record ID'] ?? '',                          // Record ID - Company
      formattedCompanyName,                                  // Company name (Name - ST - ZIP)
      company?.['Phone Number'] ?? '',                       // Phone Number (Company)
      loc?.streetAddress ?? '',                               // Street Address
      loc?.city ?? '',                                       // City
      loc?.state ?? '',                                      // State
      loc?.postalCode ?? '',                                 // Postal Code
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  return [CSV_HEADER, ...body].join('\r\n');
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

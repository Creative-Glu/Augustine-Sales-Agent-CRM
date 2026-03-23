import type { Staff } from '@/types/execution';
import type { WebsitesUrl } from '@/types/websitesUrl';
import { getStateValue } from '@/services/websites-url/websitesUrl.service';

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

/** Canonical PAR roles — only these values are allowed in the "PAR - Role" column. */
const VALID_PAR_ROLES = new Set([
  'Administrative Assistant/Secretary',
  'Adult Faith Formation/RCIA',
  'Administrator',
  'Associate Pastor',
  'Bible Study/Small Group Leader',
  'Bishop',
  'Bulletin Editor',
  'Campus Minister',
  'Chaplain',
  'Communications',
  'Confirmation Leader',
  'Curriculum Coordinator',
  'Deacon',
  'Director of Evangelization',
  'Director of Religious Education',
  'Diocese Staff',
  'IT/Data/Technology/Webmaster',
  'Office/Business Manager',
  'Other',
  'Parish/Finance Council',
  'Parishioner',
  'Parent',
  'Pastor',
  'Pastoral Associate',
  'Principal',
  'Religious/Sister',
  'Superintendent',
  'Teacher/Catechist',
  'Volunteer',
  'Youth Ministry',
]);

const ROLE_MAP: [RegExp, string, string][] = [
  // ── Pastor / Priest ─────────────────────────────────────────────────────
  [/\bpastor\b/i, 'Pastor', 'Pastor'],
  [/\bparish\s*priest\b/i, 'Pastor', 'Pastor'],
  [/\bparochial\s*(administrator|admin)\b/i, 'Pastor', 'Parochial Administrator'],
  [/\bpastor\s*emeritus/i, 'Pastor', 'Pastor Emeritus'],
  [/\bpriest\s*(in\s*)?(residence|solidum|moderator)/i, 'Pastor', 'Priest'],
  [/\bpriest\b/i, 'Pastor', 'Priest'],
  [/\brector\b/i, 'Pastor', 'Rector'],
  [/\bcanonical\s*(administrator|pastor)/i, 'Pastor', 'Canonical Administrator'],
  [/\bsacramental\s*(minister|priest)/i, 'Pastor', 'Sacramental Minister'],
  [/\bpárroco\b/i, 'Pastor', 'Pastor'],
  [/\bcuré\b/i, 'Pastor', 'Pastor'],
  [/\bcura\b/i, 'Pastor', 'Pastor'],

  // ── Associate Pastor ────────────────────────────────────────────────────
  [/\bassociate\s*pastor/i, 'Associate Pastor', 'Associate Pastor'],
  [/\bparochial\s*vicar/i, 'Associate Pastor', 'Parochial Vicar'],
  [/\bvicario?\b/i, 'Associate Pastor', 'Vicar'],
  [/\bassistant\s*(pastor|priest)/i, 'Associate Pastor', 'Assistant Pastor'],
  [/\bsenior\s*(associate|parochial)/i, 'Associate Pastor', 'Senior Associate Pastor'],

  // ── Bishop ──────────────────────────────────────────────────────────────
  [/\bbishop\b/i, 'Bishop', 'Bishop'],
  [/\barchbishop\b/i, 'Bishop', 'Archbishop'],
  [/\bcardinal\b/i, 'Bishop', 'Cardinal'],
  [/\bobispo\b/i, 'Bishop', 'Bishop'],

  // ── Chaplain ────────────────────────────────────────────────────────────
  [/\bchaplain\b/i, 'Chaplain', 'Chaplain'],

  // ── Deacon ──────────────────────────────────────────────────────────────
  [/\bdeacon\b/i, 'Deacon', 'Deacon'],
  [/\bdcn\b/i, 'Deacon', 'Deacon'],
  [/\bdiácono\b/i, 'Deacon', 'Deacon'],
  [/\bpermanent\s*deacon/i, 'Deacon', 'Permanent Deacon'],

  // ── Superintendent ──────────────────────────────────────────────────────
  [/\bsuperintendent\b/i, 'Superintendent', 'Superintendent'],

  // ── Director of Religious Education ──────────────────────────────────────
  [/\b(dre|director of religious ed)/i, 'Director of Religious Education', 'Director of Religious Education'],
  [/\breligious\s*ed(ucation)?\s*(director|coordinator)/i, 'Director of Religious Education', 'Director of Religious Education'],
  [/\bdirector\s*(of\s*)?(faith\s*formation|religious\s*formation)/i, 'Director of Religious Education', 'Director of Faith Formation'],
  [/\bfaith\s*formation\s*(director|coordinator|lead)/i, 'Director of Religious Education', 'Faith Formation Director'],
  [/\bfaith\s*formation$/i, 'Director of Religious Education', 'Faith Formation'],
  [/\bcatechetical\s*(director|leader|coordinator)/i, 'Director of Religious Education', 'Catechetical Director'],
  [/\bcoordinator\s*of\s*(religious\s*ed|faith\s*formation|catechesis)/i, 'Director of Religious Education', 'Coordinator of Religious Education'],
  [/\bparish\s*catechetical\s*leader/i, 'Director of Religious Education', 'Parish Catechetical Leader'],
  [/\bdirector\s*of\s*catechesis/i, 'Director of Religious Education', 'Director of Catechesis'],
  [/\bdirector\s*of\s*catechetical/i, 'Director of Religious Education', 'Director of Catechetical Ministry'],
  [/\bc\.?r\.?e\.?\b/i, 'Director of Religious Education', 'CRE'],
  [/\bdirectora?\s*de\s*educaci[oó]n\s*religiosa/i, 'Director of Religious Education', 'Director of Religious Education'],

  // ── Adult Faith Formation / RCIA ────────────────────────────────────────
  [/\badult\s*faith/i, 'Adult Faith Formation/RCIA', 'Adult Faith Formation'],
  [/\brcia\b/i, 'Adult Faith Formation/RCIA', 'RCIA'],
  [/\bocia\b/i, 'Adult Faith Formation/RCIA', 'OCIA'],
  [/\brite\s*of\s*christian\s*initiation/i, 'Adult Faith Formation/RCIA', 'RCIA'],
  [/\border\s*of\s*christian\s*initiation/i, 'Adult Faith Formation/RCIA', 'OCIA'],
  [/\bbecoming\s*catholic/i, 'Adult Faith Formation/RCIA', 'RCIA'],

  // ── Youth Ministry ──────────────────────────────────────────────────────
  [/\byouth\s*(minister|ministry|coordinator|director|pastor|leader)/i, 'Youth Ministry', 'Youth Ministry'],
  [/\bdirector\s*of\s*youth/i, 'Youth Ministry', 'Director of Youth Ministry'],
  [/\byoung\s*adult\s*(minister|ministry|coordinator|director)/i, 'Youth Ministry', 'Young Adult Ministry'],
  [/\blife\s*teen/i, 'Youth Ministry', 'Youth Ministry'],
  [/\bedge\s*(coordinator|director|minister)/i, 'Youth Ministry', 'Youth Ministry'],
  [/\bteen\s*(ministry|minister|coordinator|director)/i, 'Youth Ministry', 'Youth Ministry'],

  // ── Campus Minister ─────────────────────────────────────────────────────
  [/\bcampus\s*minister/i, 'Campus Minister', 'Campus Minister'],
  [/\bcampus\s*ministry\s*(director|coordinator)/i, 'Campus Minister', 'Campus Minister'],
  [/\bdirector\s*of\s*campus\s*ministry/i, 'Campus Minister', 'Campus Minister'],

  // ── Confirmation Leader ─────────────────────────────────────────────────
  [/\bconfirmation\s*(leader|coordinator|director|prep)/i, 'Confirmation Leader', 'Confirmation Leader'],

  // ── Principal ───────────────────────────────────────────────────────────
  [/\bprincipal\b/i, 'Principal', 'Principal'],
  [/\bhead\s*(of\s*school|master)/i, 'Principal', 'Head of School'],
  [/\bassistant\s*principal/i, 'Principal', 'Assistant Principal'],
  [/\bvice\s*principal/i, 'Principal', 'Vice Principal'],
  [/\bheadmaster\b/i, 'Principal', 'Headmaster'],
  [/\bhead\s*of\s*(lower|upper|middle)\s*school/i, 'Principal', 'Head of School'],

  // ── Teacher / Catechist ─────────────────────────────────────────────────
  [/\bteacher\b/i, 'Teacher/Catechist', 'Teacher'],
  [/\bcatechist\b/i, 'Teacher/Catechist', 'Catechist'],
  [/\binstructor\b/i, 'Teacher/Catechist', 'Instructor'],
  [/\bcatechism\b/i, 'Teacher/Catechist', 'Catechist'],

  // ── Administrative Assistant / Secretary ─────────────────────────────────
  [/\badmin(istrative)?\s*(assistant|asst|coordinator|support)/i, 'Administrative Assistant/Secretary', 'Administrative Assistant'],
  [/\bsecretary\b/i, 'Administrative Assistant/Secretary', 'Secretary'],
  [/\bsecretaria\b/i, 'Administrative Assistant/Secretary', 'Secretary'],
  [/\bparish\s*secretary/i, 'Administrative Assistant/Secretary', 'Parish Secretary'],
  [/\breceptionist\b/i, 'Administrative Assistant/Secretary', 'Receptionist'],
  [/\bfront\s*(desk|office)\s*(staff|assistant|coordinator|manager)?/i, 'Administrative Assistant/Secretary', 'Front Office'],
  [/\boffice\s*(assistant|aide|support|staff|coordinator)\b/i, 'Administrative Assistant/Secretary', 'Office Assistant'],
  [/\bexecutive\s*assistant/i, 'Administrative Assistant/Secretary', 'Executive Assistant'],
  [/\bparish\s*office\b/i, 'Administrative Assistant/Secretary', 'Parish Office'],
  [/\bclerical\b/i, 'Administrative Assistant/Secretary', 'Clerical'],
  [/\bregistrar\b/i, 'Administrative Assistant/Secretary', 'Registrar'],

  // ── Office / Business Manager ───────────────────────────────────────────
  [/\bbusiness\s*(manager|administrator|administrator)/i, 'Office/Business Manager', 'Business Manager'],
  [/\boffice\s*manager/i, 'Office/Business Manager', 'Office Manager'],
  [/\bparish\s*(business\s*)?(administrator|manager)/i, 'Office/Business Manager', 'Parish Business Manager'],
  [/\bfinance\s*(director|manager|officer|coordinator|secretary)/i, 'Office/Business Manager', 'Finance Director'],
  [/\bfinancial\s*(secretary|manager|administrator|coordinator)/i, 'Office/Business Manager', 'Financial Secretary'],
  [/\bbookkeeper\b/i, 'Office/Business Manager', 'Bookkeeper'],
  [/\baccountant\b/i, 'Office/Business Manager', 'Accountant'],
  [/\baccounting\s*(clerk|manager|coordinator|specialist)/i, 'Office/Business Manager', 'Accounting Clerk'],
  [/\bcontroller\b/i, 'Office/Business Manager', 'Controller'],
  [/\bcomptroller\b/i, 'Office/Business Manager', 'Comptroller'],
  [/\bpayroll\b/i, 'Office/Business Manager', 'Payroll'],
  [/\bdirector\s*of\s*(operations|administration|finance|parish\s*operations)/i, 'Office/Business Manager', 'Director of Operations'],
  [/\boperations\s*(director|manager)/i, 'Office/Business Manager', 'Operations Director'],
  [/\bchief\s*(financial|operating)\s*officer/i, 'Office/Business Manager', 'CFO'],
  [/\bcfo\b/i, 'Office/Business Manager', 'CFO'],

  // ── Communications ──────────────────────────────────────────────────────
  [/\bcommunications?\s*(director|coordinator|manager|specialist)/i, 'Communications', 'Communications Director'],
  [/\bdirector\s*of\s*communications/i, 'Communications', 'Director of Communications'],
  [/\bmedia\s*(director|coordinator|manager)/i, 'Communications', 'Media Coordinator'],
  [/\bsocial\s*media/i, 'Communications', 'Social Media Coordinator'],
  [/\bmarketing\s*(director|coordinator|manager|specialist)/i, 'Communications', 'Marketing Coordinator'],
  [/\bcommunications\s*(and|&)\s*(marketing|media)/i, 'Communications', 'Communications'],

  // ── Bulletin Editor ─────────────────────────────────────────────────────
  [/\bbulletin\s*(editor|coordinator)/i, 'Bulletin Editor', 'Bulletin Editor'],

  // ── IT / Data / Technology / Webmaster ──────────────────────────────────
  [/\bwebmaster\b/i, 'IT/Data/Technology/Webmaster', 'Webmaster'],
  [/\btechnolog(y|ist)\s*(director|coordinator|manager|specialist|support)/i, 'IT/Data/Technology/Webmaster', 'Technology Director'],
  [/\bit\s*(director|manager|coordinator|specialist|support|admin)/i, 'IT/Data/Technology/Webmaster', 'IT Director'],
  [/\bdirector\s*of\s*(technology|information\s*technology)/i, 'IT/Data/Technology/Webmaster', 'Director of Technology'],
  [/\binformation\s*technology/i, 'IT/Data/Technology/Webmaster', 'IT'],

  // ── Pastoral Associate ──────────────────────────────────────────────────
  [/\bpastoral\s*(associate|assoc|assistant|coordinator)/i, 'Pastoral Associate', 'Pastoral Associate'],
  [/\bpastoral\s*(minister|care|life|outreach|director)/i, 'Pastoral Associate', 'Pastoral Associate'],
  [/\bpastoral\s*admin/i, 'Pastoral Associate', 'Pastoral Associate'],
  [/\bparish\s*life\s*(coordinator|director)/i, 'Pastoral Associate', 'Parish Life Coordinator'],
  [/\blay\s*pastoral/i, 'Pastoral Associate', 'Lay Pastoral Associate'],
  [/\bpastoral\s*leader/i, 'Pastoral Associate', 'Pastoral Associate'],

  // ── Volunteer ───────────────────────────────────────────────────────────
  [/\bvolunteer\s*(coordinator|director|manager)?$/i, 'Volunteer', 'Volunteer'],
  [/^volunteer$/i, 'Volunteer', 'Volunteer'],

  // ── Director of Evangelization ──────────────────────────────────────────
  [/\bdirector\s*of\s*evangelization/i, 'Director of Evangelization', 'Director of Evangelization'],
  [/\bevangelization\s*(director|coordinator)/i, 'Director of Evangelization', 'Director of Evangelization'],
  [/\bdirector\s*of\s*(missionary\s*)?discipleship/i, 'Director of Evangelization', 'Director of Evangelization'],

  // ── Curriculum Coordinator ──────────────────────────────────────────────
  [/\bcurriculum\s*(coordinator|director)/i, 'Curriculum Coordinator', 'Curriculum Coordinator'],

  // ── Diocese Staff ───────────────────────────────────────────────────────
  [/\bdiocese\s*staff/i, 'Diocese Staff', 'Diocese Staff'],
  [/\bdioces(e|an)\s*(director|coordinator|secretary|staff)/i, 'Diocese Staff', 'Diocese Staff'],
  [/\bvicar\s*general/i, 'Diocese Staff', 'Vicar General'],
  [/\bchancellor\b/i, 'Diocese Staff', 'Chancellor'],
  [/\bjudicial\s*vicar/i, 'Diocese Staff', 'Judicial Vicar'],
  [/\bvicar\s*for\s*(clergy|priests)/i, 'Diocese Staff', 'Vicar for Clergy'],
  [/\bepiscopal\s*vicar/i, 'Diocese Staff', 'Episcopal Vicar'],
  [/\bvocation(s)?\s*(director|coordinator)/i, 'Diocese Staff', 'Vocations Director'],

  // ── Administrator ───────────────────────────────────────────────────────
  [/\badministrator\b/i, 'Administrator', 'Administrator'],

  // ── Bible Study / Small Group Leader ────────────────────────────────────
  [/\bbible\s*study/i, 'Bible Study/Small Group Leader', 'Bible Study Leader'],
  [/\bsmall\s*group\s*(leader|coordinator)/i, 'Bible Study/Small Group Leader', 'Small Group Leader'],
  [/\bscripture\s*(study|sharing)/i, 'Bible Study/Small Group Leader', 'Scripture Study'],

  // ── Parishioner ─────────────────────────────────────────────────────────
  [/\bparishioner\b/i, 'Parishioner', 'Parishioner'],

  // ── Parent ──────────────────────────────────────────────────────────────
  [/^parent$/i, 'Parent', 'Parent'],

  // ── Religious / Sister ──────────────────────────────────────────────────
  [/\breligious\b.*\bsister\b/i, 'Religious/Sister', 'Religious/Sister'],
  [/^sister$/i, 'Religious/Sister', 'Sister'],
  [/\bsister\b.*\b(of|servant|dominican|franciscan|mercy|notre|immaculate)/i, 'Religious/Sister', 'Religious Sister'],
  [/\bbrother\b/i, 'Religious/Sister', 'Religious Brother'],
  [/\bmonk\b/i, 'Religious/Sister', 'Religious'],
  [/\bfriar\b/i, 'Religious/Sister', 'Religious'],
  [/\bnun\b/i, 'Religious/Sister', 'Religious/Sister'],

  // ── Parish/Finance Council ──────────────────────────────────────────────
  [/\bfinance\s*(council|committee)\s*(chair|member|president|secretary|liaison)?/i, 'Parish/Finance Council', 'Finance Council'],
  [/\bpastoral\s*council\s*(chair|member|president|secretary|vice)?/i, 'Parish/Finance Council', 'Pastoral Council'],
  [/\bparish\s*council\s*(chair|member|president|secretary|vice)?/i, 'Parish/Finance Council', 'Parish Council'],
  [/\btrustee\b/i, 'Parish/Finance Council', 'Trustee'],

  // ── Music-related → Communications (closest valid PAR role for music ministry) ──
  [/\bmusic\s*(director|minister|coordinator|ministry|leader)/i, 'Communications', 'Music Director'],
  [/\bdirector\s*of\s*(music|liturgical\s*music|sacred\s*music)/i, 'Communications', 'Director of Music'],
  [/\bchoir\s*(director|leader|coordinator)/i, 'Communications', 'Choir Director'],
  [/\borganist\b/i, 'Communications', 'Organist'],
  [/\bcantor\b/i, 'Communications', 'Cantor'],
  [/\bdirector\s*of\s*liturgy/i, 'Communications', 'Director of Liturgy'],
  [/\bliturg(y|ical)\s*(director|coordinator|minister|planner)/i, 'Communications', 'Liturgy Director'],
  [/\bdirector\s*of\s*worship/i, 'Communications', 'Director of Worship'],

  // ── Maintenance/Facilities → Office/Business Manager ────────────────────
  [/\bfacilit(y|ies)\s*(manager|director|coordinator|supervisor)/i, 'Office/Business Manager', 'Facilities Manager'],
  [/\bdirector\s*of\s*(facilities|maintenance|buildings)/i, 'Office/Business Manager', 'Director of Facilities'],
  [/\bmaintenance\s*(director|manager|supervisor|coordinator)/i, 'Office/Business Manager', 'Maintenance Director'],
  [/\bplant\s*manager/i, 'Office/Business Manager', 'Plant Manager'],
  [/\bproperty\s*manager/i, 'Office/Business Manager', 'Property Manager'],

  // ── Other common parish roles → closest PAR match ───────────────────────
  [/\bdirector\s*of\s*stewardship/i, 'Communications', 'Director of Stewardship'],
  [/\bdirector\s*of\s*(development|advancement)/i, 'Communications', 'Director of Development'],
  [/\bsafe\s*environment/i, 'Administrative Assistant/Secretary', 'Safe Environment Coordinator'],
  [/\bsacristan\b/i, 'Volunteer', 'Sacristan'],
  [/\bcustodian\b/i, 'Other', 'Custodian'],
  [/\bhousekeeper\b/i, 'Other', 'Housekeeper'],
  [/\bcook\b/i, 'Other', 'Cook'],
  [/\bnurse\b/i, 'Other', 'Nurse'],
  [/\bcounselor\b/i, 'Other', 'Counselor'],
  [/\blibrarian\b/i, 'Other', 'Librarian'],
  [/\bathlet(ic|ics)\s*(director|coordinator)/i, 'Other', 'Athletic Director'],
  [/\bdean\s*of\s*students/i, 'Other', 'Dean of Students'],
  [/\bschool\s*counselor/i, 'Other', 'School Counselor'],
];

/**
 * Map raw title → [rawTitle, parRole, hubspotJobTitle].
 * PAR role is ONLY populated if it matches a valid canonical role.
 * Unmapped or invalid titles get an empty PAR role — never raw scraped data.
 */
export function mapRole(rawRole: string | null): [string, string, string] {
  const raw = rawRole?.trim() ?? '';
  if (!raw) return ['', '', ''];
  for (const [pattern, parRole, jobTitle] of ROLE_MAP) {
    if (pattern.test(raw)) {
      // Only emit PAR role if it's in the valid set
      return [raw, VALID_PAR_ROLES.has(parRole) ? parRole : '', jobTitle];
    }
  }
  // No regex match — leave PAR role blank, never pass through raw scraped data
  return [raw, '', raw];
}

const MAX_JOB_TITLE_LEN = 80;

/**
 * Clean a raw scraped role string for the "Job Title" CSV column.
 * Strips emails, phone numbers, URLs, "Meet …" bios, and excess whitespace.
 * Caps at MAX_JOB_TITLE_LEN chars so it doesn't break the CSV structure.
 */
export function cleanJobTitle(raw: string | null | undefined): string {
  if (!raw?.trim()) return '';
  let t = raw.trim();
  // Remove emails
  t = t.replace(/\S+@\S+\.\S+/g, '');
  // Remove phone numbers (with optional ext/x)
  t = t.replace(/[\(]?\d{3}[\).\-\s]?\s*\d{3}[\-.\s]?\d{4}(\s*(x|ext\.?)\s*\d+)?/gi, '');
  // Remove URLs
  t = t.replace(/https?:\/\/\S+/gi, '');
  t = t.replace(/www\.\S+/gi, '');
  // Remove "Meet <Name>" / "About <Name>" trailing bio phrases
  t = t.replace(/\b(meet|about|contact)\s+[A-Z][a-z].*$/i, '');
  // Collapse whitespace and trim punctuation remnants
  t = t.replace(/\s+/g, ' ').trim();
  t = t.replace(/^[\s,.\-–—|:;]+|[\s,.\-–—|:;]+$/g, '');
  // If still too long, take the first meaningful sentence/phrase
  if (t.length > MAX_JOB_TITLE_LEN) {
    // Try to cut at a natural break
    const cut = t.slice(0, MAX_JOB_TITLE_LEN);
    const lastSpace = cut.lastIndexOf(' ');
    t = lastSpace > 20 ? cut.slice(0, lastSpace) : cut;
  }
  return t;
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
    let state = company ? getStateValue(company) : '';
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
  'Email',
  'Phone Number',
  'Record ID - Company',
  'Company name',
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
    const [, parRole] = mapRole(r.role);
    const jobTitle = cleanJobTitle(r.role);
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
      jobTitle,                                              // Job Title (cleaned)
      parRole,                                               // PAR - Role (mapped)
      email,                                                 // Email (cleaned)
      r.contact_number ?? '',                                // Phone Number (contact)
      company?.['Record ID'] ?? '',                          // Record ID - Company
      formattedCompanyName,                                  // Company name (Name - ST - ZIP)
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

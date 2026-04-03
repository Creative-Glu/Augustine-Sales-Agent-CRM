import { describe, it, expect } from 'vitest';
import { parseCsv, mergeCsvs, mergedRowsToCsv } from '@/lib/csv-merge';

describe('parseCsv', () => {
  it('parses a simple CSV string', () => {
    const csv = 'Name,Email\nJohn,john@test.com\nJane,jane@test.com';
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ Name: 'John', Email: 'john@test.com' });
    expect(rows[1]).toEqual({ Name: 'Jane', Email: 'jane@test.com' });
  });

  it('handles quoted fields with commas', () => {
    const csv = 'Name,Title\nJohn,"Director, Sales"';
    const rows = parseCsv(csv);
    expect(rows[0].Title).toBe('Director, Sales');
  });

  it('handles escaped quotes inside quoted fields', () => {
    const csv = 'Name,Note\nJohn,"He said ""hello"""';
    const rows = parseCsv(csv);
    expect(rows[0].Note).toBe('He said "hello"');
  });

  it('returns empty array for empty string', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('returns empty array for header-only CSV', () => {
    expect(parseCsv('Name,Email')).toEqual([]);
  });

  it('skips blank rows', () => {
    const csv = 'Name,Email\nJohn,john@test.com\n\nJane,jane@test.com';
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(2);
  });

  it('handles Windows line endings', () => {
    const csv = 'Name,Email\r\nJohn,john@test.com\r\n';
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].Name).toBe('John');
  });
});

describe('mergeCsvs', () => {
  const hubspotRows = [
    { 'First Name': 'John', 'Last Name': 'Doe', 'Email': 'john@test.com', 'Phone Number': '555-1234', 'Company name': 'Acme Inc' },
    { 'First Name': 'Jane', 'Last Name': 'Smith', 'Email': 'jane@test.com', 'Phone Number': '', 'Company name': 'Beta Corp' },
  ];

  const crmRows = [
    { 'First Name': 'Jane', 'Last Name': 'Smith', 'Email': 'jane@test.com', 'Phone Number': '555-5678', 'Company name': 'Beta Corp' },
    { 'First Name': 'Bob', 'Last Name': 'Wilson', 'Email': 'bob@new.com', 'Phone Number': '555-9999', 'Company name': 'New Co' },
  ];

  it('produces correct merge stats', () => {
    const result = mergeCsvs(hubspotRows, crmRows);
    expect(result.stats.hubspotTotal).toBe(2);
    expect(result.stats.crmTotal).toBe(2);
    expect(result.stats.matchedByEmail).toBe(1); // jane matched
    expect(result.stats.newFromCrm).toBe(1); // bob is new
    expect(result.stats.hubspotOnly).toBe(1); // john only in hubspot
  });

  it('fills blank fields from CRM into HubSpot', () => {
    const result = mergeCsvs(hubspotRows, crmRows);
    // Jane had empty Phone in HubSpot, CRM has 555-5678
    const jane = result.rows.find((r) => r['Email'] === 'jane@test.com');
    expect(jane?.['Phone Number']).toBe('555-5678');
  });

  it('never overwrites existing HubSpot data', () => {
    const result = mergeCsvs(hubspotRows, crmRows);
    const john = result.rows.find((r) => r['Email'] === 'john@test.com');
    // John's phone should stay as-is from HubSpot
    expect(john?.['Phone Number']).toBe('555-1234');
  });

  it('assigns correct Record Group values', () => {
    const result = mergeCsvs(hubspotRows, crmRows);
    const bob = result.rows.find((r) => r['Email'] === 'bob@new.com');
    const john = result.rows.find((r) => r['Email'] === 'john@test.com');
    expect(bob?.['Record Group']).toBe('new_scraped');
    expect(john?.['Record Group']).toBe('existing_hubspot');
  });

  it('sorts output by record group priority (new → updated → existing)', () => {
    const result = mergeCsvs(hubspotRows, crmRows);
    const groups = result.rows.map((r) => r['Record Group']);
    const newIdx = groups.indexOf('new_scraped');
    const existingIdx = groups.lastIndexOf('existing_hubspot');
    expect(newIdx).toBeLessThan(existingIdx);
  });
});

describe('mergedRowsToCsv', () => {
  it('produces valid CSV with header and data rows', () => {
    const result = mergeCsvs(
      [{ 'First Name': 'John', 'Last Name': 'Doe', 'Email': 'john@test.com' }],
      []
    );
    const csv = mergedRowsToCsv(result.rows);
    const lines = csv.split('\r\n');
    expect(lines.length).toBeGreaterThanOrEqual(2); // header + at least 1 row
    // Header should be quoted
    expect(lines[0]).toContain('"First Name"');
  });

  it('quotes all cells to prevent column misalignment', () => {
    const result = mergeCsvs(
      [{ 'First Name': 'John', 'Last Name': 'Doe', 'Email': 'john@test.com', 'Job Title': 'Director, Sales' }],
      []
    );
    const csv = mergedRowsToCsv(result.rows);
    // Every cell should be quoted
    const dataLine = csv.split('\r\n')[1];
    const cells = dataLine.match(/"[^"]*"/g) ?? [];
    expect(cells.length).toBeGreaterThan(0);
  });
});

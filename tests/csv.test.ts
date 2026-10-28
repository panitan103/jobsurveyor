import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv, rowsToPreview, fingerprintFor, toCsv, SAMPLE_CSV } from "../lib/csv.ts";

test("parses quoted fields, escaped quotes and embedded commas", () => {
  const rows = parseCsv('a,b\n"x, y","he said ""hi"""\n');
  assert.deepEqual(rows, [
    ["a", "b"],
    ["x, y", 'he said "hi"'],
  ]);
});

test("strips BOM and handles CRLF", () => {
  const rows = parseCsv("\uFEFFa,b\r\n1,2\r\n");
  assert.deepEqual(rows, [
    ["a", "b"],
    ["1", "2"],
  ]);
});

test("preview accepts the sample CSV", () => {
  const { headers, rows } = rowsToPreview(SAMPLE_CSV);
  assert.ok(headers.includes("title"));
  assert.equal(rows.length, 3);
  assert.ok(rows.every((row) => row.ok));
  assert.equal(rows[0].job?.tags[0], "automation");
});

test("preview reports missing title and bad salary", () => {
  const csv = "source,title,salary_min\nmanual,,abc\n";
  const { rows } = rowsToPreview(csv);
  assert.equal(rows[0].ok, false);
  assert.ok(rows[0].issues.some((issue) => issue.field === "title"));
  assert.ok(rows[0].issues.some((issue) => issue.field === "salary_min"));
});

test("preview rejects inverted salary range", () => {
  const csv = "source,title,salary_min,salary_max\nmanual,Engineer,60000,40000\n";
  const { rows } = rowsToPreview(csv);
  assert.ok(rows[0].issues.some((issue) => issue.field === "salary_max"));
});

test("fingerprint is stable and differs by source", () => {
  const a = fingerprintFor({ source: "manual", external_id: "42", title: "X", company: "Y", province: "Z" });
  const b = fingerprintFor({ source: "manual", external_id: "42", title: "X", company: "Y", province: "Z" });
  const c = fingerprintFor({ source: "other", external_id: "42", title: "X", company: "Y", province: "Z" });
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("csv writer escapes special characters", () => {
  const out = toCsv(["a", "b"], [["x,y", 'q"z']]);
  assert.equal(out, 'a,b\n"x,y","q""z"\n');
});

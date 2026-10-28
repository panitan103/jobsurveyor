import test from "node:test";
import assert from "node:assert/strict";
import { publicUrl } from "../lib/redirect.ts";

function request(headers: Record<string, string>, url = "http://0.0.0.0:3100/api/presets") {
  return { headers: new Headers(headers), nextUrl: new URL(url) } as never;
}

test("uses forwarded host and proto behind a proxy", () => {
  const url = publicUrl(
    request({ "x-forwarded-host": "jobsurveyor.panitan.net", "x-forwarded-proto": "https" }),
    "/settings?preset=manufacturing",
  );
  assert.equal(url.toString(), "https://jobsurveyor.panitan.net/settings?preset=manufacturing");
});

test("falls back to the internal host when nothing is forwarded", () => {
  const url = publicUrl(request({ host: "0.0.0.0:3100" }), "/settings");
  assert.equal(url.host, "0.0.0.0:3100");
});

test("takes the first value of a comma-separated forwarded header", () => {
  const url = publicUrl(
    request({ "x-forwarded-host": "jobs.panitan.net, internal", "x-forwarded-proto": "https, http" }),
    "/jobs/1",
  );
  assert.equal(url.toString(), "https://jobs.panitan.net/jobs/1");
});

test("PUBLIC_URL wins when configured", () => {
  process.env.PUBLIC_URL = "https://example.test";
  const url = publicUrl(request({ "x-forwarded-host": "other.test" }), "/settings");
  assert.equal(url.toString(), "https://example.test/settings");
  delete process.env.PUBLIC_URL;
});

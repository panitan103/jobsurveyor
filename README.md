# jobsurveyor

Local-first job scoring and comparison dashboard. Import postings from CSV, score them with
keyword weights you control, and keep your application pipeline in one place.

- No accounts, no AI, no telemetry, no external API calls
- SQLite file on your machine — your data never leaves it
- Dark UI, Thai/English
- Apache-2.0

## What it does

1. You prepare a CSV of job postings (schema v1).
2. The app validates and imports it.
3. Each job gets a weighted coverage score against your keyword weights.
4. You filter by tier, status, and province, compare jobs side by side, and track applications.

Scores are heuristics. They are not employment advice. See `/disclaimer`.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3100
```

First run creates `./data/jobsurveyor.db`. Import the sample:

- Open `/import`
- Download the template (`/api/csv/template`)
- Upload it and press Preview, then Commit

## Production

```bash
npm run build
npm start            # standalone server on :3100
```

Docker:

```bash
docker compose up -d --build
```

The compose file binds `127.0.0.1:3100` and mounts `./data` at `/data`. Put your reverse proxy
(Pangolin, Caddy, nginx) in front if you need remote access.

## CSV

See [docs/csv-schema.md](docs/csv-schema.md) and [SKILL.md](SKILL.md). The importer accepts
`schema_version=1`, reports bad rows before saving, and upserts by `source + external_id`.

## Scoring

`score = 100 × min(1, matched keyword weight / target weight) + title bonus − distance/salary penalties`

Defaults favour automation, robotics, embedded, firmware, PLC, machine vision, ROS, and ROV work.
Edit weights in `/settings`; saving rescoring the whole database. `targetWeight` (default 48) is the
matched weight that counts as a full score.

Base province defaults to Bangkok. Distance is looked up from a built-in province table.

## Scope

This repository deliberately contains **no web scrapers** and no references to any job board.
Data acquisition is the operator's responsibility and must comply with the source's terms and
copyright law. A separate private tool can produce the CSV; this app only consumes it.

## License

Apache-2.0. See [LICENSE](LICENSE).

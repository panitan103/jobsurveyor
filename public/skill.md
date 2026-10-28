# SKILL — Prepare a jobs CSV for jobsurveyor

Use this skill when a user wants to feed job postings into jobsurveyor. Your output is a single
CSV file that the app imports. The app does not fetch data itself and does not know where the data
came from — that is the user's responsibility.

## Rules

1. Only use sources the user owns, subscribes to, or is otherwise authorised to use. Do not suggest
   or perform bulk automated collection from a site whose terms prohibit it.
2. Never invent a posting, salary, company, or URL. If a field is unknown, leave it empty.
3. Keep the original posting URL so the user can verify the source.
4. Write UTF-8 CSV with a header row. Quote any field containing a comma, quote, or newline.
5. Use `schema_version` = `1`.
6. `source` is a short free-form label chosen by the user (for example `manual`, `recruiter`,
   `export`). Do not put credentials or personal data in it.
7. `external_id` is the posting ID from the source when available. It makes re-imports update the
   same row instead of creating duplicates.

## Columns

| Column | Required | Notes |
| --- | --- | --- |
| schema_version | yes | `1` |
| source | yes | short label, no personal data |
| external_id | no | stable ID from the source |
| title | yes | job title as published |
| company | no | employer name |
| url | no | must start with `http://` or `https://` |
| location_text | no | free-text location |
| province | no | province name; drives the distance penalty |
| district | no | district / city |
| salary_min | no | number, THB per month, no commas |
| salary_max | no | number, must be >= salary_min |
| employment_type | no | e.g. Full-time, Contract |
| tags | no | semicolon-separated keywords |
| description | no | duties and requirements, plain text |
| analysis | no | optional human or agent commentary |
| posted_at | no | ISO date `YYYY-MM-DD` |
| notes | no | the user's private note |

## Scoring

The app computes a weighted coverage score from `title`, `tags`, `description`, and
`employment_type`, using weights the user edits in Settings. Put the real, specific keywords in
`tags` — for example `automation;PLC;commissioning` — because tags are weighted equally with the
description text and make the score more explainable.

Distance is looked up from `province` against a built-in table with Bangkok as the base. Unknown
provinces are treated as neutral.

## Minimal example

```csv
schema_version,source,external_id,title,company,url,location_text,province,district,salary_min,salary_max,employment_type,tags,description,analysis,posted_at,notes
1,manual,abc-123,Automation Engineer,Example Manufacturing,https://example.com/jobs/abc-123,Chonburi,Chonburi,Si Racha,35000,55000,Full-time,"automation;PLC;commissioning",Design and commission PLC-controlled lines.,Strong fit on commissioning.,2026-10-01,
```

## Checklist before handing the file over

- Header matches the column list exactly (order is not critical, names are).
- No duplicate rows with the same `source` + `external_id`.
- Salary fields contain digits only.
- URLs open and point at the posting, not a search page.
- No personal data of third parties (recruiter emails, phone numbers) unless the user asked for it.

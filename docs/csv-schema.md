# CSV schema v1

One row per job posting. UTF-8, comma-separated, first row is the header.

| Column | Type | Required | Description |
| --- | --- | --- | --- |
| schema_version | text | yes | `1` |
| source | text | yes | short label for where the row came from (`manual`, `recruiter`, ...) |
| external_id | text | no | stable ID at the source; used for upserts |
| title | text | yes | job title |
| company | text | no | employer |
| url | text | no | original posting URL (`http`/`https`) |
| location_text | text | no | free-text location |
| province | text | no | province; used for distance penalty |
| district | text | no | district |
| salary_min | integer | no | monthly THB |
| salary_max | integer | no | monthly THB, >= salary_min |
| employment_type | text | no | Full-time, Contract, ... |
| tags | text | no | `;` separated keywords |
| description | text | no | duties/requirements |
| analysis | text | no | optional commentary |
| posted_at | date | no | `YYYY-MM-DD` |
| notes | text | no | private note |

## Deduplication

`fingerprint = sha1(source + "|" + external_id)` when `external_id` exists, otherwise
`sha1(title + "|" + company + "|" + province)`. Importing the same row again updates the existing
record and keeps its status, applied date, and notes.

## Errors reported by the importer

- missing `title` or `source`
- non-numeric salary
- `salary_max` < `salary_min`
- `url` without `http(s)://`

Rows with errors are skipped; valid rows in the same file are still imported after confirmation.

## Scoring

`score = 100 × min(1, matched weight / target weight) + title bonus (max 10) − penalties`

`targetWeight` defaults to 48 and is editable in Settings. It is the amount of matched keyword
weight that counts as a full score, so a posting hitting automation + robotics + PLC + commissioning
can reach tier A without matching every keyword in the list.

- keywords in title, tags, or employment type count at full weight; keywords found only in the
  description count at half weight (long job descriptions mention everything)
- distance penalty applies when `province` is known and farther than `maxKm`
- salary penalty applies when `salary_max` is below `minSalary`
- tier: A ≥ 80, B ≥ 65, otherwise C

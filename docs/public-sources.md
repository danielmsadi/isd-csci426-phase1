# Public information provenance

Reviewed: **2026-11-11**. This frontend is an unofficial academic project, not affiliated with or endorsed by LIU. Public information is static; no public rate or curriculum is injected into student/admin records.

## Official sources

All current pages use `https://liu.edu.lb/cms26/public/page.php?slug=` with these slugs:

| Slug | Information used |
| --- | --- |
| about | Institutional history and five schools plus Freshman |
| school-of-engineering | 15 program rows, credits and academic document URLs |
| school-of-business | 10 program rows, credits, document URLs and admissions |
| school-of-pharmacy | Two program rows and credits |
| school-of-education | 19 program rows, credits and documents |
| undergraduate | 16 Arts & Sciences programs, credits and documents |
| freshman-programs | Three pathways, minimum 30 credits |
| requirements | Admissions overview |
| tuition | USD per-credit rates, additional fees, aid/refund summaries |
| contact | Location contact details, general email/telephone |
| overview | Separate official academic policies |

- Homepage and additional named locations: https://liu.edu.lb/cms26/
- Legacy graduate Arts & Sciences table (three programs): https://liu.edu.lb/NewLIU2022/SAS/graduate.php
- Legacy credit comparison: https://syslb.liu.edu.lb/syslbdatadir/Documents/09_University_Catalog.pdf

Every directory entry includes its source URL and verification date. Academic-document URLs were extracted from the official program tables. The external PDFs are offered as original resources; this frontend does not claim to have independently audited every PDF or reproduce a cohort-specific course sequence. `scripts/research-catalog.mjs` is a read-only research helper, not a backend or API.

## Conflicts and limits

- Do not repeat conflicting homepage school/campus counts as statistics.
- Program table credits take precedence over generic introductory prose. Translation is 108; International Business Management is 101.
- Current CS/IT undergraduate tables say 99 credits; older catalog says 100. Detail pages disclose this.
- Legacy Arts & Sciences graduate listings require intake confirmation.
- Generic Engineering/Pharmacy duration text is insufficient to assign a duration to individual programs.
- Tuition uses the dedicated tuition page. Older application/NSSF figures elsewhere differ. All rates are subject to change; a dash means no published value, not zero.
- Tuition labels MS in Applied Math; the legacy academic listing labels Mathematics. Confirm program designation and applicable pricing.
- Freshman pages contain conflicting legacy testing guidance; no obsolete SAT threshold is asserted as current.
- Campus entries are named source listings, not a guarantee of present operations or program availability.
- Portal rules (including four equal installments and the one-time $20 penalty) are ISD requirements, not official LIU policies.

## Media

Illustrative photographs are not LIU campuses/students:

- Patrick s straw: https://unsplash.com/photos/a-fountain-and-buildings-at-a-university-campus-1nKe61Js6BM
- Redd Francisco: https://unsplash.com/photos/man-with-backpack-beside-a-books-9o8YdYGTT64
- Reuse permission: https://unsplash.com/license (reviewed 2026-11-11).

Photographs are loaded remotely with an original SVG fallback. The cedar/book shield, courtyard and abstract location artwork are original, unofficial graphics. No official LIU logo or unlicensed LIU photography is reproduced.

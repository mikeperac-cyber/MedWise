# 90-second English demo script

For a screen recording aimed at a non-Turkish-speaking reviewer (e.g. a US
admissions officer). Record in one take at `npm run dev` /
`npm run preview`, narrating in English over the Turkish UI — the interface
staying in Turkish is the point (see README.en.md), so don't apologize for
it or try to translate it live; just say what you're clicking and why.

| Time      | Screen                                    | Say                                                                                                                                                          |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:12 | `/portfolyo`, hero + English summary block | "This is MedWise — a medication app for people who struggle to read their own prescriptions. WHO reports about half of chronic-disease patients don't stick to treatment, and part of that is not forgetting, it's not understanding. This page measures that gap." |
| 0:12–0:28 | Scroll to readability numbers              | "Ateşman is a published Turkish readability formula, 0 to 100. The technical drug descriptions score 1.65 — essentially unreadable. The plain-language layer scores 77 — easy. That's computed live from the dataset every time this page loads, not hardcoded." |
| 0:28–0:45 | Scroll to data provenance section          | "Here's the part that matters more than the score: 537 of 593 records in this dataset have fabricated identifiers — I generated them with a loop counter to pad the dataset, and I say so on the page. The other 56 were hand-checked against the real WHO ATC index, with citation links, and only those get patient-facing summaries." |
| 0:45–1:00 | Open `/ansiklopedi`, a fabricated record   | "If a record is fabricated, the app doesn't hide it — the identifiers are struck through, and it refuses to generate a plain-language summary from a made-up drug class. Silence is more honest than a confident guess." |
| 1:00–1:15 | Open `/ansiklopedi`, a citation-verified record | "This one is citation-verified — the banner links straight to the WHO registry entry I checked it against, and shows the date." |
| 1:15–1:30 | Back to `/portfolyo`, "known limits" section | "This page also lists what hasn't been done: no real comprehension test yet, though the protocol for one is written and linked. That's the honest state of the project — measured where I could measure, and explicit about what's still unproven." |

**Notes**

- Keep the pace matched to the table — if a section runs long, cut narration
  rather than rushing the click.
- No editing/cuts required; a single continuous take is the point (it shows
  the real running app, not a mockup).

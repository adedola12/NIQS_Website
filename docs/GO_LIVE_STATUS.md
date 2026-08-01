# NIQS website — go-live status

**As at 1 August 2026.** Written to be handed to the secretariat, so it says what
is true rather than what would be comfortable.

---

## Short answer

**The site is ready to go live.** Everything a visitor sees works, is served from
infrastructure that will stay up, and carries real content rather than
placeholders.

Four things are outstanding. **None of them blocks launch** — each one degrades to
something honest rather than something broken — but each is worth closing, and
two need somebody other than the developer.

---

## What is live

| | |
|---|---|
| Website | Vercel, global CDN |
| API | AWS ECS Express Mode, eu-west-3 (Paris) |
| Database | MongoDB Atlas, Paris — same city as the API |
| Uploads | Cloudinary, with S3 + CloudFront provisioned |

The API answers in 0.35–0.65s and has no cold start. It was moved off Render on
31 July after Render suspended the service, which took every piece of live data
off the site until the migration completed.

**Deploys do not drop requests.** Verified by putting 163 consecutive requests
through a full rolling deployment: 163 succeeded, none failed.

### Content published

- **37 chapter records** — every state and the FCT
- **15 chapters with full profiles**, up from 10: Bayelsa, Borno, Delta, Ebonyi,
  FCT, Kaduna, Katsina, Kwara, Nasarawa, Niger, Ogun, Ondo, Osun, Rivers, Zamfara
- **WAQSN** — 21 national officers and zonal coordinators, newly published
- **YQSF** — 13-member executive council
- National Executive Council, Board of Trustees, National Body Chairmen, Past
  Presidents

### Performance

Initial page weight went from ~463 KB to ~98 KB — **4.7× lighter**. The site also
now carries reduced-motion support, which it had none of.

---

## Outstanding

### 1. Membership figures show a fallback — needs one action from ADLM

The homepage reads **"10,000+ Total Members"**. The real figure from the NIQS
statistics API is **14,023**. The integration is built and deployed; it is waiting
on the API key being loaded into AWS Secrets Manager, which is two commands.

Until then the API answers 503 and the site shows its static fallback — which is
the designed behaviour, not a fault. Nothing is broken; the number is just
conservative.

### 2. Two figures cannot come from the portal as things stand

**YQSF under-35 count.** The forum's eligibility is under 35. The statistics API
returns an under-**40** aggregate (`age_limit: 40`) and an under-35 figure cannot
be derived from it. The stat shows a dash until the secretariat supplies the
number, or until NIQS exposes the count at 35.

**WAQSN female-QS count.** The statistics API returns no gender breakdown at all —
the endpoint covers total, grade, chapter, under-40 and new-members-per-year. This
figure cannot be automated without NIQS adding it, and shows a dash meanwhile.

A dash is the right answer here. A wrong membership number on the Institute's own
site would be worse.

### 3. Two chapters should confirm their Ex-Officio ordering

Kwara sent two different people both titled "Ex Officio 2". Borno sent two both
titled "Ex Officio", neither numbered. Executive records are keyed on chapter and
title, so publishing either as supplied would have had the second record overwrite
the first and **a member disappear from the roster silently**.

Both are published as Ex-Officio I and II in the order the chapter's own pack
listed them. That ordering is an assumption and should be confirmed. Nobody is
missing from the site; the numbering may simply be the wrong way round.

Rivers' two submissions also disagree on one member's honorific — the committee
list said "Ms", the later portrait pack says "MR." — so the professional style is
used, matching every other Rivers entry. Worth the chapter confirming.

### 4. Ten portraits are worth re-shooting

Of 75 portraits processed, 63 came through cleanly. Ten are from sources cropped
too tightly for the background removal to find shoulders:

- Zamfara — 4 of 10
- WAQSN — 4 of 21
- Ogun — 1 of 11
- Rivers — 1 of 3

They publish acceptably: the torso now dissolves into the studio backdrop rather
than smearing, which reads as lighting rather than as a fault. But a re-shot
head-and-shoulders photograph would look materially better. **No portrait on the
site is broken** — this is a quality ceiling, not a defect.

Borno's Deputy Chairman, QS Bashir Tanko, is on the roster without a photograph;
the chapter's own document says his picture is still outstanding.

---

## Content gaps that are content, not engineering

Several sections are empty because the database is empty, not because anything is
wrong: **news, jobs, partners, QS firms, exam results, webinars, workshop
materials and journals**. Placeholder entries were deliberately removed rather
than left to masquerade as real content. Each page shows an honest empty state and
will fill as the secretariat loads material through the admin panel.

The chapters map shows 15 of 37 chapters carrying a full profile. The remaining 22
are listed and reachable; they publish as soon as their packs arrive.

---

## Costs

Roughly **$33–37 per month** for the AWS infrastructure, against a $50 ceiling.
The largest single line is the load balancer at about $20; the API container is
about $10.

For comparison, a Render paid plan would be $7/month. The AWS setup buys
co-location with the database in Paris, no cold starts, and room to grow. Worth
the Institute seeing both numbers.

---

## Recommendation

**Launch.** The four open items are visible, understood, and each degrades to an
honest state rather than a broken one. Closing the first — loading the statistics
key — takes minutes and replaces the only figure on the site that is currently
conservative rather than accurate.

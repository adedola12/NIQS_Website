# NIQS website — status report

**As at 6 August 2026.** Prepared for the Management Committee. Written to say
what is true rather than what would be comfortable.

---

## Short answer

**The build is complete. The remaining work is content, and most of it is not
ADLM's to do.**

Every page, every feature and every administrative screen is built, tested and
working. What is left divides cleanly:

- **Two actions on ADLM**, both same-day.
- **Content from the Secretariat and the chapters** — the pace of which sets the
  conclusion date, not engineering effort.

**Proposed conclusion period: end of August 2026**, on the assumption that
chapter material keeps arriving at its recent rate. See *Conclusion period* below
for what that depends on.

---

## One thing to fix before the site is shared widely

**Every page except the homepage currently returns "404 Not Found" if opened
directly.**

This is worth stating plainly because it is easy to miss and easy to fix. Click
through the site from the homepage and everything works — the site is fine.
But if anyone reloads a page, opens a link sent on WhatsApp, or bookmarks a
chapter page, they get an error from the web host.

| | |
|---|---|
| Cause | The domain is served by Apache shared hosting, which does not know the site is a single-page application. It looks on disk for a folder called `/about`, finds none, and returns 404. |
| Verified | Five routes tested on the live domain — `/about`, `/contact`, `/chapters`, `/waqsn`, `/events`. All five returned 404. |
| Status | **Fixed in the code.** A configuration file (`.htaccess`) now ships inside every build and tells Apache to hand those URLs to the application. |
| To close it | Upload the current build to the host. Nothing else. |

**This also means search engines cannot index any page but the homepage**, so
closing it has a direct effect on how the Institute is found online.

### Related: the live site is a day behind

The build currently on the domain predates yesterday's corrections. It does not
yet carry the Contact page changes the Secretariat asked for (the QS Olusegun
Ajalekoko House name, the corrected address, the removal of the WAQSN and YQSF
tabs) or the Cross River chapter.

The domain is **not** connected to automatic deployment — each release is a
manual upload. That is worth a decision from the Committee: pointing the domain
at the deployment platform would make every future correction go live by itself,
within about a minute, with no upload step to forget.

---

## What is live

| | |
|---|---|
| Website | Apache shared hosting (see above) |
| API | AWS ECS Express Mode, Paris |
| Database | MongoDB Atlas, Paris — same city as the API, so queries are fast |
| Uploads | Cloudinary |

**The API is healthy.** Twelve public endpoints checked on 6 August: all
answered, between 0.41 and 1.10 seconds, with no cold start.

**Deployments do not drop requests** — verified by putting 163 consecutive
requests through a full rolling deployment. All 163 succeeded.

**Every public page loads.** All 27 were checked on 6 August; all render, and
after today's fix none has a broken image.

### Content published

| | |
|---|---|
| Chapter records | **37** — every state and the FCT |
| Chapters with a published executive roster | **23 of 37** |
| Executive records across the site | **344** |
| Portraits published | **316** (28 cards await a usable photograph) |
| Past Presidents | 13 |
| Events | 3 |

Rosters cover the National Executive Council, the Board of Trustees, National
Body Chairmen, Past Presidents, WAQSN (21 officers) and YQSF (13).

**Every portrait on the site is put on the same studio backdrop at the same face
size**, so a page of them reads as one photographic session rather than as a
collection of whatever each chapter had to hand.

### Performance

Initial page weight fell from ~463 KB to ~98 KB — **4.7× lighter**. The site also
now supports reduced-motion preferences, which it did not before.

---

## Outstanding

### On ADLM — both same-day

**1. Upload the current build.** Closes the 404 problem above and brings the live
site up to date.

**2. ~~Load the membership statistics key.~~ Done, 6 August.** The key was in the
Institute's own v1 API reference all along. It is loaded, the service is
redeployed, and the site now carries live figures: **14,022 members** in place of
the "10,000+" it showed, and **4,481 registered QS under 40** on the YQSF page in
place of a dash.

### On the Secretariat and the chapters

**3. Fourteen chapters have not sent their material.** They are listed and
reachable on the site; each publishes within a day of its pack arriving.

**4. Twenty-eight cards need a usable photograph.** Six in Katsina and one in
Cross River carry the placeholder deliberately, under the Secretariat's own
instruction of 5 August to use a placeholder wherever quality is poor. The
Katsina six were cut from a printed group poster whose ink crushed the green
channel — no correction recovers data the print never captured. Cross River's is
a low-resolution photograph taken in a car park.

**5. Twenty-nine names need confirming.** A name published without "QS" now
means the person is a probationer. Niger State's entire roster arrived without
prefixes — including its Chairman, who cannot be a probationer — so that chapter
plainly omitted them rather than describing ten unregistered officers. A
checklist has been prepared. Nothing is wrong on screen; these are asking whether
each name should carry QS, Mr or Ms.

**6. Two figures the register must expose.** Confirmed against the Institute's own
v1 API reference on 6 August, in the document and in the live response alike.

*YQSF under-35.* The API aggregates at under **40**; forum eligibility is under
**35**, and an under-40 count cannot be narrowed to one. The page now publishes
the under-40 figure captioned as such — true, just broader than the forum.
Exposing the same aggregate at 35 is the whole remaining job: the site prefers
the narrowest bracket offered and relabels itself, with no release.

*WAQSN female QS.* Section A carries five figures and none distinguishes gender.
This one cannot be derived at all. The site reads a gender breakdown the moment
one exists; until then the Secretariat enters it in the admin panel.

**7. Eight sections are empty because no content has been loaded**: news, jobs,
partners, QS firms, exam results, webinars, workshop materials and journals.
Placeholder entries were deliberately removed rather than left to pass as real
content. Each page shows an honest empty state and fills as soon as the
Secretariat loads material through the admin panel — no developer involvement.

### Separate from this contract

**8. The membership portal** (portal.niqsng.org) is being built by another
company. The integration points from the website's side are specified and ready.

---

## Conclusion period

**Engineering is complete.** No feature remains unbuilt.

| | |
|---|---|
| ADLM's two actions | Same day |
| Chapter rosters | Chapters went from 10 to 23 published between 30 July and 5 August. At that pace the remaining 14 land within 2–3 weeks — **but this depends entirely on chapters sending their packs.** |
| Photographs and name confirmations | Follow the same chapters |
| Section content (news, jobs, etc.) | Secretariat's own pace, through the admin panel; the site does not wait on it |

**Recommended framing: the website is complete and operational at end of August
2026**, with the remaining chapters publishing as their material arrives.

The one thing that could move that date is chapter response. If the Committee
wants a firm date, the effective lever is a deadline to chapters for their
executive lists and photographs — that is the only outstanding item neither ADLM
nor the Secretariat can close alone.

---

## Recommendations to the Committee

1. **Approve pointing the domain at automatic deployment.** It removes the manual
   upload step and the class of problem that produced the 404 issue.
2. **Set a deadline for the fourteen outstanding chapters**, and ask for
   photographs at the same time as names — the two arriving separately is what
   creates the placeholder cards.
3. **Note that eight content sections are ready and waiting**, and decide who at
   the Secretariat owns loading each.

# Cycling Markhor — Full Site Plan (v4, the big one)

**Goal:** cyclingmarkhor.com live as a full 7-page site, hosted free on GitHub Pages: Home, Our Dream, Our Fleet, Our Team, Precious Humans, Where We Ride, Contact — built from the final footage (66 photos, 42 videos, logo pack).

**How to use this file:** lives in the PROJECT ROOT. Nauman works through the phases in order; Claude Code reads this file as its brief. Tutorial boxes (🎓) appear at the moment a concept is used.

**What changed in v4:** the one-pager becomes a 7-page site. New footage folders (`hero-photos-final/`, `hero-videos-final/`, `logo/`) replace the old assets. The jitter fix is already baked in — clips are clean hard cuts now, so the existing crossfade engine gets to do its job. Every photo and video below is assigned a home.

---

## Actual project structure (as it exists)

```
cycling-markhor/
├── PLAN.md                  ← this file
├── index.html, contact.html ← v3 one-pager: the FOUNDATION, we extend it
├── css/style.css            ← palette + type already correct — extend, don't restart
├── js/reel.js               ← the crossfade reel engine — WORKS, reuse it
├── assets/                  ← OLD compressed media from v3 — superseded, delete in Phase 1
├── hero-photos-final/       ← 66 named photos (45 portrait 2048×2560, 21 landscape 2560×1440)
├── hero-videos-final/       ← 42 clips (35 horizontal, 7 vertical) + a poster for every clip
├── logo/tours               ← ACTIVE brand: TOURS logo (dark single-colour artwork with alpha)
├── logo/V1 + logo/V2        ← CAFÉ logo — archive material, do not use, do not touch
└── text/copy.md             ← ALL approved words for all 7 pages
```

**Claude Code — known filename fixes to make when building the pipeline (copy, don't touch originals):**
- `sarfaranga-desert-poster.mp4` is the *video*, misnamed → treat as `sarfaranga-desert.mp4` (its real poster is the .jpg of the same name)
- `hassnain-broq-staris-2*` → "staris" = "stairs" typo, fix in output names
- Logo filenames contain spaces → copy into `assets/brand/` from `logo/tours/`: `logo-dark.png` = resized `CYCLING MARKHOR TOURS LOGO.png` lockup; `logo-light.png` = identical pixels recoloured pure white (alpha preserved); `logo-mark.png` + favicon + apple-touch-icon from the square `TOURS LOGO-01.png`. Reference only the clean copies. `logo/V1`, `logo/V2`, `logo/tours/_source-copies-cafe` are archive — never used

---

## Scope guardrails (read when tempted)

**We ARE building:** the 7 pages above, from existing footage and existing copy, live on cyclingmarkhor.com.

**We are NOT building:** online booking, prices/sizes tables (deliberately withheld for now), email signup, a blog, a separate gallery page, embedded Instagram feeds, analytics. New ideas → `LATER.md`.

**Definition of done:** cyclingmarkhor.com loads on your phone on mobile data, all 7 pages work, the reel plays, and the WhatsApp button reaches Hassu.

**Money note:** GitHub Pages is free on a public repository. No premium subscription needed. The compressed site (~110MB) sits comfortably inside every limit.

---

## Phase 0 — Pre-flight (Nauman, 10 min)

1. Confirm this file + the new `text/copy.md` are in place (they are if you're reading this).
2. Skim the **homepage reel order** in Phase 2 below — the opening two clips decide first impressions. Disagree? Just tell Claude Code to swap.
3. That's it. No renaming, no picking — everything is pre-assigned this time. You veto during the build.

---

## Phase 1 — Foundations (FOR Claude Code)

### Brand palette (unchanged — already in style.css)
- `--charcoal: #2B2E33` · `--stone: #A89F91` · `--snow: #FAFAF8`
- `--turquoise: #2E9E9B` — SIGNATURE accent, sparingly (the Indus in winter)
- `--blossom: #B8A6C9` — whisper accent only

### Typography (unchanged)
Fraunces for headlines, Inter for body. Generous whitespace, calm editorial pacing. Style references: dolkharladakh.com, a travel magazine feature about Skardu — never a rental-shop flyer.

### Logo (TOURS — swapped in during the build)
- Source: `logo/tours/CYCLING MARKHOR TOURS LOGO.png` (lockup) + `...LOGO-01.png` (square mark).
- Header: `logo-light.png` (the lockup recoloured pure white, alpha preserved) over hero media / dark surfaces; `logo-dark.png` (resized lockup as-is) on light surfaces. Render ~150–180px wide, retina-ready, compressed small (~40–75KB each; smooth alpha costs a little more than the old target).
- Favicon + social/OG fallback image: from the square `-01` mark (`logo-mark.png`, `favicon.png`, `apple-touch-icon.png`).
- The logo says "CYCLING MARKHOR TOURS" — that's the site brand now. The CAFÉ artwork (V1/V2) is archive.

### Asset pipeline (run ONCE, before building pages)
- Originals in `hero-photos-final/`, `hero-videos-final/`, `logo/` are NEVER modified and are **git-ignored**. Compressed outputs → `assets/img/`, `assets/vid/`, `assets/brand/`.
- Photos: max 1600px long edge, quality → **≤250KB**; grid thumbnails 800px → ≤120KB.
- **Hero tier:** every image used as a page hero also gets `-1280` and `-2560` long-edge versions (2560 quality-tuned, roughly ≤600KB), served via `srcset` 1280/1600/2560 with `sizes="100vw"` — phones stay light, full-viewport desktop heroes stay sharp. Currently: `brangsas-from-dream-to-sand-1`, `canyon-fleet-4`. (Precious Humans' hero became a 4-tile collage served from the standard 1600px assets — the strained `nauman-and-kids-1` 2560/1280 versions are retired.)
- Videos: H.264, **strip audio**, keep native resolution (1920×1080 / 1080×1920), CRF ~28, `-movflags +faststart`, target **≤2MB per clip** (raise CRF per stubborn clip).
- Posters: ≤150KB.
- Delete the old `assets/photos/` + `assets/videos/` (v3 media) once the new pipeline output is confirmed.

### Shared components
- **Header:** logo + nav — Home · Our Dream · Our Fleet · Our Team · Precious Humans · Where We Ride · Contact. Transparent over hero media, solid charcoal variant elsewhere. Hamburger under ~52rem.
- **Footer** (all pages): WhatsApp `https://wa.me/923554437090` · Call `tel:+923554437090` · `info@cyclingmarkhor.tours` · Instagram `https://instagram.com/cyclingmarkhor.tours` · "Skardu, Gilgit-Baltistan, Pakistan" · © Cycling Markhor.
- **Reel engine** (`js/reel.js`, transition v2): two stacked `<video>` elements; the incoming clip starts ~0.8s BEFORE the current one ends (timeupdate trigger), plays at opacity 0, and only once its frames are confirmed advancing does opacity ramp over ~0.6s ease — while the outgoing clip keeps playing through the whole fade. Never freeze-then-fade; never fade to an unpainted element. If the incoming clip isn't ready at the trigger point, hold the current frame and fade as soon as it is. After handover: pause + recycle the old element, preload the clip after next. `will-change: opacity` + `transform: translateZ(0)` on stacked hero/ambient videos. All compressed clips share one frame rate (29.97 CFR, verified) — mixed fps would make dissolves stutter. Generalised: takes any clip list via `data-clips`.
- **Ambient loop** (NEW): for the three forward+reverse pairs (blind-lake, lake, bridge) play forward clip then its reverse — a seamless palindrome background loop, using the same early-start dissolve as the reel. Muted, autoplay-in-viewport, poster-first.
- **Vertical reel strip** (NEW): the 7 vertical clips render inside phone-frame cards, horizontally scrollable on mobile. IntersectionObserver: play muted when visible, pause when not. `preload="none"`, poster-first.
- **Video card** (NEW): poster + play affordance; tap/hover to play muted inline. Used on Team ("Broko is our hero") and route cards.

### Performance, a11y, SEO — non-negotiables
- Lazy-load ALL below-fold media; `preload="none"` on every non-hero video.
- `prefers-reduced-motion` → posters everywhere, no autoplay.
- Alt text on everything. **Rule: never name the guesthouse where fleet photos were taken — describe generically ("the fleet indoors", "a room in Hussainabad").** Lowercase "broq" as a cultural term (high pasture) is fine.
- Per-page `<title>` + meta description (drafts in copy.md), OG image per page (hero of that page).
- **All internal links RELATIVE** (no leading `/`) — the site must work at `nauman-umair.github.io/cycling-markhor/` before the custom domain lands.
- A tiny custom `404.html`: the `yak-attack.jpg` photo + "Wrong turn. Even the yaks are confused." + link home.

---

## Phase 2 — The seven pages (FOR Claude Code — exact asset map)

Build order (commit after each): **Home → Contact → Our Fleet → Our Team → Precious Humans → Where We Ride → Our Dream.** All words from `text/copy.md` — do not invent copy.

**Reuse rule:** homepage teaser images MAY repeat on their full page; avoid repeats BETWEEN interior pages.

### 1. Home — `index.html` (upgrade existing)
- **Hero reel** (10 clips, this order): `blind-lake` → `broko-and-chocolate-rocks` → `pov-into-shigar` → `khamosh-waterfall` → `sarfaranga-desert` → `hassnain-crossing-bridge` → `shigar` → `cycling-towards-gulabpur` → `riding-towards-kachura` → `view-from-broq`. Poster of clip 1 paints first. Headline/CTA overlay per copy. (`nauman-hassnain-ejju-broko-cycling-towards-kachura` swapped out — it lives only as Our Team's hero now.)
- Status strip (copy unchanged).
- **The story** + photo `nauman-and-hassnain-4` (founders on the rocks by the river).
- **The place** — 6-photo COLLAGE: exact 3-column grid, two photos per column, alternating orientation (verticals 4:5, horizontals 16:9) so all columns end dead level. Col 1: `nauman-in-shigar` (V) + `nauman-with-sarfaranga-in-background` (H). Col 2: `nauman-and-ejju-climbing-to-shigar` (H) + `night-view-from-broq` (V). Col 3: `nauman-broko-and-ejju-2` (V) + `bikes-inside-mountains-inside` (H). Mobile: same order, single column. (`ejju-nauman-in-shigar`, `nauman-ejju-and-broko-in-ghundus-valley`, `surviving-sub-zero` off Home — the latter two remain on Where We Ride / Our Dream.)
- **Explore cards** (NEW — 6 door-cards to the other pages, copy in copy.md): Our Dream `brangsas-from-dream-to-sand-1` · Our Fleet `canyon-fleet-1` · Our Team `le-ejju-and-broko` · Precious Humans `nauman-and-kids-2` · Where We Ride `grizl-pov` · Contact = flat turquoise card, no photo.
- **Moments SLIDESHOW** (full-width, 6 slides in order): `nauman-and-ejju-dangerous-river-crossing`, `yak-attack`, `nauman-with-sarfaranga-in-background-1`, `hassnain-loading-bicycle-in-upper-kachura`, `ejju-broko-and-nauman-riding-towards-sildi`, `nauman-and-kids-1`. One image at a time; each slide is TWO LAYERS — a blurred, darkened cover copy of the same photo filling the stage + the full photo on top with `object-fit: contain`, so the entire photo is always visible (portraits pillarbox on their own blur). Subtle Ken Burns drift on the contained layer only, ~0.8s crossfade every ~3.5s, subtle progress dots, swipe on mobile, preload current+next only, reduced-motion shows the first image static. Stage ~75vh desktop / ~60vh mobile. (`night-view-from-broq` moved to the place collage.)

### 2. Contact — `contact.html` (upgrade existing)
- Headline + body per copy. Four buttons: WhatsApp (big, primary) · Call · Email · Instagram.
- Small footer photo strip: `nauman-and-hassnain-3`.
- ⚠️ `info@cyclingmarkhor.tours` isn't receiving mail until Phase 5c is done — fine to build now, just don't skip 5c.

### 3. Our Fleet — `our-fleet.html`
- Hero: `canyon-fleet-4` full-bleed — cover crop tuned (center 75%) on desktop; contain-on-blur below tablet width so all three Canyons stay visible on phones (the bikes span the full 16:9 width — no cover crop can hold them in a portrait band). Screenshot-verified.
- **"The Canyon fleet"** section header above the lead trio: `canyon-grizl` (Grizl — light sage green, frame bag) · `canyon-grail` (Grail — dark green) · `grand-canyon` (Grand Canyon — red). Colours baked into alt text, verified against the photos.
- **Fleet SLIDESHOW** (contain-on-blur, same component as Home's Moments): `canyon-fleet-1`, `-2`, `-3`, `-5`, `canyon-fleet-inside-broq-1..3`, `canyon-grizl-inside-broq`, `grizl-and-grail`, `grizl-pov`. (`bikes-inside-mountains-inside` lives on Home's collage; `cycling-markhor` on Our Dream.)
- **The whole stable** — text list from copy.md: the three Canyons named + Trek Farley fat bike, Trek 29er, BMC Sportelite 27.5, Merida Scultura, Giant 26", Giant hybrid, GT hybrid, Precision hybrid, Anchor hybrid. No prices, no sizes — deliberate.
- **Support vehicle block:** copy trimmed (school-bus line gone) + compact slideshow of seven: `prado-with-bikes-but-without-logos`, `prado-with-river-and-mountains-in-the-background-1`, `-2`, `cycling-markhor-cafe-back-logo`, `cycling-markhor-cafe-side-logo`, `hassnain-loading-bicycle-in-upper-kachura`, `prado-and-kids`.
- CTA: WhatsApp availability check.

### 4. Our Team — `our-team.html`
- Hero: ambient video `nauman-hassnain-ejju-broko-cycling-towards-kachura` (all four riding), poster fallback — this clip lives ONLY here (swapped out of the Home reel).
- **Founder cards:** Numaan Kashmiri — `nauman.jpg` · Hassnain "Hassu" Balti — poster of `hassnain-going-down-stairs-to-upper-kachura-lake` (vertical action frame).
- **Rider cards:** Ejju (Ejaz) — mini auto-playing card SLIDESHOW (`ejju-1`, `ejju-2`, `ejju-headed-to-masrur-rock`, `ejju-in-prostration-2`; all native 4:5, simple in-card crossfade every ~3.5s, plays only in viewport, reduced-motion shows `ejju-1` static) · Broko (Ghulam) — `le-broko`, and tapping Broko's card plays `broko-is-our-hero.mp4` inline (the easter egg the filename deserves). The two cards are counterparts: Ejju's slideshow, Broko's video.
- **Founders' candids strip:** `nauman-and-hassnain-1`, `-2`, `-3` + short clip `hassnain-and-nauman.mp4`.
- **"Better together" mosaic** — PHOTO-ONLY, 10 tiles, even grid, every tile at native aspect (portraits 4:5 = zero crop). Row 1: `nauman-with-sarfaranga-in-background-1` · `nauman-broko-and-ejju-2` (centre) · `broko`. Rows 2–3: `broko-nauman-and-ejju-climbing-to-shigar`, `ejju-nauman-in-shigar`, `nauman-and-ejju-dangerous-river-crossing`, `nauman-and-ejju-gravel-ride-to-blind-lake`, `nauman-and-ejju`, `nauman-ejju-and-broko-2`. Closing row: `nauman-ejju-and-broko-in-ghundus-valley` full-width at its native 16:9 (the one landscape — full-width keeps the grid even and uncropped). Two-column band: first tile leads full-width so pairs stay even. Cross-page repeats here (river crossing, blind-lake gravel, ghundus, masrur, prostration) are deliberate — Nauman's picks.

### 5. Precious Humans — `our-precious-humans.html`
- Hero: full-bleed 3-TILE COLLAGE, three 4:5 verticals in equal thirds, left to right: `ejju-and-m-hassan` · `hassnain-arsalan-and-broko` · `prado-and-kids`. Phone: the M Hassan tile full-width on top, the other two side by side below. Standard 1600px assets. Per-tile crops screenshot-verified at both widths.
- **Kids block:** contain-on-blur SLIDESHOW (compact), 3 slides in order, NO captions: `nauman-and-kids-1`, `nauman-in-shigar-with-kids`, `grail-in-sildi-with-dog-and-puppy`. Lede opens "Ride through Shigar and Kharmang…" and closes by naming M Hassan and Arsalan up in the hero (caption rescue — exact sentence in copy.md). No photo appears twice on the page. (`nauman-and-kids-2` benched.)
- **"The one who started it all" block** (between kids and friends): `nauman-and-ather` (new photo) at natural aspect — the copy honours Ather Sildi, who introduced Numaan to Hassnain.
- **"And friends" block:** exactly FOUR clips in a mixed collage — phone-frames `petting-cat-near-khamosh-waterfall` + `yaks-in-shigar` flanking two stacked wides `pov-ducks` + `pov-sheep`, even grid. Photo `yak-attack` below. (`cat-near-khamosh-waterfall` + `ejju-and-nauman-petting-cat-near-khamosh-waterfall` benched.)
- **"Moments of stillness" block** (quiet, respectful, generous whitespace): heading + paragraph + ONE photo — `ejju-praying-1` at natural aspect. (`ejju-in-prostration-1` + `labayak-ya-hussain` benched; `ejju-in-prostration-2` lives in Ejju's Team slideshow.) Copy exactly as written — no additions.

### 6. Where We Ride — `where-we-ride.html`
- Hero: ambient palindrome `blind-lake` + `blind-lake-reverse` (the turquoise mirror), title overlay.
- **Route cards** (each: name, blurb from copy.md, media; loop videos muted-in-viewport):
  1. Shigar Valley — `pov-into-shigar.mp4` · photo `nauman-and-ejju-climbing-to-shigar`
  2. Blind Lake (Jarba Tso) — `gravel-near-blind-lake.mp4` · `nauman-and-ejju-cycling-towards-blind-lake.mp4` · photo `nauman-and-ejju-gravel-ride-to-blind-lake`
  3. Upper Kachura — `riding-towards-kachura.mp4`
  4. Sarfaranga Cold Desert — `sarfaranga-climb.mp4` + `sarfaranga-desert.mp4` · photo `nauman-with-sarfaranga-in-background-2`
  5. Khamosh Waterfall — `khamosh-waterfall.mp4`
  6. Masrur Rock — `hassnain-climbing-masrur-rock.mp4` · vertical `ejju-and-hassnain-going-up-masrur.mp4` · photo `ejju-headed-to-masrur-rock`
  7. The suspension bridges — `pov-crossing-bridge.mp4` · palindrome `bridge-reverse` · photo `nauman-and-ejju-dangerous-river-crossing`
  8. Sildi road — `pov-towards-sildi.mp4` · photo `ejju-broko-and-nauman-riding-towards-sildi`
  9. Ghundus & Gol — `exiting-gol.mp4` · photos `broko-in-ghundus`, `nauman-ejju-and-broko-in-ghundus-valley`
  10. Gulabpur — `cycling-towards-gulabpur.mp4`
  11. Winter riding — `pov-frozen-river.mp4`
  12. Sharing the road — `hassnain-pov-crossing-tractor.mp4` + `pov-more-ducks.mp4` (links to Precious Humans)
- Extra ambient available: `lake-reverse`, `shigar.mp4`, `view-from-broq` — use if a section needs breathing room.

### 7. Our Dream — `our-dream.html`
- Hero: `brangsas-from-dream-to-sand-1` full-bleed — the sand drawings sit low in the photo, so the cover crop uses `object-position: center 85%`, screenshot-verified at desktop and phone widths (drawings unmistakably in frame in both).
- The land story + ONE photo: `brangsas-from-dream-to-sand-2` at its natural aspect ratio (no crop) so the drawing is fully visible.
- (Ambient band cut — view-from-broq loop restart was jarring; photos carry the page.)
- **Winter block:** `hassnain-arsalan-and-broko` — copy explains why winters shape the build. (`surviving-sub-zero` benched.)
- **"The cafe already travels" block:** `cycling-markhor` (the misty roof-rack shot — lives only on this page) at natural aspect. Copy trimmed: children line gone.
- **Timeline:** Now → First cutting → Late 2027 (rows in copy.md) + photo `broko-ejju-prado-and-nauman` at natural aspect — riders and Prado fully in frame. (The prado-2 and cafe-logo shots now live in Our Fleet's Prado slideshow.)
- **Standing rule (whole site):** portrait photos in wide containers get natural aspect ratio, contain-on-blur, or a visually verified `object-position` — never a blind cover crop. Verify crops with Chrome screenshots at desktop AND phone widths before calling a section done.
- CTA: follow @cyclingmarkhor.tours + WhatsApp.

### Benched (deliberately unused — list them in LATER.md, do not force in)
`brangsas` extras none · photos: `le-ejju` (off the Ejju card — it's a slideshow now), `nauman-broko-and-ejju-1`, `nauman-ejju-and-broko-1`, `nauman-in-ghundus` (off the Team mosaic), `ejju-in-prostration-1` (off the stillness block), `nauman-and-kids-2` (off the Precious Humans hero), `nauman-and-hassnain-2` (if strip uses 3), `canyon-fleet` spares, `nauman-in-shigar-with-kids` spares · clips: `blind-lake-reverse` (used only as palindrome half), `hassnain-broq-stairs-1`, `hassnain-broq-staris-2`, `lake-reverse`, `cat-near-khamosh-waterfall` + `ejju-and-nauman-petting-cat-near-khamosh-waterfall` (off the friends collage), `labayak-ya-hussain` (off the stillness block), `hassnain-and-nauman` if strip crowds, `broq-timelapse` + `broq-timelapse-reverse` (dropped — too shaky; compressed outputs deleted, originals stay). Benched ≠ deleted — they're tomorrow's refresh content.

---

## Phase 3 — Build (Nauman + Claude Code, the fun part)

1. Terminal → `cd ~/Desktop/cycling-markhor` → `claude` → `/model` → Fable 5, **High** for the build (drop effort later for tweaks).
2. First prompt:

   > Read PLAN.md and text/copy.md. Phase 1 first: fix the noted filenames into the pipeline, run the full asset pipeline (compress all photos, clips, posters, logos into assets/), update .gitignore for the -final originals, delete superseded v3 assets. Commit. Then Phase 2: build the pages in the stated order, using the exact asset map and copy. Commit after each page. Start a local preview when Home is rebuilt.

3. **Test as you go, on your phone too** (ask Claude Code for the local-network preview address): reel crossfades clean · vertical clips autoplay when scrolled into view · text readable over every clip · pages feel fast.
4. Iterate one change at a time; *"commit this progress"* at every "I like this" moment.

> 🎓 **git status** — the "where am I?" command. Shows what's changed since the last commit. Free to run any time, changes nothing. When a session's been long and you've lost the plot: `git status`.

---

## Phase 4 — Publish to GitHub Pages (30 min)

1. > Create a public GitHub repository called cycling-markhor under nauman-umair, push everything (originals stay git-ignored), and enable GitHub Pages from the main branch.

2. First push carries ~110MB — slower than usual, normal. No file exceeds GitHub's 100MB limit (biggest compressed clip ≈ 2MB).
3. Open **https://nauman-umair.github.io/cycling-markhor/** — click through all 7 pages. (Links are relative, so everything works at this address too.)

> 🎓 **remote / origin** — "origin" is just the nickname for your repo's copy on GitHub. **push** = send commits to origin (and Pages republishes automatically — push IS publishing). **pull** = fetch the latest from origin; matters the day a second machine or Hassu joins.

---

## Phase 5 — Domains, redirect, email (45 min + DNS waiting)

### 5a. cyclingmarkhor.com → the site
Namecheap → Domain List → **Manage** cyclingmarkhor.com → **Advanced DNS** → remove parking records → add:

| Type | Host | Value |
|------|------|-------|
| A Record | @ | 185.199.108.153 |
| A Record | @ | 185.199.109.153 |
| A Record | @ | 185.199.110.153 |
| A Record | @ | 185.199.111.153 |
| CNAME | www | `nauman-umair.github.io.` |

Then tell Claude Code: *"Set the custom domain cyclingmarkhor.com on GitHub Pages and add the CNAME file."* Once the domain resolves: repo Settings → Pages → **Enforce HTTPS** (cert can take up to 24h — greyed out means come back tomorrow).

### 5b. cyclingmarkhor.tours → redirect
Namecheap → Manage cyclingmarkhor.tours → set a **Permanent (301) URL redirect**: `@` and `www` → `https://cyclingmarkhor.com`. (The Instagram handle @cyclingmarkhor.tours still works independently — handles aren't DNS.)

### 5c. info@cyclingmarkhor.tours → your inbox
Namecheap → Manage cyclingmarkhor.tours → **Email Forwarding**: `info` → your personal email. Accept the MX-record change it asks for. Send yourself a test from another account. **Do this before announcing the site** — the address is printed on the Contact page.

---

## Phase 6 — Launch checks

- [ ] cyclingmarkhor.com on your phone **on mobile data** — all 7 pages
- [ ] Reel loops through all 10; crossfades smooth (the jitter stays dead)
- [ ] Vertical clips play in the phone-frames as you scroll
- [ ] cyclingmarkhor.tours redirects
- [ ] WhatsApp button → test message to Hassu (that's also the launch announcement 🎉)
- [ ] Call button dials · Instagram opens the profile · email test received
- [ ] The "moments of stillness" section reads with the dignity it deserves — final eye check
- [ ] *"commit and push — full site launch complete."*
- [ ] Screenshot the live homepage. First one goes to the team in Skardu.

---

## This month (not launch day) → LATER.md
Prices & sizes when ready · booking flow · Instagram feed embed · reviews/testimonials · Urdu snippets · Google Search Console + a sitemap.xml · seasonal photo rotations from the benched list · cafe construction diary on Our Dream.

## If things go wrong
- **Reel stutter:** which clips, which device — preload timing, usually.
- **iPhone autoplay refuses:** `muted` + `playsinline` attributes; Low Power Mode also blocks autoplay — that's the phone, not the site.
- **Push rejected (big files):** an original leaked past .gitignore — tell Claude Code to find and untrack it.
- **Pages 404s under the subpath:** an absolute link sneaked in — tell Claude Code to make all paths relative.
- **Domain dead hours later:** review the A records together — typo, usually.
- **Stuck 30+ min:** close the laptop, walk. It launches tomorrow. Still no hard deadline.

# Cycling Markhor — Launch Day Plan (v3, matched to actual project folder)

**Goal:** cyclingmarkhor.com live today with a landing page + contact page, hosted on GitHub Pages. Hero is a 9-clip video reel; 15 hero photos feed the story, seasons, and a new "Moments" photo band.

**How to use this file:** this file lives in the PROJECT ROOT (next to the folders, not inside text/). Work through the phases in order — Claude Code reads this as its brief. Tutorial boxes (🎓) explain git concepts at the moment you use them.

**What changed in v3:** plan now matches the real folder structure and file naming (hero-photos/, hero-videos/, underscored names); the 15 hero photos are factored in — story photo, seasons photos, and a "Moments" grid on the landing page.

---

## Actual project structure (as it exists)

```
cycling-markhor/
├── PLAN.md              ← this file (move it here from text/ if needed)
├── hero-photos/         ← 15 photos, IMG_xxxx.jpg names (fine as-is)
├── hero-videos/         ← hero_01.mp4 … hero_09.mp4 + hero_01_poster.jpg … hero_09_poster.jpg
└── text/
    └── copy.md          ← approved site copy
```

No renaming required. Claude Code works with these names as they are.

---

## Scope guardrails (read when tempted)

**Today we ARE building:** landing page (video reel hero + story + seasons + Moments photo grid), contact page, live on the real domain.

**Today we are NOT building:** a separate gallery page (the Moments grid is the compromise — 6 photos, one row-set, done), email signup, booking system, socials links, extra pages. New ideas → `LATER.md`.

**Definition of done:** cyclingmarkhor.com loads on your phone and the reel plays.

---

## Phase 0 — Pre-flight (15 min)

1. Confirm `PLAN.md` is in the project root.
2. **Order check on the reel:** posters make this easy — flick through hero_01 → hero_09 posters and confirm 01 and 02 are your two STRONGEST clips (most visitors decide in the first few seconds; hero_01 opening on the turquoise river is a great start). If any need reordering, don't rename by hand — just tell Claude Code, e.g. *"swap hero_04 and hero_02 in the play order."*
3. **Pick your Moments six:** choose the 6 photos for the Moments grid (variety beats similarity — e.g. the suspension bridge, the yaks, a raised-bike victory shot, riders in landscape, the bike rack, a people shot). Note the IMG numbers — you'll tell Claude Code during the build. Undecided? Skip it; you can pick live during Phase 2.

---

## Phase 1 — Design brief (FOR Claude Code)

**Claude Code: this is the design specification. Follow it closely.**

### Brand palette
- `--charcoal: #2B2E33` — primary text, dark sections (the mountains)
- `--stone: #A89F91` — warm neutral, secondary text
- `--snow: #FAFAF8` — backgrounds
- `--turquoise: #2E9E9B` — SIGNATURE accent. Links, buttons, key highlighted words. Sparingly, so it lands. (The Indus in winter.)
- `--blossom: #B8A6C9` — whisper accent only: hover states, small details. (Apricot blossom.)

### Typography
- Headlines: elegant serif (Fraunces, Playfair Display, or Cormorant — Google Fonts) — editorial, travel-magazine feel
- Body: clean sans-serif (Inter or Source Sans 3)
- Generous line-height and whitespace. Calm pacing.

### Style references
- dolkharladakh.com — story-led structure, place-first narrative
- broq.pk — boutique Skardu resort, minimal luxury, calm
- A travel magazine feature about Skardu, not a rental-shop flyer.

### HERO VIDEO REEL — the centrepiece

**Concept:** 9 clips (3–5s each) play full-viewport in sequence, 01→09, then loop. One continuous film of Skardu, not a slideshow.

**Source files:** `hero-videos/hero_01.mp4` … `hero_09.mp4`, posters `hero-videos/hero_01_poster.jpg` … `hero_09_poster.jpg`.

**Compression (FIRST, before any HTML):**
- ffmpeg all 9: H.264, **strip audio entirely**, max 1920px wide, CRF ~28, `-movflags +faststart`
- Target **under ~1.5MB per clip** (sources are 4–6MB). Any clip stubbornly over 2MB → raise its CRF.
- Compress posters to under 150KB each.
- Move untouched originals to `hero-videos/originals/` (git-ignored); compressed outputs live in an `assets/` structure of your choosing.

**Playback engine:**
- Two stacked `<video>` elements taking turns: while A plays, B silently loads the next clip; on A's `ended`, **crossfade** (~0.5s opacity) to B. Cycle 01→09→01 forever.
- `muted`, `playsinline`; preload ONLY current + next, never all 9.
- First paint: `hero_01_poster.jpg` shows instantly while hero_01.mp4 loads.
- `prefers-reduced-motion`: poster only, no videos.
- Autoplay blocked / data-saver: graceful poster fallback.
- Headline/subline/CTA overlay a subtle darkening gradient — text must stay readable over ALL 9 clips.

### PHOTOS — hero-photos/ (15 images)

- Compress every used photo for web (max 1600px wide, under ~250KB; thumbnails for the grid can be smaller). Originals untouched.
- **Story section:** 1 photo — a people/riders shot, editorial placement beside or beneath the text.
- **The place (seasons) section:** 4 photos — landscape-led, seasonal variety where possible.
- **Moments band (NEW):** responsive grid of 6 photos between the seasons section and footer. 3×2 on desktop, 2×3 or single column on mobile. No lightbox, no captions, no separate page — just a beautiful, lazy-loaded grid. Section heading comes from copy.md.
- Nauman will specify which IMG numbers go where during the build; if he hasn't, propose a selection (favour variety: bridge, animals, action, landscape, people) and let him swap.

### Technical requirements
- Plain HTML + CSS + vanilla JavaScript. No frameworks, no build step.
- Two pages: `index.html`, `contact.html`.
- Mobile-first responsive.
- WhatsApp links: `https://wa.me/923554437090`
- Shared header (logo text + two nav links) and footer.
- Lazy-load everything below the fold.

### Page structure — index.html
1. Hero: video reel + headline, subline, WhatsApp CTA
2. Status strip: "Bike rentals — open now · Mountain cafe & brangsas — coming late 2027"
3. The story (two short paragraphs + 1 photo)
4. The place / seasons (copy + 4 photos)
5. **Moments** (6-photo grid)
6. Footer: WhatsApp, location line, © Cycling Markhor

### Page structure — contact.html
1. Short headline + WhatsApp explanation
2. Big WhatsApp button
3. Location line (Skardu, Gilgit-Baltistan, Pakistan)
4. Same footer

All copy is in `text/copy.md`.

---

## Phase 2 — Build (2–3 hrs)

1. Terminal → `cd` into the project folder → `claude`.
2. First prompt:

   > Read PLAN.md. Set this folder up as a git repository. Then: (1) compress the hero videos, posters, and photos exactly per the brief, (2) build the landing page with the hero video reel and Moments grid, (3) build the contact page. Copy is in text/copy.md. Then start a local preview.

3. **Test the reel hard first:**
   - Smooth crossfades, or flash/stutter between clips?
   - Autoplays on your phone? (Ask Claude Code how to open the preview on your phone over local network — iPhones need `playsinline`.)
   - Text readable over ALL 9 clips, including the brightest?
   - Page feels fast?

4. **Then place your photos:** *"Use IMG_3581 for the story section. Seasons: IMG_8564, IMG_7706, IMG_0048, IMG_3889. Moments grid: IMG_4186, IMG_8635, IMG_3852, IMG_7692, IMG_3305, IMG_4113."* (Your picks — these are examples.) Swap freely until it feels right.

5. **Iterate, one change at a time.** Commit at every "I like this" moment: *"commit this progress."*

> 🎓 **commit** = a named snapshot of the whole project. A save point in a video game. Later change ruins everything? "Go back to the last commit." Commit often — it's free.

---

## Phase 3 — Publish to GitHub Pages (30 min)

1. > Create a GitHub repository called cycling-markhor under my account, push the project to it (excluding video originals), and enable GitHub Pages so the site is live.

> 🎓 **push** = uploading your commits from laptop to GitHub. With GitHub Pages, every push updates the live site automatically — push IS publishing. First push carries ~15MB of media, so it'll be slower than usual. Normal.

> 🎓 **pull** = the opposite: downloading the latest commits FROM GitHub. Not needed today; essential the day you or Hassnain work from a second machine: **pull → work → commit → push.**

2. Open the `<username>.github.io/cycling-markhor` URL. Watch your reel play on the live internet.

---

## Phase 4 — Connect cyclingmarkhor.com (30 min + waiting)

### 4a. Namecheap
Domain List → **Manage** cyclingmarkhor.com → **Advanced DNS** → delete parking records → add:

| Type | Host | Value |
|------|------|-------|
| A Record | @ | 185.199.108.153 |
| A Record | @ | 185.199.109.153 |
| A Record | @ | 185.199.110.153 |
| A Record | @ | 185.199.111.153 |
| CNAME | www | `<your-github-username>.github.io.` |

(GitHub's Pages IPs — verify against GitHub's docs if anything fails.)

### 4b. GitHub
> Configure GitHub Pages for this repository to use the custom domain cyclingmarkhor.com, and make sure a CNAME file exists in the repo.

### 4c. Wait, then secure
- DNS propagation: 5 minutes to a few hours. Tea.
- Once the domain loads: repo Settings → Pages → **Enforce HTTPS** (cert can take up to 24h; greyed out = come back tomorrow).

---

## Phase 5 — Launch checks (30 min)

- [ ] cyclingmarkhor.com loads on your phone **on mobile data**
- [ ] Reel plays and loops through all 9 on phone AND laptop
- [ ] Crossfades smooth on mobile data, not just wifi
- [ ] Moments grid loads as you scroll (lazy-loading working)
- [ ] WhatsApp button opens a chat with Hassnain — send him a test message; it doubles as the launch announcement 🎉
- [ ] Text readable over every clip
- [ ] Both pages right at phone and laptop widths
- [ ] Final commit: *"commit and push — launch day complete."*

---

## This week (not today)

- Watch reel performance for real visitors on slow connections; consider a lighter 720p mobile set if needed
- The 4 unused photos + full gallery page idea → `LATER.md`
- Socials sorted → footer icons; Instagram swap done → announce the site there

---

## If things go wrong

- **Reel stutters / white flash between clips:** tell Claude Code which clips, which device — usually preload timing.
- **iPhone won't autoplay:** check `muted` + `playsinline` attributes. #1 cause.
- **Broke, cause unknown:** describe exactly what you did and what you see.
- **Really broken:** "revert to the last commit where things worked."
- **Domain dead after a few hours:** ask Claude Code to review the DNS records with you — typo in an A record, usually.
- **Stuck 30+ min:** close the laptop, walk. It launches tomorrow. Still no hard deadline.

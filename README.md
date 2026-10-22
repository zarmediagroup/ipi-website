# In the Public's Interest (IPI) — website

Static marketing site for **In the Public's Interest (IPI)**, a non-profit in Athlone, Cape Town providing
free home-based nursing care, private care placements and community feeding schemes.

Live site: <https://inthepublicsinterest.org/>
Hosting: GoDaddy cPanel (shared Apache). This repo is the source of truth; the site is deployed by uploading
the repo contents to `public_html`.

Built and maintained by [ZAR Media Group](https://zarmediagroup.com/).

## Structure

```
.
├── index.html            Single-page site (hero, services, service areas, private care, carousel, FAQ, contact)
├── 404.html              Branded not-found page (referenced by ErrorDocument in .htaccess)
├── .htaccess             HTTPS + www→apex redirects, 404, compression, caching, MIME types, security headers
├── robots.txt            Crawl rules — search engines and answer engines (AI assistants) explicitly allowed
├── sitemap.xml           URL + image sitemap
├── llms.txt              Plain-language summary for AI answer engines (AEO)
├── site.webmanifest      PWA / install metadata
├── humans.txt            Credits
├── assets/
│   └── styles.css        All site styling (no build step)
└── images/               Photography and logo
```

There is **no build step and no dependencies**. Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

## Deploying to GoDaddy cPanel

1. Zip the repo contents (**not** the repo folder itself) — everything above except `README.md` and `.git/`.
2. cPanel → File Manager → `public_html`.
3. Upload the zip, then **Extract** it there.
4. Confirm `.htaccess` came across — cPanel's File Manager hides dotfiles until you enable
   *Settings → Show Hidden Files*.

After a deploy that changes content, resubmit `sitemap.xml` in Google Search Console.

## SEO / AEO / GEO

**SEO**

- Canonical URL, `hreflang` (`en-za` + `x-default`), robots and Googlebot directives with
  `max-snippet:-1` and `max-image-preview:large`.
- Open Graph + Twitter card tags, including `og:image:secure_url`, dimensions and alt text. The OG image is
  `ipi-community-wellness-day-cape-town.jpg` (1080×571, close to the 1.91:1 social ratio).
- Descriptive, keyword-bearing image filenames and alt text on every image; explicit `width`/`height` on all
  images to prevent layout shift; `loading="lazy"` + `decoding="async"` below the fold and
  `fetchpriority="high"` on the hero.
- Fonts moved out of a render-blocking CSS `@import` into `<head>` with `preconnect` — a real
  Core Web Vitals win on first paint.
- URL + image sitemap, compression, long-lived cache headers, www→apex canonicalisation.
- The previous catch-all `RewriteRule ^ index.html` was removed: on a single static page it returned HTTP 200
  with identical content on every nonexistent URL (soft 404 / duplicate content). Unknown paths now return a
  real 404 and `404.html`.

- Title trimmed from 100 to 48 characters and the meta description from 294 to 148, so neither is
  truncated in the SERP. The long versions were being cut off mid-phrase.
- `404.html` loads its CSS and images from root-absolute paths. `ErrorDocument` serves the file while the
  browser keeps the *requested* URL, so relative paths would have resolved against the bad path and the
  404 page would have rendered unstyled.

**AEO (answer engines / AI assistants)**

- One consolidated JSON-LD `@graph` instead of disconnected blocks, with linked `@id`s:
  `NGO` + `MedicalOrganization`, three `Service` entities, `WebSite`, `WebPage`, `ImageObject`,
  `ImageGallery` (all nine photos with captions), `FAQPage` and an `ItemList` of
  `SiteNavigationElement`s. A `BreadcrumbList` was deliberately **not** used: a single-page site has
  no hierarchy, so a trail of `#anchors` earns no rich result and misstates the structure.
- `speakable` specification on the `WebPage` for voice assistants.
- `FAQPage` with 8 Q&As. **Every question and answer in the schema is also visible on the page** — Google
  requires this, and assistants quote the visible copy.
- `robots.txt` explicitly allows GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot,
  Google-Extended, Applebot-Extended, Amazonbot, meta-externalagent, DuckAssistBot and others. IPI is a
  public-benefit non-profit — being cited by an assistant is the goal, not a leak.
- `llms.txt` gives answer engines a clean, quotable summary: services, what is free vs paid, service areas,
  contact numbers and key facts.

**GEO (local / geographic)**

- `geo.region`, `geo.placename`, `geo.position`, `ICBM` and Dublin Core coverage tags.
- `MedicalOrganization` with `address`, `GeoCoordinates`, `hasMap`, and `areaServed` covering all 14 named
  suburbs plus a 12 km `GeoCircle` around Athlone.
- Suburb names carried through the visible copy, image alt text and FAQ answers, not only the markup.

## Photography

The gallery and work showcase use nine photographs supplied by IPI in October 2026, renamed to descriptive
SEO filenames.

"Work we've done" is a **carousel**: a flex track with CSS `scroll-snap`, so it scrolls natively with a
swipe, a trackpad, or the keyboard once focused — no library. It shows three photos at a time on desktop,
two on tablet, one on a phone.

Controls: prev/next arrows top-right of the heading, round dots and a live `Slide N of M` counter below.
Arrows disable at the two ends rather than wrapping. The counter is `aria-live="polite"`, so screen
readers hear the slide change. There is no auto-advance: it would need a pause control to satisfy
WCAG 2.2.2, and it tends to fight the reader.

Tiles per view comes from the stylesheet and the JS *measures* it rather than repeating the breakpoints,
so the dots regroup themselves into pages — 3 on desktop, 5 on tablet, 9 on a phone — and the counter
follows. Positions are read with `getBoundingClientRect`, not `offsetLeft`, because the tiles are
`position:relative` and so are not offset-positioned against the track.

Two photos from the original build — `ipi-community-health-outreach-athlone.jpg` and
`ipi-high-school-feeding-scheme-outreach.jpg` — are no longer shown on the page. They are kept in `images/`
and still uploaded, because the previous `sitemap.xml` listed them and Google may have indexed those image
URLs; removing the files would turn those into 404s. They are no longer listed in the sitemap.

## Responsive & accessibility

Tested by loading the page into fixed-width iframes (media queries evaluate against the iframe
viewport, so this is a true test) at 320, 360, 390, 414, 480, 600, 641, 768, 900, 1024, 1280, 1440
and 1920 px. At every width: no horizontal overflow, the nav never collides with the brand, and the
carousel shows 1 / 2 / 3 tiles with its dots regrouped to 9 / 5 / 3.

Two real faults were found and fixed:

- **Carousel dots wrapped to two rows on every phone size.** Nine dots at a fixed 33 px need 369 px of
  row; a 320 px phone offers 273 px. They now share the row with `flex:1 1 0` below 640 px.
- **Tap targets under the WCAG 2.2 SC 2.5.8 minimum of 24x24 px.** The carousel dots were 33x13, the
  desktop nav links 17 px tall, the footer and contact link groups 16 px, and the footer "FAQ" link
  only 22 px wide. All padded out. Links sitting *inline inside a sentence* are explicitly exempt from
  2.5.8, so FAQ answer copy and body prose were deliberately left alone — padding those would have
  broken line spacing for no compliance gain.

The mobile menu was re-checked after the nav padding change: it opens, closes, reports `aria-expanded`
correctly and gives 46 px link targets.

## Known gaps

- **No analytics.** No GA4 / Search Console verification tag is installed yet.
- **No `sameAs` links.** If IPI has Facebook / Instagram / LinkedIn pages, add them to the `NGO` node in the
  JSON-LD — it is one of the strongest entity signals available and is currently missing.
- **No NPO registration number.** If IPI has one, add it as `identifier` on the organisation node and in the
  footer; it materially helps trust signals for a non-profit.
- **No opening hours.** `openingHoursSpecification` was left out rather than guessed.
- **Logo is 819×557**, not square, so it is a poor PWA/favicon icon. A square 512×512 version would be better.

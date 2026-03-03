# CMPUT 275 Study Hub

A redesigned static study site for CMPUT 275 summaries, hosted on Cloudflare Workers.

## Deploy

```bash
npm run deploy
```

Deploys to the Cloudflare Worker `cmput275summary`.

## Project Structure

- `public/` — static site assets
- `public/styles.css` — full design system (auto light/dark)
- `public/site.js` — theme preference, slides filtering, TOC + reading progress
- `public/slides/index.html` — grouped lecture hub with search/filter
- `public/slides/*.html` — manually curated lecture summary pages (canonical)
- `summaries/` — source text summaries used to curate slide pages

## Canonical Slide Pages

1. `public/slides/course-intro.html`
2. `public/slides/shell-bash-basics.html`
3. `public/slides/command-line-args-and-2d-arrays.html`
4. `public/slides/c-programming-foundations.html`
5. `public/slides/pointers-arrays-strings.html`
6. `public/slides/structs-and-adts.html`
7. `public/slides/dynamic-memory-management.html`
8. `public/slides/mutation-and-double-pointers.html`
9. `public/slides/separate-compilation-and-headers.html`

## Notes

- Old slide filenames were intentionally retired (no redirects).
- Use the Slides hub for ordered navigation by track.

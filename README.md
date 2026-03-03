# CMPUT 275 Summary

AI-generated study summaries for CMPUT 275, hosted as a static site on Cloudflare Workers.

## Deploy

```bash
npm run deploy
```

Deploys to the Cloudflare Worker `cmput275summary`.

## Structure

- `public/` — Static site (HTML, CSS)
- `public/slides/` — Each slide summary is a manually maintained HTML page
- `summaries/` — Source `.txt` files (reference only; slide pages in `public/slides/` are the canonical content)

To add a new slide summary: create `public/slides/<slug>.html` and add an entry to `public/slides/index.html` in the slides grid.
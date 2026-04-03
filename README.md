# leonard.work

A static tool hub hosted on [Cloudflare Pages](https://pages.cloudflare.com/).

## Pages

- **`/`** — Navigation hub
- **`/sg.html`** — Singapore tools directory
- **`/pdf.html`** — Client-side PDF toolbox (merge, split, compress — nothing uploaded)
- **`/maid-salary.html`** — FDW salary calculator (A4 printable)
- **`/maid.html`** — FDW tools hub
- **`/rental.html`** — Singapore rental guide
- **`/kids-education/`** — Kids education mini-sites

## Local Development

No build step. Open any `.html` file directly or use a local server:

```bash
npx serve .
```

## Deployment

Deployed to Cloudflare Pages with no build command — the repo root is served as-is.

## Notes

- `.gitignore` uses an allowlist: add a `!path` rule when committing new files.
- PDF processing runs entirely in the browser; no files leave the client.
- Theme toggle (auto / light / dark) is stored in `localStorage`.

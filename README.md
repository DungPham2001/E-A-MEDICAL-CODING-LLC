# E&A Medical Coding LLC — Landing Page

Static site: plain HTML + CSS + vanilla JS. No build step, no dependencies.

## Files

```
index.html       # All page content
css/styles.css   # Design tokens (colors, radius…) at the top + all styles
js/main.js       # Mobile menu, header shadow, FAQ, scroll reveal, contact form
images/          # Photos (WebP)
favicon.*, apple-touch-icon.png, icon-*.png, site.webmanifest   # Icons for all browsers
```

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # http://localhost:8000
```

## Contact form

There is no backend: submitting opens the visitor's email client addressed to the company email.
To collect submissions server-side (e.g. Formspree), set the form's `action`/`method`
and remove the `mailto` logic in `js/main.js`.

## Deploy

Upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, cPanel…).

## Images

Photos in `images/` are from [Unsplash](https://unsplash.com) (free for commercial use under the Unsplash License),
saved locally as WebP. Replace them with the company's own photos anytime — keep the same file names, or update
the `src` in `index.html`.

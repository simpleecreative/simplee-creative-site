# Simplee Creative — Website

One-page studio site. Pure HTML/CSS/JS — no build step, no frameworks. Open `index.html` or host the `website/` folder anywhere (Netlify, Vercel, GitHub Pages, shared hosting).

## Structure
- `index.html` — all content and sections
- `css/style.css` — design system (brand tokens at the top of the file)
- `js/main.js` — animations, menu, accordion, form
- `assets/` — web-optimized copies of brand, client, and team images (originals stay in the parent folders)

## Things you may want to edit
- **Stats** (50+ brands, 120+ projects, 24hr response) — in the Process section of `index.html`. Placeholder numbers; make them true.
- **Testimonials** — placeholder quotes marked with generic attributions. Swap in real ones.
- **Social links** — the Facebook/Instagram/LinkedIn icons in the Contact section point to `#`. Add real URLs.
- **Founder titles** — both listed as "Co-Founder"; adjust if you want specific roles.
- **Work card names** — guessed from logo filenames (Corn Belt, North Star, PAT, Motion Server, The Forge). Correct as needed.

## Contact form
The form validates client-side, then opens the visitor's email app with a pre-filled message to `dylanlspies@gmail.com` (no backend needed). For a proper submit-in-page form, create a free [Formspree](https://formspree.io) endpoint and replace the `mailto:` logic at the bottom of `js/main.js`.

## Brand tokens
Ink `#0D0D0F` · Surface `#191919` · Cyan `#43C6EC` · Yellow `#FAED25` · Bone `#F4F4F1`
Type: Syne (display) + Manrope (body), loaded from Google Fonts.

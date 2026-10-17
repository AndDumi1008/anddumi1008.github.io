# anddumi1008.github.io

Personal site of Andrei Dumitrescu, software engineer in Timișoara. Live at <https://anddumi1008.github.io/>.

Plain HTML and CSS, no framework and no build step. GitHub Pages serves the `main` branch as is.

## Layout

| Path | What it is |
| --- | --- |
| `index.html` | The whole site: hero, work, experience, stack, contact |
| `css/styles.css` | All styles. Design tokens are at the top of the file |
| `js/site.js` | Interactions: slide-to-open gate, experience veil, stack tag filter, scroll progress, confetti. Without JS everything is simply visible |
| `assets/andrei-*.{webp,jpg}` | Profile photo, 480 and 960 px |
| `assets/Andrei_Dumitrescu_CV.pdf` | Downloadable CV, linked from the hero and the contact section |
| `assets/og.png` | Open Graph preview image (1200×630) shown when the link is shared |
| `favicon.svg` | Tab icon |
| `404.html` | GitHub Pages picks this up automatically for missing paths |

## Editing

- **Content** lives in `index.html`. Each project and role is one `<article class="row">`.
- **Colors and type** are CSS custom properties in the `:root` block of `css/styles.css`.
- **CV**: replace `assets/Andrei_Dumitrescu_CV.pdf` with a new export; the file name is referenced in two places in `index.html`.

## Local preview

Any static server works:

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

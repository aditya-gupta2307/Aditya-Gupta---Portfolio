# Aditya Gupta — Personal Portfolio

A clean, responsive personal portfolio built with **only HTML, CSS, and JavaScript**.
Ready to host on GitHub Pages with zero setup.

---

## 📁 Folder structure

```
portfolio/
├── index.html        ← Home page
├── about.html        ← About page
├── projects.html     ← Projects page
├── resume.html       ← Resume page (embeds your PDF)
├── style.css         ← All styling + dark-mode theme
├── script.js         ← Theme toggle, mobile menu, animations
├── README.md         ← This file
└── assets/
    ├── profile.jpg   ← YOUR profile photo (add this)
    └── Resume.pdf    ← YOUR resume PDF (add this)
```

---

## 🧑 HOW TO USE THIS WEBSITE

### 1. Add your profile photo
Drop a square image into the `assets/` folder and name it **`profile.jpg`**.
Good dimensions: 400×400 pixels or larger. If the file is missing, the
site automatically shows your initials (“AG”) in a gradient circle instead.

To use a different filename or format (e.g. `profile.png`), open
`index.html` and find the line:
```html
<img src="assets/profile.jpg" alt="Portrait of Aditya Gupta" ... />
```
Update the `src` to match your new filename.

### 2. Add your resume PDF
Drop your resume into the `assets/` folder and name it **`Resume.pdf`**.
The filename is case-sensitive on GitHub Pages, so match it exactly.

To rename it, open `resume.html` and update both places that reference
`assets/Resume.pdf`.

### 3. Edit text content
Every page has comments like `<!-- EDIT: ... -->` that tell you exactly
where to change things:

| What you want to change | File            | Look for                      |
|-------------------------|-----------------|-------------------------------|
| Your name               | every `.html`   | “Aditya”                      |
| Tagline / hero text     | `index.html`    | `hero__tagline`, `hero__intro`|
| Bio / about me          | `about.html`    | `About intro`                 |
| Quick facts             | `about.html`    | `fact-list`                   |
| Projects                | `projects.html` | `project-card` blocks         |
| Social / contact links  | every `.html`   | `socials` section             |

### 4. Edit colors / fonts
Open `style.css`. The very top of the file has a `:root { ... }` block
with all the colors and fonts as **CSS variables**:

```css
--color-primary: #4f46e5;    /* change to your brand color */
--color-secondary: #f59e0b;  /* accent color */
--font-heading: "Space Grotesk", ...;
--font-body: "Inter", ...;
```

Change the values and the whole site updates automatically — including
dark mode, which has its own variables just below.

### 5. Edit social / contact links
Search every HTML file for these lines and update the `href` values:
```html
<a href="mailto:adityaa.2307@gmail.com">                            <!-- Email -->
<a href="https://www.linkedin.com/in/adityagupta2307">              <!-- LinkedIn -->
<a href="https://github.com/aditya-gupta2307">                      <!-- GitHub -->
<a href="https://www.instagram.com/_adityaagupta/">                 <!-- Instagram -->
```

To remove a social link you don’t want, just delete the entire
`<a class="social-btn">...</a>` block for it.

---

## 🚶 Landing animation (new!)

The home page now shows a short walking-character intro when someone first
visits. It lives in two self-contained files:

- `landing-animation.css` — all the styles
- `landing-animation.js`  — the controller (dismiss handlers, etc.)

The overlay markup sits at the top of `<body>` in `index.html` — wrapped in
a big comment so it's easy to find.

**Behavior**
- Plays once per browser session (so it doesn't nag you on every page nav).
- Dismissible via the **Skip** button, the **Esc** key, or any scroll attempt.
- Auto-dismisses after ~3.4 seconds.
- Respects `prefers-reduced-motion` — replaces the walk with a gentle fade.

**Customize**
- Speed, character color, and character size: edit the `:root`-style block
  at the top of `landing-animation.css` (variables named `--landing-*`).
- Swap the character: replace the `<svg class="walker">` block in
  `index.html`. Any element with a `walker__*` class will get the right
  animations applied.
- Change the greeting copy: edit the `.landing__title` / `.landing__sub`
  text in `index.html`.
- Replay every reload (for development): open `landing-animation.js` and
  set `storageKey: null` inside `CONFIG`.

**Remove entirely**
Delete the `<div class="landing">...</div>` block from `index.html`, plus
the two `<link>` and `<script>` tags that reference `landing-animation.*`.
That's it — nothing else depends on it.

---

## 🚀 Publish to GitHub Pages (free hosting)

### Step 1 — Upload the project to GitHub
1. Go to <https://github.com> and log in.
2. Click **New repository** (green button).
3. Name it something like `aditya-portfolio` or simply
   `aditya-gupta2307.github.io`. Keep it **Public**.
4. Click **Create repository**.
5. On the repo page, click **“uploading an existing file”**.
6. Drag and drop **everything inside this folder** (not the folder
   itself — the loose `index.html`, `style.css`, `assets/`, etc.).
7. Scroll down and click **Commit changes**.

### Step 2 — Turn on GitHub Pages
1. In your repo, click **Settings** (top menu).
2. In the left sidebar, click **Pages**.
3. Under **Source**, pick:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**.

### Step 3 — Visit your live site
Wait 30–60 seconds, then refresh the Pages settings screen. You’ll see:

> ✅ Your site is live at `https://<your-username>.github.io/<repo-name>/`

That link is yours — share it on your resume, LinkedIn, or anywhere else.

### Step 4 — Make updates later
Every time you edit a file on GitHub (or upload a new one) and commit
the change, your live site updates within a minute. That’s it.

---

## 🎨 Claude’s curated choices (change any of these later!)

A few fields in the original prompt were left for me to fill in. Here’s
what I picked and why — swap them whenever you like:

- **Tagline:** *“CS freshman at Purdue — turning curiosity into code,
  and chaos into chords.”* (nods to coding + guitar)
- **Primary color:** deep indigo `#4f46e5` — modern, technical, calm
- **Secondary color:** warm amber `#f59e0b` — adds personality
- **Fonts:** Space Grotesk (headings) + Inter (body) — a sharp,
  professional pairing that reads great on any device
- **Profile photo filename:** `assets/profile.jpg`
- **Projects:** `PurduePlanner`, `ChordCraft`, `AlgoVisualizer` — three
  placeholder projects that match your interests. **Replace these with
  your real work as soon as you can.**

---

## 🧪 Preview the site locally (optional)
You don’t need any tools — just double-click `index.html` and it opens
in your browser. For a closer-to-GitHub-Pages experience, right-click
the folder in VS Code and pick “Open with Live Server.”

---

Made with care.  Good luck with your portfolio, Aditya! 🚀

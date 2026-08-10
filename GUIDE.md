# Guide: Adding Recipes with AI-Assisted Index Extraction

This guide explains how to take a photo of a cookbook's index, feed it to an AI assistant, and add the extracted recipes to this app — no manual typing required.

---

## 1. Taking a Good Photo of the Index Page

A high-quality photo is the single most important factor for accurate AI extraction. Follow these tips:

| ✅ Do | ❌ Avoid |
|---|---|
| Use **even, natural light** (near a window) | Harsh directional light that creates shadows |
| Shoot **flat/overhead** directly above the page | Shooting at an angle (causes text distortion) |
| Ensure **all text is sharp** and in frame | Blurry edges or cut-off columns |
| Fill the frame with **just the index page** | Wide shots with lots of background |
| Capture **both columns** if the index is two-column | Cropping out half the page |

**Pro tip:** Place the book flat on a table, stand directly above it, and use your phone's timer or volume button to avoid camera shake.

---

## 2. Choosing an AI Tool

Any AI with image/vision support will work. Recommended options:

| Tool | How to upload an image |
|---|---|
| **ChatGPT (GPT-4o)** | Click the 📎 paperclip icon in the chat input and select your photo |
| **Claude (claude.ai)** | Click the 📎 attachment icon or drag-and-drop the image into the chat |
| **Google Gemini** | Click the 🖼️ image icon next to the text field |
| **Google AI Studio** | Drag the image into the prompt area or use "Insert media" |

All of the above can read printed text from photos and produce structured output. GPT-4o and Claude tend to handle dense index layouts most reliably.

---

## 3. Prompt Template

Copy and paste this prompt into your chosen AI tool, **replacing `[BOOK NAME]`** with the actual title of the cookbook:

```
Here's a photo of a recipe book index. Extract the recipe names and page numbers.
Format them as CSV rows with these exact columns:

book_title,recipe_title,page_number,description

Rules:
- The book title is [BOOK NAME]. Use it exactly, the same for every row.
- Leave the description column empty unless the index itself provides extra context for a recipe (e.g. a subtitle or note printed next to the name).
- Output only the CSV rows — no header row, no explanation, no markdown code fences.
- Quote any field that contains a comma or double-quote character.
- Page numbers must be plain integers (no "p.", no "pg.", no ranges — use the first page if a range is given).
```

**Example filled-in prompt:**

> Here's a photo of a recipe book index. Extract the recipe names and page numbers.
> Format them as CSV rows … The book title is **Plenty More**.

---

## 4. Expected CSV Format

The file `data/recipes.csv` uses this column order, with a header on the first line:

```
book_title,recipe_title,page_number,description
```

### Column rules

| Column | Required | Notes |
|---|---|---|
| `book_title` | ✅ | Must be identical for every row from the same book |
| `recipe_title` | ✅ | As printed in the index |
| `page_number` | ✅ | Plain integer only |
| `description` | ❌ | Leave empty if not provided; do **not** invent content |

### Quoting rules

- Wrap a field in `"double quotes"` if it contains a **comma** or a **double-quote**.
- Escape a literal double-quote inside a quoted field by doubling it: `""`.
- The file must be saved as **UTF-8** (standard on macOS/Linux; on Windows choose "Save as UTF-8" in Notepad or VS Code).

### Example of well-formed rows

```csv
book_title,recipe_title,page_number,description
Plenty More,Burnt Aubergine with Garlic,34,
Plenty More,Cauliflower Cake,108,
Plenty More,"Sweet, Smoky & Fresh Salsa",212,
Jerusalem,Hummus with Ful,176,With slow-cooked broad beans
Jerusalem,Roasted Chicken with Clementines & Arak,188,
```

---

## 5. Appending to the CSV File

1. Open `data/recipes.csv` in any text editor (VS Code, TextEdit, Notepad…).
2. Scroll to the **very end** of the file.
3. Paste the rows the AI produced — **do not paste the header line again**.
4. Make sure there are no blank lines between the existing rows and the new ones.
5. Save the file.

**Quick sanity check:** Open the file and confirm:
- The header row appears only once at the top.
- Every new row has exactly **three commas** (four fields).
- Page numbers are plain integers, not text like `"p. 34"`.

---

## 6. Publishing to GitHub Pages (first-time setup)

Follow these steps once to connect your repository to GitHub Pages. After that, every push to `main` deploys automatically.

### Step 1 — Create a GitHub repository

Create a new repository on GitHub. The repository name becomes part of your app's URL:

```
https://<your-username>.github.io/<repo-name>/
```

For example, if your username is `alice` and your repo is `recipes`, the app will live at `https://alice.github.io/recipes/`.

### Step 2 — Set the base path in Vite

Open `vite.config.ts` and make sure `base` matches your repository name exactly:

```ts
base: '/recipes/',   // replace 'recipes' with your actual repo name
```

If you are publishing from a user root repository (`<username>.github.io` with no suffix), set `base: '/'` instead.

### Step 3 — Push the code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Step 4 — Enable GitHub Pages in repository settings

1. Go to your repository on GitHub.
2. Click **Settings** → **Pages** (in the left sidebar).
3. Under **Source**, select **GitHub Actions**.
4. Save. No branch or folder selection is needed — the workflow handles everything.

### Step 5 — Watch the deployment

Go to the **Actions** tab of your repository. The **Deploy to GitHub Pages** workflow will start automatically on your first push. When it completes, your app is live at the URL from Step 1.

---

## 7. Rebuilding and Redeploying

### Automatic (recommended)

Push your changes to the `main` branch:

```bash
git add data/recipes.csv
git commit -m "Add recipes from [Book Name]"
git push origin main
```

This triggers the **GitHub Actions** workflow (`.github/workflows/deploy.yml`), which builds the app and deploys it to GitHub Pages automatically. You can watch the progress in the **Actions** tab of your GitHub repository.

### Local preview (optional, before pushing)

```bash
npm run build   # produces dist/
npm run preview # serves dist/ locally at http://localhost:4173
```

Check that your new recipes appear and search correctly before pushing.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| New recipes don't appear | Header row was duplicated | Remove the duplicate header from the CSV |
| Page numbers show as `NaN` | AI output `"p. 34"` instead of `34` | Strip any prefix/suffix from page number cells |
| Recipe titles look garbled | Encoding issue | Ensure the file is saved as UTF-8 |
| Build fails on push | Syntax error in CSV | Run `npm run build` locally to see the error |

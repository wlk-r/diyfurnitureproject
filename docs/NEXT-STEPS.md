# Project Renamed to "diyfurnitureproject"

All documentation has been updated to use the new project name.

## What Was Changed ✅

### Documentation Files Updated:
- ✅ HYBRID-DEPLOYMENT.md
- ✅ DEPLOYMENT-GUIDE.md
- ✅ GITHUB-PAGES-GUIDE.md
- ✅ RENAME-PROJECT.md

All references to "walkernosworthy" in folder paths and URLs have been changed to "diyfurnitureproject".

### What Stayed the Same:
- ✅ PDF-TEMPLATE-GUIDE.md - Kept "Walker Nosworthy" for copyright/attribution (this is correct)
- ✅ cloudflare-worker/pdf-watermark-worker.js - Kept author name (this is correct)
- ✅ setup-r2.bat - No changes needed (no project name references)

---

## What YOU Need to Do Now

### 1. Rename Your Local Folder (Manual Step Required)

The folder couldn't be renamed automatically because it's currently open in your IDE.

**Steps:**
1. Close all files in VS Code (or your editor)
2. Close this folder completely
3. Go to `C:\Users\Walker\Documents\`
4. Right-click the `walkernosworthy` folder
5. Choose **Rename**
6. Type: `diyfurnitureproject`

**Or use File Explorer:**
- Navigate to C:\Users\Walker\Documents\
- Select the walkernosworthy folder
- Press F2
- Type: diyfurnitureproject
- Press Enter

---

### 2. Decide on Site Branding (Your Choice)

Your HTML files currently show "Walker Nosworthy" in the website header and page titles.

**Current branding in HTML:**
```html
<div class="sidebar-header">WALKER NOSWORTHY</div>
<title>Walker Nosworthy — Material and Virtual Design</title>
```

**You have two options:**

#### Option A: Keep Personal Name (Recommended)
- **Pro:** Personal branding, shows who you are
- **Pro:** Professional for portfolio
- **Keep as is** - No changes needed

**Use this if:** You want your name as the designer/creator front and center

#### Option B: Change to "DIY Furniture Project"
- **Pro:** Matches the project name
- **Pro:** More generic/business-focused
- **Con:** Less personal

**To change, update these files:**
- index.html (sidebar header + title)
- project1.html, project2.html, project3.html (titles)
- project1-protected.html (title)

**Example change:**
```html
<!-- From: -->
<div class="sidebar-header">WALKER NOSWORTHY</div>
<title>Walker Nosworthy — Material and Virtual Design</title>

<!-- To: -->
<div class="sidebar-header">DIY FURNITURE PROJECT</div>
<title>DIY Furniture Project — Material and Virtual Design</title>
```

**My recommendation:** Keep "Walker Nosworthy" for branding (Option A). The project folder name is just for organization - the site can still show your personal name.

---

## Next Steps to Launch

Once the folder is renamed, follow these steps:

### 1. Set Up R2 for Models (30 min)
```bash
cd C:\Users\Walker\Documents\diyfurnitureproject
setup-r2.bat
```

Then:
- Go to Cloudflare dashboard
- Make R2 bucket public
- Get the R2.dev URL
- Update HTML files to use that URL

### 2. Install Git (15 min)
- Download: https://git-scm.com/download/win
- Install with defaults
- Configure Git

### 3. Create GitHub Repo (15 min)
- Sign up at GitHub
- Create repo named: `diyfurnitureproject`
- Make it **Public**

### 4. Push to GitHub (20 min)
```bash
cd C:\Users\Walker\Documents\diyfurnitureproject
git init
git add .
git commit -m "Initial commit: DIY furniture portfolio"
git remote add origin https://github.com/YOURUSERNAME/diyfurnitureproject.git
git push -u origin main
```

### 5. Enable GitHub Pages (10 min)
- GitHub repo → Settings → Pages
- Source: main branch
- Your site goes live!

### 6. (Optional) Add Custom Domain
- Buy: diyfurnitureproject.com (~$10/year)
- Configure DNS
- Connect to GitHub Pages

---

## Your New URLs

**GitHub Pages site:**
```
https://yourusername.github.io/diyfurnitureproject/
```

**GitHub repository:**
```
https://github.com/yourusername/diyfurnitureproject
```

**With custom domain (if you get one):**
```
https://diyfurnitureproject.com
```

---

## File Structure After Rename

```
C:\Users\Walker\Documents\diyfurnitureproject\
├── index.html
├── project1.html
├── project2.html
├── project3.html
├── project1-protected.html
├── style.css
├── models/
│   ├── model1.glb (will move to R2)
│   ├── model2.glb (will move to R2)
│   └── model3.glb (will move to R2)
├── cloudflare-worker/
│   ├── pdf-watermark-worker.js
│   ├── wrangler.toml
│   └── package.json
├── HYBRID-DEPLOYMENT.md ← Follow this guide
├── DEPLOYMENT-GUIDE.md
├── GITHUB-PAGES-GUIDE.md
├── SETUP-GUIDE.md
├── PDF-TEMPLATE-GUIDE.md
└── setup-r2.bat
```

---

## Questions?

If you're unsure about anything:

1. **Branding decision:** Do you want to change "Walker Nosworthy" in the HTML to "DIY Furniture Project"?
2. **Ready to start?** Begin with setup-r2.bat after renaming the folder
3. **Need help?** Reference HYBRID-DEPLOYMENT.md for step-by-step instructions

---

## Quick Start Command

After manually renaming the folder:

```bash
cd C:\Users\Walker\Documents\diyfurnitureproject
setup-r2.bat
```

Then follow HYBRID-DEPLOYMENT.md from Phase 2!

You're all set to launch! 🚀

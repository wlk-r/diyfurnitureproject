# Hybrid Deployment Guide
## GitHub Pages + Cloudflare R2

This guide sets up your portfolio using:
- **GitHub Pages** for HTML/CSS (with Git version control)
- **Cloudflare R2** for 3D models and PDFs (no file size limits)
- **Cloudflare Workers** for PDF watermarking

**Benefits:**
- Learn Git (valuable skill)
- Free version control
- No file size limits
- Fast performance
- Everything is free

**Total time:** ~2-3 hours
**Total cost:** $0 (or ~$10/year for domain)

---

## Phase 1: Set Up Cloudflare R2 for Models (30 min)

### Step 1.1: Create R2 Bucket

You should already have Cloudflare account from the Worker setup. If not:
1. Go to https://cloudflare.com
2. Sign up (free)

Create bucket for models:

```bash
# Login to Wrangler (if you haven't)
wrangler login

# Create bucket for 3D models
wrangler r2 bucket create furniture-models
```

### Step 1.2: Upload Your 3D Models

```bash
# Navigate to your project
cd C:\Users\Walker\Documents\diyfurnitureproject

# Upload each model
wrangler r2 object put furniture-models/model1.glb --file=models/model1.glb
wrangler r2 object put furniture-models/model2.glb --file=models/model2.glb
wrangler r2 object put furniture-models/model3.glb --file=models/model3.glb
```

Verify uploads:
```bash
wrangler r2 object list furniture-models
```

You should see all three models listed.

### Step 1.3: Make Bucket Public

**Option A: Use R2.dev Domain (Easiest)**

1. Cloudflare dashboard → **R2**
2. Click your bucket: `furniture-models`
3. Go to **Settings** tab
4. Under **Public Access** → Click **Allow Access**
5. You'll see: "R2.dev subdomain: `https://pub-XXXXX.r2.dev`"
6. **Copy this URL** - you'll need it

**Your models will be accessible at:**
- `https://pub-XXXXX.r2.dev/model1.glb`
- `https://pub-XXXXX.r2.dev/model2.glb`
- `https://pub-XXXXX.r2.dev/model3.glb`

**Option B: Use Custom Domain (More Professional)**

1. In R2 bucket settings → **Public Access**
2. Click **Connect Custom Domain**
3. Enter: `models.yourdomain.com`
4. Cloudflare sets up DNS automatically
5. Wait 5-10 minutes for activation

**Your models will be accessible at:**
- `https://models.yourdomain.com/model1.glb`
- etc.

**For now, use Option A (r2.dev domain).** You can add custom domain later.

### Step 1.4: Test Model Access

Open browser and visit:
```
https://pub-XXXXX.r2.dev/model1.glb
```

Should either:
- Download the file, OR
- Show "file not found" (wrong URL)

If it downloads/displays, you're good!

---

## Phase 2: Update HTML to Use R2 Models (20 min)

Now update your HTML files to load models from R2 instead of local files.

### Step 2.1: Update index.html

Find all `<model-viewer>` tags and update the `src` attribute.

**Before:**
```html
<model-viewer
    src="models/model1.glb"
    alt="Model 1"
    ...>
</model-viewer>
```

**After:**
```html
<model-viewer
    src="https://pub-XXXXX.r2.dev/model1.glb"
    alt="Model 1"
    ...>
</model-viewer>
```

Replace `pub-XXXXX.r2.dev` with YOUR actual R2 URL.

Do this for all three models in index.html.

### Step 2.2: Update project1.html

Same thing for the detail page:

**Before:**
```html
<model-viewer
    src="models/model1.glb"
    ...>
</model-viewer>
```

**After:**
```html
<model-viewer
    src="https://pub-XXXXX.r2.dev/model1.glb"
    ...>
</model-viewer>
```

### Step 2.3: Update project2.html and project3.html

Repeat for project2.html (use model2.glb) and project3.html (use model3.glb).

### Step 2.4: Update project1-protected.html

Same update in the protected viewer page:

```html
<model-viewer
    src="https://pub-XXXXX.r2.dev/model1.glb"
    ...>
</model-viewer>
```

### Step 2.5: Test Locally

Open `index.html` in your browser. The 3D models should load from R2.

**Check browser console (F12)** for any errors. If models don't load:
- Verify R2 URL is correct
- Check bucket is public
- Look for CORS errors (R2 should handle this automatically)

---

## Phase 3: Prepare for GitHub (10 min)

### Step 3.1: Remove Local Model Files (Optional)

Since models are now on R2, you can remove them from your project:

**Option 1: Delete local models**
```bash
# Move to backup first (just in case)
mkdir models-backup
move models\*.glb models-backup\
```

This keeps your GitHub repo small.

**Option 2: Keep models but don't commit them**

Create `.gitignore` file (see Step 4.2). This keeps models locally but doesn't push to GitHub.

**Recommendation:** Keep one local copy as backup, but use `.gitignore` to exclude from Git.

### Step 3.2: Create .gitignore File

Create a file named `.gitignore` in your project root:

```
# 3D Models (hosted on R2)
models/*.glb
models/*.gltf

# PDF Templates (hosted on R2)
templates/*.pdf

# Mac
.DS_Store

# Windows
Thumbs.db
desktop.ini

# Node modules
node_modules/

# Development
*.log
.env

# IDE
.vscode/
.idea/

# Cloudflare Worker (separate deployment)
cloudflare-worker/node_modules/
```

Save this file as `.gitignore` (with the dot, no .txt extension).

**On Windows:**
- Open Notepad
- File → Save As
- Filename: `.gitignore`
- Save as type: "All Files"

---

## Phase 4: Install Git (15 min)

### Step 4.1: Download Git

**Windows:**
1. Go to https://git-scm.com/download/win
2. Download the installer
3. Run installer with default settings
4. When asked about default editor, choose "Nano" or "Notepad"

**Mac:**
```bash
# Option 1: Install Xcode Command Line Tools
xcode-select --install

# Option 2: Use Homebrew (if installed)
brew install git
```

### Step 4.2: Verify Installation

Open **Git Bash** (Windows) or **Terminal** (Mac):

```bash
git --version
```

Should show something like: `git version 2.43.0`

### Step 4.3: Configure Git

Set your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

This info will appear in your commit history.

---

## Phase 5: Create GitHub Repository (15 min)

### Step 5.1: Create GitHub Account

1. Go to https://github.com
2. Click **Sign up**
3. Choose username (this will be in your URL)
4. Verify email

### Step 5.2: Create New Repository

1. Click **+** in top right → **New repository**
2. Fill in:
   - **Repository name:** `diyfurnitureproject` (or your preferred name)
   - **Description:** "Furniture design portfolio and digital plans store"
   - **Public** ✅ (required for free GitHub Pages)
   - **Do NOT check** "Add README" (you'll add files yourself)
3. Click **Create repository**

### Step 5.3: Save Repository URL

You'll see a page with setup instructions. Note the URL:
```
https://github.com/yourusername/diyfurnitureproject.git
```

Keep this page open - you'll need these commands.

---

## Phase 6: Push Your Site to GitHub (20 min)

### Step 6.1: Open Terminal in Your Project

**Windows:**
1. Open File Explorer
2. Navigate to: `C:\Users\Walker\Documents\diyfurnitureproject`
3. Right-click in the folder → **Git Bash Here**

**Mac:**
1. Open Terminal
2. Navigate: `cd ~/Documents/diyfurnitureproject`

### Step 6.2: Initialize Git Repository

```bash
# Initialize Git in this folder
git init

# Check what files will be added
git status
```

You should see all your HTML, CSS files listed. Models should NOT appear (thanks to .gitignore).

### Step 6.3: Add Files to Git

```bash
# Add all files (except those in .gitignore)
git add .

# Check what's staged
git status
```

Should show files in green (ready to commit).

### Step 6.4: Create First Commit

```bash
git commit -m "Initial commit: furniture portfolio site with R2-hosted models"
```

This creates a snapshot of your code.

### Step 6.5: Connect to GitHub

```bash
# Add GitHub as remote (replace with YOUR username)
git remote add origin https://github.com/YOURUSERNAME/diyfurnitureproject.git

# Verify
git remote -v
```

### Step 6.6: Push to GitHub

```bash
# Rename branch to main (GitHub's default)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If prompted for authentication:**
- **Username:** Your GitHub username
- **Password:** You need a **Personal Access Token** (NOT your password)

**To create token:**
1. GitHub → Click your profile → **Settings**
2. Scroll down → **Developer settings** (bottom left)
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)**
5. Note: "Git access"
6. Check: `repo` (full control of repositories)
7. Click **Generate token**
8. **Copy the token** (you can't see it again!)
9. Paste as password in Git Bash

### Step 6.7: Verify Upload

Go to your GitHub repo in browser:
```
https://github.com/yourusername/diyfurnitureproject
```

You should see all your files! (But NOT the GLB models - they're in .gitignore)

---

## Phase 7: Enable GitHub Pages (10 min)

### Step 7.1: Configure Pages

1. In your GitHub repo, click **Settings** tab
2. Scroll to **Pages** in left sidebar
3. Under **Source**:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **Save**

### Step 7.2: Wait for Deployment

GitHub will build your site. Wait 1-3 minutes.

Refresh the Pages settings page. You should see:

```
Your site is live at https://yourusername.github.io/diyfurnitureproject/
```

### Step 7.3: Test Your Live Site

Click that URL or visit it in your browser.

**Check:**
- [ ] Homepage loads
- [ ] CSS styling works
- [ ] 3D models load (from R2!)
- [ ] Links between pages work
- [ ] Responsive design works (resize browser)

**If models don't load:**
- Check browser console (F12)
- Verify R2 URLs are correct in HTML
- Confirm R2 bucket is public

---

## Phase 8: Add Custom Domain (Optional, 20 min)

### Step 8.1: Buy Domain

If you haven't already, buy a domain (~$10/year):
- Cloudflare Registrar (recommended, cheapest)
- Namecheap
- Any registrar

### Step 8.2: Configure DNS

**If domain is on Cloudflare:**

1. Cloudflare dashboard → **Websites** → Click your domain
2. Go to **DNS** → **Records**
3. Add these records:

```
Type: A
Name: @ (or yourdomain.com)
Content: 185.199.108.153
Proxy: DNS only (gray cloud)

Type: A
Name: @
Content: 185.199.109.153
Proxy: DNS only

Type: A
Name: @
Content: 185.199.110.153
Proxy: DNS only

Type: A
Name: @
Content: 185.199.111.153
Proxy: DNS only

Type: CNAME
Name: www
Content: yourusername.github.io
Proxy: DNS only
```

**If domain is on Namecheap or other registrar:**

1. In domain settings → **Advanced DNS** or **DNS Management**
2. Add same A records and CNAME as above

### Step 8.3: Configure in GitHub

1. GitHub repo → **Settings** → **Pages**
2. Under **Custom domain**, enter: `yourdomain.com`
3. Click **Save**
4. Wait 5-10 minutes
5. ✅ Check **Enforce HTTPS** (after DNS verifies)

### Step 8.4: Wait for DNS Propagation

Can take 1-24 hours (usually 1-2 hours).

Check status: https://dnschecker.org

Once propagated, your site will be at: `https://yourdomain.com`

---

## Phase 9: Deploy Cloudflare Worker (15 min)

Your PDF watermarking worker needs to be deployed separately.

### Step 9.1: Deploy Worker

```bash
cd cloudflare-worker
npm install
wrangler deploy
```

Note the Worker URL: `https://pdf-watermark-worker.XXXXX.workers.dev`

### Step 9.2: Upload PDF Templates

Create your PDF templates and upload to R2:

```bash
# Create bucket for PDFs (if not already created)
wrangler r2 bucket create furniture-plans-pdfs

# Upload template PDFs
wrangler r2 object put furniture-plans-pdfs/templates/chair-plans-template.pdf --file=./path/to/template.pdf
```

### Step 9.3: Update Lemon Squeezy

1. Lemon Squeezy dashboard → **Settings** → **Webhooks**
2. Update webhook URL to your Worker:
   ```
   https://pdf-watermark-worker.XXXXX.workers.dev/webhook
   ```

3. Update product redirect URLs:
   ```
   https://yourdomain.com/project1-protected.html
   ```
   (or use GitHub Pages URL if no custom domain yet)

---

## Daily Workflow: Making Updates

### When You Want to Update Your Site

1. **Edit files locally** (HTML, CSS, etc.)
2. **Test in browser** (open index.html)
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Updated project descriptions"
   ```
4. **Push to GitHub:**
   ```bash
   git push
   ```
5. **Wait 1-3 minutes** - site auto-updates!

### Useful Git Commands

```bash
# See what changed
git status

# See commit history
git log --oneline

# Undo changes (before commit)
git checkout -- filename.html

# See what you changed in a file
git diff filename.html

# Create a branch for experiments
git checkout -b new-feature
```

---

## Architecture Summary

Your complete setup:

```
┌─────────────────────────────────────────┐
│         Your Custom Domain              │
│      https://yourdomain.com             │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
  ┌─────▼──────┐     ┌──────▼────────┐
  │  GitHub    │     │  Cloudflare   │
  │   Pages    │     │      R2       │
  │            │     │               │
  │ HTML/CSS   │────▶│ 3D Models     │
  │ JavaScript │     │ (40MB files)  │
  │ (Small     │     │               │
  │  files)    │     └───────────────┘
  └────────────┘
        │
        │ Purchase button
        ▼
  ┌────────────────┐
  │ Lemon Squeezy  │
  │   Checkout     │
  └────────┬───────┘
           │ Webhook
           ▼
  ┌────────────────┐     ┌───────────────┐
  │  Cloudflare    │────▶│ Cloudflare R2 │
  │    Worker      │     │ (Watermarked  │
  │ (Watermark PDF)│     │     PDFs)     │
  └────────────────┘     └───────────────┘
```

---

## Costs Breakdown

**One-time:**
- Domain: ~$10-15/year (optional)

**Monthly:**
- GitHub Pages: **FREE**
- Cloudflare R2: **FREE** (10GB, 1M operations/month)
- Cloudflare Worker: **FREE** (100k requests/day)
- SSL Certificate: **FREE** (GitHub + Cloudflare)

**Per-transaction:**
- Lemon Squeezy: 5% + $0.50

**Total to launch: $0** (or $10-15 if you buy domain)

---

## What You've Learned

By completing this setup, you now know:

- ✅ Git basics (init, add, commit, push)
- ✅ GitHub (repositories, version control)
- ✅ GitHub Pages (static site hosting)
- ✅ Cloudflare R2 (object storage)
- ✅ Cloudflare Workers (serverless functions)
- ✅ DNS configuration
- ✅ Hybrid hosting architecture

These are valuable web development skills!

---

## Troubleshooting

### Models not loading from R2

**Check:**
1. R2 bucket is public (Settings → Public Access → Allow Access)
2. URLs in HTML match R2 URLs exactly
3. Browser console (F12) for CORS errors
4. Try loading model URL directly in browser

**Fix CORS issues:**
R2 should handle CORS automatically for public buckets. If issues persist:
1. R2 bucket → Settings → CORS policy
2. Add rule allowing your GitHub Pages domain

### Git push rejected

```
error: failed to push some refs
```

**Fix:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push
```

### GitHub Pages not updating

**Check:**
1. Commit was successful: `git log`
2. Push was successful: `git push` (no errors)
3. Wait 3-5 minutes
4. Check Actions tab in GitHub for build status
5. Clear browser cache (Ctrl+Shift+R)

### Authentication failed

**You need Personal Access Token, not password:**
1. Generate token: https://github.com/settings/tokens
2. Scope: `repo`
3. Use token as password when Git asks

**Alternative - use SSH:**
https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

## Next Steps

1. **Test everything end-to-end**
2. **Create your first PDF template**
3. **Set up Lemon Squeezy product**
4. **Do test purchase**
5. **Verify watermarking works**
6. **Launch!**

---

Congratulations! You now have a professional, scalable e-commerce site with version control, automated PDF watermarking, and zero monthly hosting costs. 🚀

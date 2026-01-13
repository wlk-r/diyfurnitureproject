# GitHub Pages Deployment Guide

Alternative hosting option using GitHub Pages instead of Cloudflare Pages.

## Prerequisites

- GitHub account (free): https://github.com
- Git installed: https://git-scm.com/downloads
- Basic command line knowledge (we'll walk through it)

## Important: File Size Considerations

⚠️ **Your 3D models are large:**
- model1.glb: 40.2 MB (close to GitHub's 50 MB warning)
- model2.glb: 18 MB
- model3.glb: 26 KB

**Recommendation:** Host models on Cloudflare R2 or optimize them (see below).

---

## Option A: GitHub Pages with Separate Model Hosting (Recommended)

This avoids file size issues entirely.

### Step 1: Set Up Cloudflare R2 for Models (15 min)

```bash
# Create R2 bucket for models
wrangler r2 bucket create furniture-models

# Upload your models
wrangler r2 object put furniture-models/model1.glb --file=./models/model1.glb
wrangler r2 object put furniture-models/model2.glb --file=./models/model2.glb
wrangler r2 object put furniture-models/model3.glb --file=./models/model3.glb
```

### Step 2: Make R2 Bucket Public

1. Cloudflare dashboard → **R2**
2. Click your bucket (`furniture-models`)
3. **Settings** → **Public Access**
4. Click **Connect Domain** or **Allow Access**
5. You'll get a URL like: `https://pub-xxxxx.r2.dev`

Or use custom domain: `models.yourdomain.com`

### Step 3: Update HTML to Point to R2

Edit all your HTML files (index.html, project1.html, etc.):

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
    src="https://pub-xxxxx.r2.dev/model1.glb"
    ...>
</model-viewer>
```

Now your models are hosted separately (no GitHub file size limits).

---

## Option B: GitHub Pages with Models in Repo

Only do this if your models are optimized to under 20-30 MB each.

### Model Optimization (Optional but Recommended)

**Use glTF Report:**
1. Go to https://gltf.report/
2. Upload your GLB file
3. Click **Optimize**
4. Adjust settings:
   - Reduce texture size (e.g., 2048px → 1024px)
   - Simplify geometry (reduce polygon count)
   - Remove unused materials
5. Download optimized GLB
6. Replace original file

**Target:** Under 20 MB per model for comfortable GitHub hosting.

---

## Step 1: Install Git (10 min)

### Windows:
1. Download: https://git-scm.com/download/win
2. Run installer (use default settings)
3. Open **Git Bash** from Start menu

### Mac:
```bash
# Option 1: Install Xcode Command Line Tools
xcode-select --install

# Option 2: Use Homebrew
brew install git
```

### Linux:
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/Fedora
```

**Verify installation:**
```bash
git --version
```

---

## Step 2: Set Up Git (5 min)

Configure your identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Step 3: Create GitHub Repository (10 min)

### 3.1 Create Account
1. Go to https://github.com
2. Sign up (free)
3. Verify email

### 3.2 Create New Repository

1. Click **+** → **New repository**
2. Settings:
   - **Name:** `diyfurnitureproject` (or your desired name)
   - **Description:** "Furniture design portfolio and digital plans store"
   - **Public** (required for free GitHub Pages)
   - ✅ **Add README file** (check this)
3. Click **Create repository**

### 3.3 Note Your Repo URL

It will be: `https://github.com/yourusername/diyfurnitureproject`

---

## Step 4: Push Your Site to GitHub (15 min)

### 4.1 Initialize Git in Your Project

Open terminal/Git Bash in your project folder:

```bash
cd C:\Users\Walker\Documents\diyfurnitureproject
```

Initialize Git:

```bash
git init
```

### 4.2 Create .gitignore File

Create a file named `.gitignore` in your project root:

```
# Mac
.DS_Store

# Windows
Thumbs.db

# Node modules (if using)
node_modules/

# Development files
*.log

# Large files (if hosting models separately)
# models/*.glb
```

### 4.3 Add Files to Git

```bash
# Add all files
git add .

# Create first commit
git commit -m "Initial commit: furniture portfolio site"
```

### 4.4 Connect to GitHub

```bash
# Add remote (replace with your GitHub username)
git remote add origin https://github.com/YOURUSERNAME/diyfurnitureproject.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a **Personal Access Token** (not your password)
  - Generate at: https://github.com/settings/tokens
  - Select: `repo` scope
  - Copy token and paste as password

---

## Step 5: Enable GitHub Pages (5 min)

1. Go to your repo: `https://github.com/yourusername/diyfurnitureproject`
2. Click **Settings** tab
3. Scroll to **Pages** (left sidebar)
4. Under **Source**:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

**Wait 1-3 minutes**, then your site will be live at:
```
https://yourusername.github.io/diyfurnitureproject/
```

---

## Step 6: Add Custom Domain (15 min)

### 6.1 Buy Domain

Buy from Cloudflare, Namecheap, or any registrar (~$10/year).

### 6.2 Configure DNS

**In your domain registrar (Namecheap, Cloudflare, etc.):**

Add these DNS records:

**For apex domain (yourdomain.com):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: yourusername.github.io
```

### 6.3 Configure GitHub Pages

1. In your repo → **Settings** → **Pages**
2. Under **Custom domain**, enter: `yourdomain.com`
3. Click **Save**
4. Wait 5-10 minutes
5. ✅ Check **Enforce HTTPS** (after domain verifies)

**Wait up to 24 hours for DNS propagation** (usually 1-2 hours).

---

## Step 7: Update Your Site (Ongoing)

### Make Changes Locally

1. Edit your HTML/CSS files
2. Test locally (open in browser)

### Push Changes to GitHub

```bash
# Add changed files
git add .

# Commit with message
git commit -m "Update project descriptions"

# Push to GitHub
git push
```

**Site updates in 1-5 minutes** automatically.

---

## GitHub Pages + Cloudflare Worker Setup

Your e-commerce infrastructure works the same:

### 1. Worker Deployment
```bash
cd cloudflare-worker
wrangler deploy
```

### 2. Lemon Squeezy Webhook

Point to your Worker:
```
https://pdf-watermark-worker.your-subdomain.workers.dev/webhook
```

### 3. Protected Pages

Update product redirect URLs in Lemon Squeezy:
```
https://yourdomain.com/project1-protected.html
```

Everything works identically to Cloudflare Pages hosting.

---

## Troubleshooting

### Site not showing after enabling Pages

- Wait 5 minutes and refresh
- Check **Settings → Pages** for deployment status
- Green checkmark = deployed successfully

### 404 error on custom domain

- Wait 24 hours for DNS propagation
- Check DNS records are correct: https://dnschecker.org
- Verify custom domain in GitHub Pages settings

### Models not loading

**If hosted on R2:**
- Check R2 bucket is public
- Verify URLs in HTML are correct
- Check browser console (F12) for CORS errors

**If in GitHub repo:**
- Verify files are under 100 MB
- Check file paths are correct
- GitHub Pages serves from repo root

### Changes not updating

- Check commit was successful: `git log`
- Verify push worked: `git status` should say "up to date"
- Wait 5 minutes for GitHub to rebuild
- Clear browser cache (Ctrl+Shift+R)

### Large files rejected

```
Error: file too large (>100 MB)
```

**Solutions:**
1. Optimize the file (reduce size)
2. Use Git LFS (see below)
3. Host files separately on R2/S3

---

## Git LFS for Large Files (Advanced)

If you must keep large models in the repo:

### Install Git LFS

**Windows:**
1. Download: https://git-lfs.github.com
2. Run installer
3. In your repo:
   ```bash
   git lfs install
   ```

**Mac:**
```bash
brew install git-lfs
git lfs install
```

### Track Large Files

```bash
# Track all GLB files
git lfs track "*.glb"

# Add .gitattributes
git add .gitattributes

# Add models
git add models/
git commit -m "Add 3D models with LFS"
git push
```

**Free tier limits:**
- 1 GB storage
- 1 GB bandwidth/month

**Paid:** $5/month for 50 GB data pack

---

## GitHub Pages Limits

**Soft limits (warnings):**
- Repo size: 1 GB
- File size: 50 MB
- Monthly bandwidth: 100 GB

**Hard limits:**
- File size: 100 MB (rejected)
- 10 builds per hour

**For most sites:** These limits are fine. Your site should be well under limits.

---

## Costs

**Free:**
- GitHub Pages hosting
- SSL certificate
- Unlimited bandwidth (soft limit: 100 GB/month)
- Custom domain support

**Paid (optional):**
- Domain: $10-15/year
- Git LFS: $5/month (if needed)
- GitHub Pro: $4/month (not required)

---

## Comparison: What You Give Up vs Cloudflare Pages

**GitHub Pages doesn't have:**
- Drag-and-drop deployment (requires Git)
- Unlimited file sizes (100 MB limit)
- As fast CDN (Cloudflare's is faster)

**GitHub Pages advantages:**
- Full Git history (version control)
- Popular, lots of tutorials
- Integration with GitHub ecosystem
- Familiar to developers

---

## Recommended Workflow

**Best setup for your site:**

1. **HTML/CSS/JS** → GitHub Pages (version control)
2. **3D models** → Cloudflare R2 (no file size limits)
3. **PDF worker** → Cloudflare Workers (automated watermarking)
4. **Payments** → Lemon Squeezy (e-commerce)

This gives you:
- ✅ Version control for code
- ✅ No file size limits
- ✅ Free hosting for everything
- ✅ Best performance

---

## Quick Start Commands

```bash
# First time setup
cd your-project-folder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main

# Daily workflow (after making changes)
git add .
git commit -m "Description of changes"
git push

# Check status
git status

# View history
git log --oneline
```

---

You now have everything you need to deploy to GitHub Pages! Choose the option that fits your comfort level with Git.

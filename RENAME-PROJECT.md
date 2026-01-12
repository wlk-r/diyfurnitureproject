# Renaming Project to "diyfurnitureproject"

Quick guide to rename your project from "diyfurnitureproject" to "diyfurnitureproject"

## What Needs to Change

1. Local folder name (optional but recommended)
2. GitHub repository name
3. Documentation references
4. Nothing else! (HTML files don't need changes)

---

## Option 1: Rename Before Creating GitHub Repo (Easiest)

If you haven't created the GitHub repo yet:

### Step 1: Rename Local Folder

**Windows:**
1. Close all files in the folder
2. Go to `C:\Users\Walker\Documents\`
3. Right-click `diyfurnitureproject` folder
4. Choose **Rename**
5. Type: `diyfurnitureproject`

**Or use command line:**
```bash
cd C:\Users\Walker\Documents\
rename diyfurnitureproject diyfurnitureproject
```

### Step 2: Create GitHub Repo with New Name

When creating the repo:
- **Repository name:** `diyfurnitureproject`
- Everything else same as before

Your site will be at:
```
https://yourusername.github.io/diyfurnitureproject/
```

---

## Option 2: Rename After Creating GitHub Repo

If you already created "diyfurnitureproject" repo:

### Step 2.1: Rename on GitHub

1. Go to your repo: `https://github.com/yourusername/diyfurnitureproject`
2. Click **Settings** tab
3. Under **General** → **Repository name**
4. Change to: `diyfurnitureproject`
5. Click **Rename**

GitHub automatically redirects the old URL, so no links break.

### Step 2.2: Update Local Git Remote

In your project folder (Git Bash):

```bash
# Update remote URL
git remote set-url origin https://github.com/yourusername/diyfurnitureproject.git

# Verify
git remote -v
```

### Step 2.3: Rename Local Folder (Optional)

```bash
cd C:\Users\Walker\Documents\
rename diyfurnitureproject diyfurnitureproject
```

---

## What DOESN'T Need to Change

✅ **HTML files** - No changes needed
✅ **CSS files** - No changes needed
✅ **R2 buckets** - Keep as is (names don't matter)
✅ **Cloudflare Worker** - Keep as is
✅ **Lemon Squeezy** - Keep as is

**Only the folder/repo name changes.**

---

## Updated URLs After Rename

**Before:**
```
https://yourusername.github.io/diyfurnitureproject/
```

**After:**
```
https://yourusername.github.io/diyfurnitureproject/
```

**GitHub repo:**
```
https://github.com/yourusername/diyfurnitureproject
```

---

## Custom Domain (Recommended)

Since you're changing the project name, consider getting a custom domain:

**Instead of:**
```
https://yourusername.github.io/diyfurnitureproject/
```

**Use:**
```
https://diyfurnitureproject.com
```

**Cost:** ~$10/year

**Benefits:**
- Professional
- No GitHub in URL
- No username in URL
- Easier to remember
- Easier to say/share

**Available domains to check:**
- diyfurnitureproject.com
- diyfurnitureplans.com
- diyfurniture.studio
- furnitureproject.co
- etc.

Check availability:
- Cloudflare: https://www.cloudflare.com/products/registrar/
- Namecheap: https://www.namecheap.com

---

## Which Name is Better?

Some considerations:

**"diyfurnitureproject":**
- ✅ Descriptive (immediately clear what it is)
- ✅ SEO-friendly (keywords in name)
- ✅ Good for branding a product/service
- ⚠️ Long (25 characters)
- ⚠️ Generic (not personal brand)

**"diyfurnitureproject":**
- ✅ Personal brand (your name)
- ✅ Shorter
- ✅ Unique
- ✅ Good for portfolio
- ⚠️ Harder to remember
- ⚠️ Doesn't describe what you do

**Hybrid options:**
- "diyfurnitureproject-furniture"
- "walker-diy"
- "nosworthy-studio"

**My recommendation:**

If this is primarily a **business/store** → `diyfurnitureproject`
If this is primarily a **portfolio** → `diyfurnitureproject`
If it's **both** → Get custom domain like `diyfurnitureproject.com` and host the store there

You can always have both:
- Personal portfolio: `diyfurnitureproject.com`
- Store/plans: `diyfurnitureplans.com` (separate site or subdomain)

---

## Quick Decision Guide

**Choose "diyfurnitureproject" if:**
- Main goal is selling furniture plans
- Want to be found via search (DIY furniture)
- Building a product/business brand
- Don't care about personal branding

**Choose "diyfurnitureproject" if:**
- Main goal is portfolio/showcase work
- Want to build personal brand as designer
- Plans to do more than just furniture
- Your name is your brand

**Do both:**
- Main site: `diyfurnitureproject.com` (portfolio)
- Store: `plans.diyfurnitureproject.com` (subdomain for plans)

---

## Making the Change

Let me know which name you want and I'll update all the documentation accordingly!

Current options:
1. **diyfurnitureproject** (assuming you meant "project" not "proejc")
2. **diyfurnitureproject** (keep current)
3. Something else?

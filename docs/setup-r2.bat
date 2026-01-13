@echo off
REM Helper script to set up Cloudflare R2 for 3D models
REM Run this from your project root directory

echo ========================================
echo Cloudflare R2 Setup for 3D Models
echo ========================================
echo.

echo Step 1: Creating R2 bucket...
wrangler r2 bucket create furniture-models
echo.

echo Step 2: Uploading 3D models...
wrangler r2 object put furniture-models/model1.glb --file=models/model1.glb
wrangler r2 object put furniture-models/model2.glb --file=models/model2.glb
wrangler r2 object put furniture-models/model3.glb --file=models/model3.glb
echo.

echo Step 3: Listing uploaded files...
wrangler r2 object list furniture-models
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Go to Cloudflare Dashboard: https://dash.cloudflare.com
echo 2. Navigate to R2 ^> furniture-models
echo 3. Go to Settings tab
echo 4. Under "Public Access" click "Allow Access"
echo 5. Copy the R2.dev URL (looks like: https://pub-XXXXX.r2.dev)
echo 6. Update your HTML files to use that URL
echo.
echo Example: src="https://pub-XXXXX.r2.dev/model1.glb"
echo ========================================

pause

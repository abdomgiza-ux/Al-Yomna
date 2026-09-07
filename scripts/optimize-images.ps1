# Optimization Script for AL-YOMNA Project
# Requires: ImageMagick (magick) or cwebp

$root = Get-Location
$assets = Join-Path $root "assets"

Write-Host "Optimizing images to WebP..." -ForegroundColor Cyan

Get-ChildItem -Path $assets -Recurse -Include *.png, *.jpg, *.jpeg | ForEach-Object {
    $src = $_.FullName
    $dest = [io.path]::ChangeExtension($src, ".webp")
    
    if (Get-Command magick -ErrorAction SilentlyContinue) {
        Write-Host "Converting $src -> $dest (using ImageMagick)"
        magick convert $src -quality 80 $dest
    } elseif (Get-Command cwebp -ErrorAction SilentlyContinue) {
        Write-Host "Converting $src -> $dest (using cwebp)"
        cwebp -q 80 $src -o $dest
    } else {
        Write-Warning "Neither ImageMagick nor cwebp found. Please install one to use this script."
        return
    }
}

Write-Host "Done!" -ForegroundColor Green

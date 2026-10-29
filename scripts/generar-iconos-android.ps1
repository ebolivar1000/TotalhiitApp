# Generación de iconos nativos para Android y PWA desde el logo oficial de TOTALHIIT
Add-Type -AssemblyName System.Drawing

$logoPath = "C:\Users\Everth\ProyectosIA\TotalhiitApp\public\images\logo.png"
$resDir = "C:\Users\Everth\ProyectosIA\TotalhiitApp\android\app\src\main\res"

$densities = @(
    @{ folder = "mipmap-mdpi"; size = 48; fgSize = 108 },
    @{ folder = "mipmap-hdpi"; size = 72; fgSize = 162 },
    @{ folder = "mipmap-xhdpi"; size = 96; fgSize = 216 },
    @{ folder = "mipmap-xxhdpi"; size = 144; fgSize = 324 },
    @{ folder = "mipmap-xxxhdpi"; size = 192; fgSize = 432 }
)

$src = [System.Drawing.Bitmap]::FromFile($logoPath)

foreach ($d in $densities) {
    $dir = Join-Path $resDir $d.folder
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force }

    $bmp = New-Object System.Drawing.Bitmap $d.size, $d.size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)
    
    $pad = [int]($d.size * 0.08)
    $w = $d.size - ($pad * 2)
    $h = $d.size - ($pad * 2)
    $g.DrawImage($src, $pad, $pad, $w, $h)
    $g.Dispose()
    
    $bmp.Save((Join-Path $dir "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $dir "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()

    $fg = New-Object System.Drawing.Bitmap $d.fgSize, $d.fgSize
    $g2 = [System.Drawing.Graphics]::FromImage($fg)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g2.Clear([System.Drawing.Color]::Transparent)
    
    $fgLogoSize = [int]($d.fgSize * 0.65)
    $fgOffset = [int](($d.fgSize - $fgLogoSize) / 2)
    $g2.DrawImage($src, $fgOffset, $fgOffset, $fgLogoSize, $fgLogoSize)
    $g2.Dispose()

    $fg.Save((Join-Path $dir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $fg.Dispose()
}

$pwa192 = New-Object System.Drawing.Bitmap 192, 192
$gp1 = [System.Drawing.Graphics]::FromImage($pwa192)
$gp1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gp1.Clear([System.Drawing.Color]::White)
$gp1.DrawImage($src, 16, 16, 160, 160)
$gp1.Dispose()
$pwa192.Save("C:\Users\Everth\ProyectosIA\TotalhiitApp\public\icons\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$pwa192.Dispose()

$pwa512 = New-Object System.Drawing.Bitmap 512, 512
$gp2 = [System.Drawing.Graphics]::FromImage($pwa512)
$gp2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gp2.Clear([System.Drawing.Color]::White)
$gp2.DrawImage($src, 40, 40, 432, 432)
$gp2.Dispose()
$pwa512.Save("C:\Users\Everth\ProyectosIA\TotalhiitApp\public\icons\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$pwa512.Dispose()

$src.Dispose()
Write-Host "Iconos oficiales TOTALHIIT generados!"

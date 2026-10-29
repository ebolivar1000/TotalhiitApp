Add-Type -AssemblyName System.Drawing

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatDescription -eq "JPEG" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]85)

$files = @("totalhiit_1.jpg", "totalhiit_2.jpg", "totalhiit_3.jpg", "totalhiit_4.jpg", "totalhiit_5.jpg")
foreach ($f in $files) {
    $path = "public\images\valentina\$f"
    if (Test-Path $path) {
        $img = [System.Drawing.Bitmap]::FromFile((Resolve-Path $path).Path)
        $maxWidth = 1200
        if ($img.Width -gt $maxWidth) {
            $newWidth = $maxWidth
            $newHeight = [int](($maxWidth / $img.Width) * $img.Height)
            $resized = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $g = [System.Drawing.Graphics]::FromImage($resized)
            $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.DrawImage($img, 0, 0, $newWidth, $newHeight)
            $g.Dispose()
            $img.Dispose()
            
            $tmpPath = "public\images\valentina\tmp_$f"
            $resized.Save($tmpPath, $encoder, $encoderParams)
            $resized.Dispose()
            Move-Item $tmpPath $path -Force
            $len = (Get-Item $path).Length
            Write-Host ("Resized {0} to {1} x {2}: {3} bytes" -f $f, $newWidth, $newHeight, $len)
        } else {
            $img.Dispose()
            Write-Host "$f width is already <= $maxWidth"
        }
    }
}

$bannerFiles = Get-ChildItem "public\images\banner-*.jpg"
foreach ($b in $bannerFiles) {
    $img = [System.Drawing.Bitmap]::FromFile($b.FullName)
    $maxWidth = 1000
    if ($img.Width -gt $maxWidth) {
        $newWidth = $maxWidth
        $newHeight = [int](($maxWidth / $img.Width) * $img.Height)
        $resized = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $g = [System.Drawing.Graphics]::FromImage($resized)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, $newWidth, $newHeight)
        $g.Dispose()
        $img.Dispose()

        $tmpPath = "$($b.FullName).tmp"
        $resized.Save($tmpPath, $encoder, $encoderParams)
        $resized.Dispose()
        Move-Item $tmpPath $b.FullName -Force
        $len = (Get-Item $b.FullName).Length
        Write-Host ("Resized banner {0} to {1} x {2}: {3} bytes" -f $b.Name, $newWidth, $newHeight, $len)
    } else {
        $img.Dispose()
    }
}

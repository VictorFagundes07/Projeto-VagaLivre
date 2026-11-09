$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$mobileRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $mobileRoot 'src\assets\logo.jpg'
$resPath = Join-Path $mobileRoot 'android\app\src\main\res'
$source = [System.Drawing.Image]::FromFile($sourcePath)
try {
    $sizes = @{mdpi=48; hdpi=72; xhdpi=96; xxhdpi=144; xxxhdpi=192}
    foreach ($density in $sizes.Keys) {
        $size = $sizes[$density]
        foreach ($round in @($false, $true)) {
            $bitmap = New-Object System.Drawing.Bitmap($size, $size)
            $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
            try {
                $graphics.Clear([System.Drawing.Color]::Transparent)
                $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                if ($round) {
                    $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
                    $clip.AddEllipse(0, 0, $size, $size)
                    $graphics.SetClip($clip)
                    $clip.Dispose()
                }
                $graphics.DrawImage($source, 0, 0, $size, $size)
                $name = if ($round) {'ic_launcher_round.png'} else {'ic_launcher.png'}
                $bitmap.Save((Join-Path $resPath "mipmap-$density\$name"), [System.Drawing.Imaging.ImageFormat]::Png)
            } finally {
                $graphics.Dispose()
                $bitmap.Dispose()
            }
        }
    }
    $nodpi = Join-Path $resPath 'drawable-nodpi'
    New-Item -ItemType Directory -Force -Path $nodpi | Out-Null
    Copy-Item -LiteralPath $sourcePath -Destination (Join-Path $nodpi 'vagalivre_launcher_logo.jpg') -Force
} finally {
    $source.Dispose()
}
Write-Output 'Ícones Android atualizados a partir da logo original.'

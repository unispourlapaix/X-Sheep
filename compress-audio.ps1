# Script de compression MP3 - Qualité radio Joint Stereo 92 kbps
# Pour X-Sheep par Emmanuel Payet

# Changer vers le dossier music
Set-Location -Path "public\music"

$inputFile = "Jojo notre beau Petit mouton.mp3"
$outputFile = "Jojo notre beau Petit mouton_radio92.mp3"

Write-Host "`n🎵 Compression MP3 - Qualité Radio Joint Stereo 92 kbps" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Vérifier si ffmpeg est installé
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-String "ffmpeg version" | Select-Object -First 1
    Write-Host "✅ FFmpeg détecté: $ffmpegVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg n'est pas installé!" -ForegroundColor Red
    Write-Host "`nInstallez FFmpeg avec:" -ForegroundColor Yellow
    Write-Host "  winget install FFmpeg" -ForegroundColor White
    Write-Host "ou téléchargez depuis: https://ffmpeg.org/download.html" -ForegroundColor White
    exit 1
}

# Vérifier si le fichier existe
if (-not (Test-Path $inputFile)) {
    Write-Host "❌ Fichier introuvable: $inputFile" -ForegroundColor Red
    exit 1
}

# Obtenir la taille du fichier original
$originalSize = (Get-Item $inputFile).Length / 1MB
Write-Host "`n📁 Fichier original: $([math]::Round($originalSize, 2)) MB" -ForegroundColor White

Write-Host "`n🔄 Compression en cours..." -ForegroundColor Yellow
Write-Host "   Bitrate: 92 kbps" -ForegroundColor Gray
Write-Host "   Mode: Joint Stereo" -ForegroundColor Gray
Write-Host "   Qualité: Radio" -ForegroundColor Gray

# Compression avec ffmpeg
# -b:a 92k : Bitrate audio à 92 kbps
# -joint_stereo 1 : Active le joint stereo
# -q:a 5 : Qualité VBR (0=meilleur, 9=pire) - 5 est bon pour du radio
$ffmpegArgs = @(
    "-i", "`"$inputFile`"",
    "-b:a", "92k",
    "-codec:a", "libmp3lame",
    "-q:a", "5",
    "-joint_stereo", "1",
    "-y",
    "`"$outputFile`""
)

try {
    $process = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -NoNewWindow -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        $compressedSize = (Get-Item $outputFile).Length / 1MB
        $reduction = (($originalSize - $compressedSize) / $originalSize) * 100
        
        Write-Host "`n✅ Compression réussie!" -ForegroundColor Green
        Write-Host "   Taille originale:  $([math]::Round($originalSize, 2)) MB" -ForegroundColor White
        Write-Host "   Taille compressée: $([math]::Round($compressedSize, 2)) MB" -ForegroundColor Cyan
        Write-Host "   Réduction:         $([math]::Round($reduction, 1))%" -ForegroundColor Yellow
        Write-Host "`n📂 Fichier créé: $outputFile" -ForegroundColor Green
        
        Write-Host "`n💡 Pour utiliser ce fichier dans le jeu:" -ForegroundColor Cyan
        Write-Host "   1. Renommez-le ou mettez à jour le code" -ForegroundColor White
        Write-Host "   2. Supprimez l'ancien si vous voulez" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erreur lors de la compression (Code: $($process.ExitCode))" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline

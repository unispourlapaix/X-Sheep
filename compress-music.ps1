# Script de compression MP3 - Qualité radio 92 kbps Joint Stereo
# Maximum 1 Mo

$musicPath = "c:\Users\dream\Documents\GitHub\X-Sheep\public\music"
$inputFile = "$musicPath\Jojo notre beau Petit mouton.mp3"
$outputFile = "$musicPath\Jojo notre beau Petit mouton_compressed.mp3"

Write-Host "`n🎵 Compression MP3 en cours..." -ForegroundColor Cyan

# Vérifier si FFmpeg est installé
try {
    $null = Get-Command ffmpeg -ErrorAction Stop
    Write-Host "✅ FFmpeg détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg non trouvé. Installez-le avec: winget install FFmpeg" -ForegroundColor Red
    exit 1
}

# Afficher la taille originale
$originalSize = (Get-Item $inputFile).Length
Write-Host "📦 Taille originale: $([math]::Round($originalSize/1MB, 2)) MB" -ForegroundColor Yellow

# Compression à 92 kbps joint stereo
Write-Host "`n🔄 Compression à 92 kbps joint stereo..." -ForegroundColor Cyan
ffmpeg -i $inputFile -b:a 92k -ac 2 -map 0:a -codec:a libmp3lame -joint_stereo 1 -y $outputFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    $compressedSize = (Get-Item $outputFile).Length
    $reduction = [math]::Round((1 - $compressedSize/$originalSize) * 100, 1)
    
    Write-Host "`n✅ Compression réussie!" -ForegroundColor Green
    Write-Host "📦 Nouvelle taille: $([math]::Round($compressedSize/1MB, 2)) MB" -ForegroundColor Yellow
    Write-Host "💾 Réduction: $reduction%" -ForegroundColor Cyan
    
    if ($compressedSize -le 1MB) {
        Write-Host "✅ Fichier sous 1 Mo!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Fichier toujours au-dessus de 1 Mo" -ForegroundColor Yellow
    }
    
    # Remplacer l'original
    Write-Host "`n📝 Remplacement du fichier original..." -ForegroundColor Cyan
    Move-Item $inputFile "$musicPath\Jojo notre beau Petit mouton_original.mp3" -Force
    Move-Item $outputFile $inputFile -Force
    
    Write-Host "✅ Fichier compressé remplacé avec succès!" -ForegroundColor Green
    Write-Host "Backup sauvegarde: Jojo notre beau Petit mouton_original.mp3" -ForegroundColor Gray
    
} else {
    Write-Host "`n❌ Erreur lors de la compression" -ForegroundColor Red
    exit 1
}

Write-Host "`nTermine! Vous pouvez maintenant git add, commit et push" -ForegroundColor Cyan

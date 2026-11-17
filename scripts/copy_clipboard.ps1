Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$filePath = "c:\laragon\www\pertanian padi cirebon girang\docs\figma_board.png"
if (Test-Path $filePath) {
    $img = [System.Drawing.Image]::FromFile($filePath)
    [System.Windows.Forms.Clipboard]::SetImage($img)
    Write-Output "SUCCESS: figma_board.png is now on your clipboard!"
} else {
    Write-Output "ERROR: file not found"
}

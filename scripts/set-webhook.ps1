# Установка webhook для Telegram-бота
# Использование: .\scripts\set-webhook.ps1 -Url "https://your-domain.vercel.app/api/telegram/webhook"

param(
    [Parameter(Mandatory=$true)]
    [string]$Url
)

$token = $env:TELEGRAM_BOT_TOKEN
if (-not $token) {
    Write-Error "Задайте переменную окружения TELEGRAM_BOT_TOKEN"
    exit 1
}

$apiUrl = "https://api.telegram.org/bot$token/setWebhook"
$body = @{ url = $Url } | ConvertTo-Json

$response = Invoke-RestMethod -Uri $apiUrl -Method Post -Body $body -ContentType "application/json"
if ($response.ok) {
    Write-Host "Webhook установлен: $Url"
} else {
    Write-Error "Ошибка: $($response.description)"
    exit 1
}

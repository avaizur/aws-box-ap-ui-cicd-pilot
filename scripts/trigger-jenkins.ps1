# Jenkins Trigger Script (Placeholder)
# Use this to test connectivity to your Jenkins instance

$JenkinsUrl = "<JENKINS_URL>"
$JobName = "aws-box-ap-ui-cd"
$User = "<CORP_EMAIL>"
$ApiToken = "<CORP_CREDENTIAL>"

Write-Host "Triggering Jenkins job: $JobName at $JenkinsUrl..." -ForegroundColor Cyan

$Url = "$JenkinsUrl/job/$JobName/build"
$Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$($User):$($ApiToken)"))

try {
    Invoke-RestMethod -Uri $Url -Method Post -Headers @{ Authorization = "Basic $Auth" }
    Write-Host "Successfully triggered Jenkins!" -ForegroundColor Green
} catch {
    Write-Host "Failed to trigger Jenkins. Error: $_" -ForegroundColor Red
}

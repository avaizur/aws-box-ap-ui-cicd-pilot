#!/bin/bash
set -e

echo "Starting Backend Pilot Deployment..."

# Zip the function
zip -r function.zip index.js package.json

# Update Lambda Function
echo "Updating Lambda function code for pilot..."
aws lambda update-function-code \
    --function-name aws-box-pilot-api \
    --zip-file fileb://function.zip \
    --region ${AWS_REGION:-us-east-1}

echo "Backend deployment completed."

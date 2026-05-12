#!/bin/bash
# cleanup.sh - Teardown all temporary validation infrastructure

set -e

# Configuration
PROJECT_NAME="aws-box-ap-val"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INFRA_DIR="$PROJECT_DIR/infrastructure"

echo "===================================================="
echo "Starting cleanup for project: $PROJECT_NAME"
echo "Project Directory: $PROJECT_DIR"
echo "===================================================="

if [ -d "$INFRA_DIR" ]; then
    cd "$INFRA_DIR"
    
    if [ -f "terraform.tfstate" ]; then
        echo "[1/2] Destroying AWS resources via Terraform..."
        # We assume AWS credentials are set in the environment or via profile
        terraform destroy -auto-approve
        
        echo "[2/2] Cleaning up local Terraform state and artifacts..."
        rm -rf .terraform .terraform.lock.hcl terraform.tfstate terraform.tfstate.backup
    else
        echo "No terraform.tfstate found. Nothing to destroy via Terraform."
    fi
else
    echo "Infrastructure directory not found. Skipping Terraform cleanup."
fi

echo "===================================================="
echo "Cleanup complete. All temporary resources destroyed."
echo "===================================================="

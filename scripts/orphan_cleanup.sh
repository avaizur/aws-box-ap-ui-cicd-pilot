#!/bin/bash
# orphan_cleanup.sh - Safely cleans up orphaned resources from failed pilot runs
# This specifically targets only resources prefixed with aws-box-ap-val

PROJECT="aws-box-ap-val"

echo "=== Orphan Cleanup for $PROJECT ==="

# 1. Delete App Runner Service
SVC_ARN=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='${PROJECT}-service'].ServiceArn" --output text)
if [ -n "$SVC_ARN" ] && [ "$SVC_ARN" != "None" ]; then
    echo "Deleting App Runner service: $SVC_ARN"
    aws apprunner delete-service --service-arn "$SVC_ARN" >/dev/null || true
    echo "Waiting for App Runner deletion..."
    sleep 30
fi

# 2. Delete ECR Repository
echo "Deleting ECR Repository: ${PROJECT}-repo"
aws ecr delete-repository --repository-name "${PROJECT}-repo" --force 2>/dev/null || echo "ECR repo not found or already deleted."

# 3. Delete RDS Instance
echo "Deleting RDS Instance: ${PROJECT}-db"
aws rds delete-db-instance --db-instance-identifier "${PROJECT}-db" --skip-final-snapshot 2>/dev/null || echo "RDS instance not found or already deleted."

# Wait for RDS to delete (it blocks subnets/security groups)
if aws rds describe-db-instances --db-instance-identifier "${PROJECT}-db" 2>/dev/null; then
    echo "Waiting for RDS deletion to complete..."
    aws rds wait db-instance-deleted --db-instance-identifier "${PROJECT}-db" 2>/dev/null || true
fi

# 4. Delete DB Subnet Group
echo "Deleting DB Subnet Group: ${PROJECT}-db-subnet-group"
aws rds delete-db-subnet-group --db-subnet-group-name "${PROJECT}-db-subnet-group" 2>/dev/null || echo "DB Subnet Group not found."

# 5. Delete IAM Role
echo "Deleting IAM Role Attachments & Role: ${PROJECT}-app-runner-access-role"
aws iam detach-role-policy --role-name "${PROJECT}-app-runner-access-role" --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess 2>/dev/null || true
aws iam delete-role --role-name "${PROJECT}-app-runner-access-role" 2>/dev/null || echo "IAM Role not found."

# 6. Delete VPC and its components
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=tag:Name,Values=${PROJECT}-vpc" --query "Vpcs[0].VpcId" --output text)

if [ -n "$VPC_ID" ] && [ "$VPC_ID" != "None" ]; then
    echo "Found orphaned VPC: $VPC_ID"

    # A. Delete Security Groups (except default)
    SG_IDS=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" --query "SecurityGroups[?GroupName!='default'].GroupId" --output text)
    for SG in $SG_IDS; do
        echo "Deleting Security Group: $SG"
        aws ec2 delete-security-group --group-id "$SG" 2>/dev/null || true
    done

    # B. Delete Subnets
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text)
    for SUBNET in $SUBNET_IDS; do
        echo "Deleting Subnet: $SUBNET"
        aws ec2 delete-subnet --subnet-id "$SUBNET" 2>/dev/null || true
    done

    # C. Detach and Delete Internet Gateways
    IGW_IDS=$(aws ec2 describe-internet-gateways --filters "Name=attachment.vpc-id,Values=$VPC_ID" --query "InternetGateways[*].InternetGatewayId" --output text)
    for IGW in $IGW_IDS; do
        echo "Detaching and Deleting IGW: $IGW"
        aws ec2 detach-internet-gateway --internet-gateway-id "$IGW" --vpc-id "$VPC_ID" 2>/dev/null || true
        aws ec2 delete-internet-gateway --internet-gateway-id "$IGW" 2>/dev/null || true
    done

    # D. Delete Route Tables (except main)
    RT_IDS=$(aws ec2 describe-route-tables --filters "Name=vpc-id,Values=$VPC_ID" --query "RouteTables[?Associations[0].Main!=true].RouteTableId" --output text)
    for RT in $RT_IDS; do
        echo "Deleting Route Table: $RT"
        aws ec2 delete-route-table --route-table-id "$RT" 2>/dev/null || true
    done

    # E. Finally, Delete VPC
    echo "Deleting VPC: $VPC_ID"
    aws ec2 delete-vpc --vpc-id "$VPC_ID" 2>/dev/null || echo "Failed to delete VPC $VPC_ID - might have remaining dependencies."
else
    echo "No orphaned VPC found."
fi

echo "=== Cleanup Finished ==="

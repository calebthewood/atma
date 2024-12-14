#!/bin/bash

# Configuration
HOST="[ip]"
SSH_ALIAS="[set in /.ssh/config]"
APP_DIR="/home/atma/atma"
SERVICE_NAME="atma-staging.service"

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying to production...${NC}"

ssh -tt $SSH_ALIAS << EOF
    set -x

    # Use su instead of sudo -u
    sudo su - atma << 'ENDBASH'
        cd $APP_DIR
        git stash
        git pull
        rm -rf node_modules
        rm -rf .next
        npm i --force
        npm run build
ENDBASH

    set -x
    echo "Restarting service..."
    sudo systemctl restart atma-staging.service

    echo "Checking service status..."
    sudo systemctl status atma-staging.service --no-pager

    echo "Recent application logs:"
    sudo journalctl --no-pager -u atma-staging.service -n 50
    set +x
    exit
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment completed successfully!${NC}"
else
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi

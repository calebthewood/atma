#!/bin/bash

# Configuration
HOST="[ip address]"
USER="[user]"
SSH_ALIAS="[from ssh config, if exists]"
APP_USER="[server user]"
APP_DIR="/home/atma/[app]"
SERVICE_NAME="atma-staging.service"

# Text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying to production...${NC}"

# SSH into server and run deployment commands
ssh $SSH_ALIAS /bin/bash << EOF
    # Print commands and exit on errors
    set -xe

    echo -e "${GREEN}Switching to $APP_USER user...${NC}"
    sudo su - $APP_USER << ATMA_COMMANDS
        echo -e "${GREEN}Navigating to app directory...${NC}"
        cd $APP_DIR

        echo -e "${GREEN}Pulling latest changes...${NC}"
        git stash
        git pull

        echo -e "${GREEN}Installing dependencies and building...${NC}"
        npm ci
        npm run build

        exit
ATMA_COMMANDS

    echo -e "${GREEN}Restarting service...${NC}"
    sudo systemctl restart $SERVICE_NAME

    echo -e "${GREEN}Checking service status...${NC}"
    sudo systemctl status $SERVICE_NAME --no-pager
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment completed successfully!${NC}"
else
    echo -e "${RED}Deployment failed!${NC}"
    exit 1
fi
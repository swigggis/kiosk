#!/bin/bash

# Deployment-Skript für Debian 12 Server
# Dieses Skript sollte auf dem Server ausgeführt werden

echo "🍴 Schulkiosk BBS2 Celle - Deployment"
echo "======================================"

# Farben für Output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Projekt-Verzeichnis
PROJECT_DIR="/root/schulkiosk"

echo -e "${BLUE}1. Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Installing...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js $(node --version) is installed${NC}"
fi

echo -e "${BLUE}2. Installing dependencies...${NC}"
npm install

echo -e "${BLUE}3. Building frontend...${NC}"
npm run build

echo -e "${BLUE}4. Setting up systemd service...${NC}"
if [ -f "schulkiosk.service" ]; then
    # Update WorkingDirectory and ExecStart paths
    sed -i "s|WorkingDirectory=.*|WorkingDirectory=$PROJECT_DIR|" schulkiosk.service
    sed -i "s|ExecStart=.*|ExecStart=/usr/bin/node $PROJECT_DIR/server.js|" schulkiosk.service
    
    cp schulkiosk.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable schulkiosk
    echo -e "${GREEN}Service installed and enabled${NC}"
else
    echo -e "${RED}schulkiosk.service file not found${NC}"
fi

echo -e "${BLUE}5. Starting service...${NC}"
systemctl restart schulkiosk

echo -e "${BLUE}6. Checking service status...${NC}"
systemctl status schulkiosk --no-pager

echo ""
echo -e "${GREEN}======================================"
echo "Deployment completed!"
echo "======================================"
echo ""
echo "The application should now be running on port 3000"
echo ""
echo "URLs:"
echo "  - Customer orders: http://YOUR_SERVER:3000/"
echo "  - Kitchen:         http://YOUR_SERVER:3000/kitchen"
echo "  - Display:         http://YOUR_SERVER:3000/display"
echo ""
echo "Password for kitchen and display: SchKosk142026#"
echo ""
echo "Commands:"
echo "  - View logs:    journalctl -u schulkiosk -f"
echo "  - Stop service: systemctl stop schulkiosk"
echo "  - Start service: systemctl start schulkiosk"
echo "  - Restart service: systemctl restart schulkiosk"
echo -e "${NC}"

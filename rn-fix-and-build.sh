#!/bin/bash

# React Native iOS Fix and Clean Build Script
# This script:
# 1. Applies sandboxing fix to Podfile
# 2. Disables Hermes
# 3. Performs a complete clean build

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the project directory (current directory or first argument)
PROJECT_DIR=${1:-$(pwd)}

echo -e "${GREEN}🔧 React Native iOS Fix and Build Script${NC}"
echo -e "Working directory: $PROJECT_DIR\n"

# Change to project directory
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Failed to change to directory: $PROJECT_DIR${NC}"; exit 1; }

# Check if this is a React Native project
if [ ! -f "ios/Podfile" ]; then
    echo -e "${RED}❌ Error: ios/Podfile not found. Are you in a React Native project root?${NC}"
    exit 1
fi

# Function to apply Podfile fixes
apply_podfile_fixes() {
    echo -e "${YELLOW}📝 Applying Podfile fixes...${NC}"
    
    # Create a backup of the original Podfile
    cp ios/Podfile ios/Podfile.backup
    
    # Check if post_install block exists
    if grep -q "post_install do |installer|" ios/Podfile; then
        # Add sandboxing fix after existing post_install
        sed -i '' '/post_install do |installer|/a\
\  # Fix User Script Sandboxing\
\  installer.pods_project.targets.each do |target|\
\    target.build_configurations.each do |config|\
\      config.build_settings['"'"'ENABLE_USER_SCRIPT_SANDBOXING'"'"'] = '"'"'NO'"'"'\
\    end\
\  end\
\  \
\  installer.aggregate_targets.each do |target|\
\    target.user_project.targets.each do |project_target|\
\      project_target.build_configurations.each do |config|\
\        config.build_settings['"'"'ENABLE_USER_SCRIPT_SANDBOXING'"'"'] = '"'"'NO'"'"'\
\      end\
\    end\
\    target.user_project.save\
\  end\
' ios/Podfile
    else
        # Add new post_install block at the end
        cat >> ios/Podfile << 'EOF'

post_install do |installer|
  # Fix User Script Sandboxing
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
    end
  end
  
  installer.aggregate_targets.each do |target|
    target.user_project.targets.each do |project_target|
      project_target.build_configurations.each do |config|
        config.build_settings['ENABLE_USER_SCRIPT_SANDBOXING'] = 'NO'
      end
    end
    target.user_project.save
  end
  
  # React Native default post_install
  react_native_post_install(
    installer,
    config[:reactNativePath],
    :mac_catalyst_enabled => false
  )
end
EOF
    fi
    
    # Disable Hermes in Podfile
    if grep -q ":hermes_enabled" ios/Podfile; then
        # Replace existing hermes_enabled setting
        sed -i '' 's/:hermes_enabled => true/:hermes_enabled => false/g' ios/Podfile
    else
        # Add hermes_enabled => false to use_react_native!
        sed -i '' '/use_react_native!(/a\
\    :hermes_enabled => false,' ios/Podfile
    fi
    
    echo -e "${GREEN}✅ Podfile fixes applied${NC}"
}

# Function to disable Hermes in package.json
disable_hermes_android() {
    echo -e "${YELLOW}📝 Disabling Hermes for Android...${NC}"
    
    if [ -f "package.json" ]; then
        # Use a temporary file for the modification
        jq '.react = (.react // {}) | .react["hermes-enabled"] = false' package.json > package.json.tmp && mv package.json.tmp package.json
        echo -e "${GREEN}✅ Hermes disabled for Android${NC}"
    else
        echo -e "${RED}⚠️  Warning: package.json not found${NC}"
    fi
}

# Function to perform clean build
clean_build() {
    echo -e "\n${YELLOW}🧹 Starting clean build process...${NC}"
    
    # Remove node_modules
    echo -e "${YELLOW}Removing node_modules...${NC}"
    rm -rf node_modules
    
    # Remove iOS build artifacts
    echo -e "${YELLOW}Removing iOS build artifacts...${NC}"
    rm -rf ios/Pods
    rm -f ios/Podfile.lock
    
    # Clean npm/yarn cache (optional)
    echo -e "${YELLOW}Cleaning package manager cache...${NC}"
    if command -v yarn &> /dev/null; then
        yarn cache clean
    else
        npm cache clean --force
    fi
    
    # Install node modules
    echo -e "${YELLOW}Installing node modules...${NC}"
    if [ -f "yarn.lock" ]; then
        yarn install
    else
        npm install
    fi
    
    # Clear Xcode derived data
    echo -e "${YELLOW}Clearing Xcode derived data...${NC}"
    rm -rf ~/Library/Developer/Xcode/DerivedData
    
    # Fix permissions and install pods
    echo -e "${YELLOW}Fixing iOS permissions and installing pods...${NC}"
    cd ios
    sudo chown -R $(whoami) .
    chmod -R 755 .
    rm -rf Pods Podfile.lock
    pod install
    cd ..
    
    echo -e "${GREEN}✅ Clean build complete!${NC}"
}

# Main execution
echo -e "${YELLOW}Choose an option:${NC}"
echo "1) Apply fixes only (Podfile + Hermes)"
echo "2) Apply fixes and run clean build"
echo "3) Clean build only (no fixes)"
echo "4) Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        apply_podfile_fixes
        disable_hermes_android
        echo -e "\n${GREEN}✅ All fixes applied!${NC}"
        echo -e "Run 'cd ios && pod install' to apply the changes"
        ;;
    2)
        apply_podfile_fixes
        disable_hermes_android
        clean_build
        echo -e "\n${GREEN}🎉 Everything complete! You can now run:${NC}"
        echo -e "npx react-native run-ios"
        ;;
    3)
        clean_build
        echo -e "\n${GREEN}🎉 Clean build complete! You can now run:${NC}"
        echo -e "npx react-native run-ios"
        ;;
    4)
        echo -e "${YELLOW}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting...${NC}"
        exit 1
        ;;
esac
#!/bin/bash

# Initialize project
yarn init -y

# Add TypeScript and initialize config
yarn add typescript --dev
npx tsc --init

# Create src directory and index.ts
mkdir -p src
echo 'console.log("Hello, TypeScript");' > src/index.ts

# Modify tsconfig.json to include custom typeRoots
# npx json -I -f tsconfig.json -e 'this.compilerOptions.typeRoots=["./node_modules/@types", "./src/types"]'

# Add ts-node
yarn add ts-node --dev

# Add scripts to package.json
npx json -I -f package.json \
  -e 'this.scripts={"build":"tsc","start":"node dist/index.js","dev":"ts-node src/index.ts"}'

# Create README
touch readme.md

# Create .gitignore
echo -e "node_modules/\n.env" > .gitignore

# Initialize git
git init

# Create .env file
touch .env

# Add dotenv
yarn add dotenv

# Add Prettier config
echo -e '{\n  "tabWidth": 4,\n  "useTabs": false\n}' > .prettierrc

# Add TypeScript types for Node
yarn add @types/node --dev

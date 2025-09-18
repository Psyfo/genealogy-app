#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# Neo4j Database Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Next.js Configuration
NEXT_PUBLIC_APP_NAME=Family Tree
NEXT_PUBLIC_APP_DESCRIPTION=Discover Your Heritage
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
  console.log('📝 Please update the Neo4j credentials in .env.local');
} else {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');
    console.log('📝 Please update the Neo4j credentials in .env.local');
    console.log('🔧 Default values:');
    console.log('   NEO4J_URI=bolt://localhost:7687');
    console.log('   NEO4J_USER=neo4j');
    console.log('   NEO4J_PASSWORD=password');
  } catch (error) {
    console.error('❌ Failed to create .env.local:', error.message);
    process.exit(1);
  }
}

console.log('\n🚀 Next steps:');
console.log('1. Start your Neo4j database');
console.log('2. Update the credentials in .env.local');
console.log('3. Run: npm run dev');

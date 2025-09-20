#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('🎓 WhatsApp Study Bot Setup');
    console.log('============================\n');

    try {
        // Check if .env already exists
        if (fs.existsSync('.env')) {
            const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
            if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
                console.log('Setup cancelled.');
                rl.close();
                return;
            }
        }

        console.log('Please provide your WhatsApp Business API credentials:');
        console.log('(You can get these from https://developers.facebook.com)\n');

        const accessToken = await question('WhatsApp Access Token: ');
        const phoneNumberId = await question('Phone Number ID: ');
        const verifyToken = await question('Webhook Verify Token: ');
        const port = await question('Server Port (default: 3000): ') || '3000';

        // Create .env file
        const envContent = `# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=${accessToken}
WHATSAPP_PHONE_NUMBER_ID=${phoneNumberId}
WHATSAPP_WEBHOOK_VERIFY_TOKEN=${verifyToken}

# Server Configuration
PORT=${port}
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./database/questions.db
`;

        fs.writeFileSync('.env', envContent);
        console.log('\n✅ .env file created successfully!');

        // Create database directory if it doesn't exist
        if (!fs.existsSync('database')) {
            fs.mkdirSync('database');
            console.log('✅ Database directory created');
        }

        console.log('\n🚀 Setup complete! You can now run:');
        console.log('   npm install  (if not already done)');
        console.log('   npm run dev  (for development)');
        console.log('   npm start    (for production)');
        console.log('\n📖 Don\'t forget to:');
        console.log('   1. Set up your webhook URL in Meta Developer Console');
        console.log('   2. Subscribe to "messages" events');
        console.log('   3. Test your bot by sending a message to your WhatsApp Business number');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

setup();
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Airtable Webhook Monitor...');
console.log('📸 Monitoring "Digital download request" table for new entries');
console.log('⏰ Auto-refresh: every 6 days');
console.log('🔍 Check for new entries: every 5 minutes');
console.log('');

// Start the SvelteKit dev server
const server = spawn('npm', ['run', 'dev'], {
	stdio: 'inherit',
	shell: true,
	cwd: __dirname
});

// Handle server exit
server.on('close', (code) => {
	console.log(`\n❌ Server stopped with code ${code}`);
	process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
	console.log('\n🛑 Shutting down server...');
	server.kill('SIGINT');
});

process.on('SIGTERM', () => {
	console.log('\n🛑 Shutting down server...');
	server.kill('SIGTERM');
});

console.log('✅ Server started! Check the console for webhook activity.');
console.log('📝 New digital download requests will be logged here.');
console.log('');

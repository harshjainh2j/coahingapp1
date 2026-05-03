const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function runSetup() {
  console.log("=========================================");
  console.log("Coaching Management App - Setup Wizard");
  console.log("=========================================\n");

  const mongoURI = await askQuestion("Enter your MongoDB URI (e.g., mongodb://localhost:27017/coaching): ");
  const jwtSecret = await askQuestion("Enter a JWT Secret string (e.g., your_super_secret_key): ");
  const serverPort = await askQuestion("Enter Backend Server Port (default: 5000): ");

  const actualPort = serverPort || "5000";
  const actualMongoURI = mongoURI || "mongodb://localhost:27017/coaching";
  const actualJwtSecret = jwtSecret || "default_jwt_secret_please_change_in_production";

  // Generate Backend .env
  const backendEnvContent = `PORT=${actualPort}
MONGODB_URI=${actualMongoURI}
JWT_SECRET=${actualJwtSecret}
`;

  // Generate Frontend .env
  const frontendEnvContent = `NEXT_PUBLIC_API_URL=http://localhost:${actualPort}/api
`;

  const serverDir = path.join(__dirname, 'server');
  const clientDir = path.join(__dirname, 'client');

  if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir, { recursive: true });
  if (!fs.existsSync(clientDir)) fs.mkdirSync(clientDir, { recursive: true });

  fs.writeFileSync(path.join(serverDir, '.env'), backendEnvContent);
  fs.writeFileSync(path.join(clientDir, '.env.local'), frontendEnvContent);

  console.log("\n✅ Configuration successful!");
  console.log(`- Backend .env generated in /server`);
  console.log(`- Frontend .env.local generated in /client`);
  
  rl.close();
}

runSetup();

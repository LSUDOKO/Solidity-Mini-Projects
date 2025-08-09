const { spawn } = require('child_process');
const http = require('http');

// Function to check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function startDevelopment() {
  console.log('🚀 Starting Millow Development Environment...\n');

  // Check if metadata server port is available
  const metadataPortAvailable = await checkPort(8080);
  
  if (metadataPortAvailable) {
    console.log('📁 Starting metadata server on port 8080...');
    const metadataServer = spawn('node', ['serve-metadata.js'], {
      stdio: 'inherit',
      shell: true
    });

    // Wait a moment for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  } else {
    console.log('⚠️  Port 8080 is busy, metadata server might already be running');
  }

  console.log('📦 Deploying contracts...');
  const deploy = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js'], {
    stdio: 'inherit',
    shell: true
  });

  deploy.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Contracts deployed successfully!');
      console.log('\n🌐 Starting React frontend...');
      
      const frontend = spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true
      });
    } else {
      console.error('❌ Contract deployment failed');
    }
  });
}

startDevelopment().catch(console.error);
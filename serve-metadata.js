const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/1.json') {
    const metadata = fs.readFileSync(path.join(__dirname, 'metadata', '1.json'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(metadata);
  } else if (req.url === '/2.json') {
    const metadata = fs.readFileSync(path.join(__dirname, 'metadata', '2.json'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(metadata);
  } else if (req.url === '/3.json') {
    const metadata = fs.readFileSync(path.join(__dirname, 'metadata', '3.json'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(metadata);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Metadata server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  http://localhost:8080/1.json');
  console.log('  http://localhost:8080/2.json');
  console.log('  http://localhost:8080/3.json');
});
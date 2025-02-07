import http from 'node:http';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

import brightness from 'brightness';

export async function setBrightness(value: number) {

  try {
    await brightness.set(value);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

const server = http.createServer((
    req: http.IncomingMessage,
    res: http.ServerResponse
) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Echo Request
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => body += chunk.toString());
    req.on('end', async () => {
      res.writeHead(200, { 'Content-Type': "application/json" });
      const json = JSON.parse(body);
      const result = await setBrightness(json.value);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // Fail on all other requests
  res.writeHead(404, { 'Content-Type': "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
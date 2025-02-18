import http from 'node:http';
import loudness from 'loudness';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

// const mute = await loudness.getMuted()
// const vol = await loudness.getVolume()
// await loudness.setMuted(true)

type MessageBody = { 
    score: number 
}

export async function setVolume({ score }: MessageBody) {
  try {
    if (score === null) return { success: false, error: "Invalid score" }; // NaN was sent
    const volume = Math.max(0, Math.min(1, score)) * 100
    await loudness.setVolume(volume)
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
      const result = await setVolume(json);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // Fail on all other requests
  res.writeHead(404, { 'Content-Type': "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
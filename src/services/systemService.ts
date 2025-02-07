import http from 'node:http';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

import os from "os";

let __brightnessModule: any;
const getBrightnessModuleName = async () => __brightnessModule = __brightnessModule || import("brightness");


export async function setBrightness(value: number) {

  try {
    const brightnessModule = await getBrightnessModuleName();
    await brightnessModule.set(value);
    console.log(`Brightness set to ${value}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to set brightness:", error);
    return { success: false, error };
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
    req.on('end', () => {

      res.writeHead(200, { 'Content-Type': req.headers['content-type'] || 'text/plain' });
      res.end(body);
      return;

      res.writeHead(200, { 'Content-Type': "application/json" });
      
      // Set Brightness
      const json = JSON.parse(body);
      console.log("Setting brightness to", json);
      const result = setBrightness(json.value);
      res.end(JSON.stringify(result));
    });
    return;
  }

  // Default Response
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
  return;

});

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
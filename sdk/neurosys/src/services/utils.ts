import http from 'node:http';

export type Handlers = {
  post:  (path: string, json: any) => any,
  get: (path: string) => any,
}

function encodeFunctions(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'function') {
      return value.toString();
    }
    return value;
  });
}


export const createServer = (handlers: Handlers) => {

    const server = http.createServer(async (
        req: http.IncomingMessage,
        res: http.ServerResponse
    ) => {
    
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    
      const resolvedURL = req.url as string;

      if (req.method === 'POST' && handlers.post) {
        let body = '';
        req.on('data', (chunk) => body += chunk.toString());
        req.on('end', async () => {
          res.writeHead(200, { 'Content-Type': "application/json" });
          const { args, ctx } = JSON.parse(body);
          const result = await handlers.post.call(ctx, resolvedURL, ...args);
          res.end(JSON.stringify(result));
        });
        return;
      }

      if (req.method === 'GET' && handlers.get) {
        const result = await handlers.get(resolvedURL);
        res.end(encodeFunctions(result));
        return;
      }
    
      // Fail on all other requests
      res.writeHead(404, { 'Content-Type': "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    });
    
    return server
}
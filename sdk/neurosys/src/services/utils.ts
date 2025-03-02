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

const SUBSCRIBABLE: Record<string, Function> = {}

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

      let result = { code: 404, error: "Not Found" }

      // Handle post requests
      if (req.method === 'POST' && handlers.post) {
        result = await new Promise((resolve) => {;
          let body = '';
          req.on('data', (chunk) => body += chunk.toString());
          req.on('end', async () => {
            const { args, ctx } = JSON.parse(body);
            const result = await handlers.post.call(ctx, resolvedURL, ...args);
            resolve({ ...result , ctx }); // Send back the context
          });
        })
      }

      // Handle get requests
      else if (req.method === 'GET') {
        const hasSubscribe = SUBSCRIBABLE[resolvedURL]

        if (hasSubscribe) {
          
          res.writeHead(200, { 
            'Content-Type': "text/event-stream",
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          hasSubscribe((...args) => {
            res.write(`data: ${encodeFunctions(args)}\n\n`);
          })

          // Don't end the response immediately
          return req.on('close', () => {
            res.end();
          });
        }

        else if (handlers.get) result = await handlers.get(resolvedURL);
        
      }

      const { code = 200, subscribe, ...rest } = result;
      if (subscribe) SUBSCRIBABLE[resolvedURL] = subscribe

      res.writeHead(code, { 'Content-Type': "application/json" });
      res.end(encodeFunctions(rest))
    });
    
    return server
}
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

      // Check if request is for an event stream
      

      console.log('PINGING', req.method, resolvedURL)

      let result = { code: 404, error: "Not Found" }

      const isGet = req.method === 'GET';
      if (req.method === 'POST' && handlers.post) {
        result = await new Promise((resolve) => {;
          let body = '';
          req.on('data', (chunk) => body += chunk.toString());
          req.on('end', async () => {
            const { args, ctx } = JSON.parse(body);
            const result = await handlers.post.call(ctx, resolvedURL, ...args);
            console.log('result', result)

            resolve(result);
          });
        })
      }

      else if (isGet && handlers.get) result = await handlers.get(resolvedURL);

      if (result.subscribe) {

          const { code = 200, ...rest } = result;

          console.log('SPECIAL', resolvedURL)

          res.writeHead(code, { 
            'Content-Type': "text/event-stream",
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
          });

          res.write(`result: ${encodeFunctions(rest)}\n\n`);

          result.subscribe((event) => {
            res.write(`data: ${encodeFunctions(event)}\n\n`);
          })

          req.on('close', () => {
            res.end();
          });

        return
      }

      const { code = 200, ...rest } = result;
      res.writeHead(code, { 'Content-Type': "application/json" });
      res.end(encodeFunctions(rest))
    });
    
    return server
}
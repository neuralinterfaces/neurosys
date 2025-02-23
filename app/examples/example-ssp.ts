// import { createService, registerOutputPlugins, Output } from 'neurosys/services';

import { createService, registerOutputPlugins, Output } from '../../sdk/neurosys/src/services';

const host = process.env.HOST || "localhost";
const port = process.env.PORT

const print = new Output({
    label: "Print — Server-Side Plugin",
    set: ({ score }) => console.log("Score", score)
});

// const server = createService({ print });

const server = createService({ 
    ...registerOutputPlugins({ print })
 });

server.listen(port, host, () => console.log(`Server running at http://${host}:${port}/`));
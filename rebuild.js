import { rebuild } from '@electron/rebuild';
import path from 'node:path';
import url from 'node: url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

rebuild({
    buildPath: __dirname,
    electronVersion: '31.7.1'
})

.then(() => console.info('Rebuild Successful'))
.catch((e) => {
    console.error("Building modules didn't work!");
    console.error(e);
});
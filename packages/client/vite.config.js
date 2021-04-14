import fs from 'fs';
import { defineConfig, loadEnv } from 'vite'
import config from "config";

export default defineConfig((props) => {
    const env = loadEnv('', process.cwd() + '../../');
    process.env = {
        ...process.env,
        ...env,
        publicRuntimeConfig: JSON.stringify(config.get('publicRuntimeConfig'))
    };

    return {
        plugins: [],
        server: {
            https: {
                key: fs.readFileSync('../../certs/key.pem'),
                cert: fs.readFileSync('../../certs/cert.pem')
            }
        },
        resolve: {
            alias: {
                '@material-ui/core': '@material-ui/core/esm',
                '@material-ui/icons': '@material-ui/icons/esm',
                "socket.io-client": "socket.io-client/dist/socket.io.js",
                "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
            }
        },
        define: {
            'process.env': process.env,
            'global': "window"
        },
    }
})

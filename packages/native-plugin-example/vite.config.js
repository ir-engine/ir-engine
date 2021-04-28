import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(() => {
    const env = loadEnv('', process.cwd() + '../../');
    process.env = {
        ...process.env,
        ...env,
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
                '@material-ui/icons': '@material-ui/icons/esm',
                "socket.io-client": "socket.io-client/dist/socket.io.js",
                "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
            }
        },
        define: {
            'process.env': process.env,
            'process.browser': process.browser,
        },
        build: {
            sourcemap: 'inline',
            outDir:'www',
            assetsDir: 'assets',
            rollupOptions: {
                output: {
                    // dir: 'dist',
                    format: 'es',
                },
            }
        }
    }
})

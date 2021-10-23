import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import config from "config";

const replaceEnvs = (obj, env) => {
    let result = {};

    for (let key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
            result[key] = replaceEnvs(obj[key], env);
            continue;
        }

        result[key] = obj[key];

        if (typeof obj[key] !== 'string') {
            continue;
        }

        const matches = Array.from(obj[key].matchAll(/\$\{[^}]*\}+/g), m => m[0]);

        for (let match of matches) {
            result[key] = result[key].replace(match, env[match.substring(2, match.length - 1)])
        }
    }

    return result;
}

export default defineConfig(() => {
    const env = loadEnv('', process.cwd() + '../../');
    const runtime = replaceEnvs(config.get('publicRuntimeConfig'), env);
    process.env = {
        ...process.env,
        ...env,
        publicRuntimeConfig: JSON.stringify(runtime)
    };

    return {
        plugins: [],
        server: { 
            // hmr: {
            //     port: 443
            // },
            https: {
                key: fs.readFileSync('../../certs/key.pem'),
                cert: fs.readFileSync('../../certs/cert.pem')
            }
        },
        resolve: {
            alias: {
                "socket.io-client": "socket.io-client/dist/socket.io.js",
                "react-infinite-scroller": "react-infinite-scroller/dist/InfiniteScroll",
            }
        },
        define: {
            'process.env': process.env,
            'process.browser': process.browser,
        },
        build: {
            target: 'esnext',
            sourcemap: 'inline',
            minify: 'esbuild',
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

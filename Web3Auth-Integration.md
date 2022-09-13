# Web3Auth Integration to XREngine

Here are the ways to integrate web3auth to XREngine.

## Node Modules to setup

- DevDependencies

```json
    "@keplr-wallet/background": "^0.10.16",
    "@keplr-wallet/common": "^0.10.16",
    "@keplr-wallet/cosmos": "^0.9.16",
    "@keplr-wallet/hooks": "^0.10.16",
    "@keplr-wallet/types": "^0.9.12",
    "@types/create-hash": "^1.2.2",
    "@vitejs/plugin-react": "^1.3.2",
    "assert": "^2.0.0",
    "bip32": "^2.0.6",
    "bip39": "^3.0.4",
    "buffer": "^6.0.3",
    "create-hash": "^1.2.0",
    "crypto-browserify": "^3.12.0",
    "https-browserify": "^1.0.0",
    "os-browserify": "^0.3.0",
    "path-browserify": "^1.0.1",
    "stream-http": "^3.2.0",
    "stream-browserify": "^3.0.0",
```

- Dependencies

```json
    "@cosmjs/crypto": "^0.28.11",
    "@cosmjs/encoding": "^0.28.11",
    "@cosmjs/launchpad": "^0.27.1",
    "@cosmjs/proto-signing": "^0.28.11",
    "openlogin": "^2.4.0",
    "path-browserify": "^1.0.1",
    "vite-plugin-require": "^1.0.1",
    "@esbuild-plugins/node-globals-polyfill": "^0.1.1",
    "@esbuild-plugins/node-modules-polyfill": "^0.1.4",
    "rollup-plugin-node-builtins": "^2.1.2",
    "rollup-plugin-node-polyfills": "^0.2.1",
```

The shell command you should run: 

```bash
npm install --save-dev @keplr-wallet/background@^0.10.16 @keplr-wallet/common@^0.10.16 @keplr-wallet/cosmos@^0.9.16 @keplr-wallet/hooks@^0.10.16 @keplr-wallet/types@^0.9.12 @types/create-hash@^1.2.2 @vitejs/plugin-react@^1.3.2 assert@^2.0.0 bip32@^2.0.6 bip39@^3.0.4 buffer@^6.0.3 create-hash@^1.2.0 crypto-browserify@^3.12.0 https-browserify@^1.0.0 os-browserify@^0.3.0 path-browserify@^1.0.1 stream-browserify@^3.0.0 stream-http@^3.2.0

npm install --save @cosmjs/crypto@^0.28.11 @cosmjs/encoding@^0.28.11 @cosmjs/launchpad@^0.27.1 @cosmjs/proto-signing@^0.28.11 openlogin@^2.4.0 path-browserify@^1.0.1 vite-plugin-require@1.0.1 @esbuild-plugins/node-globals-polyfill@^0.1.1 @esbuild-plugins/node-modules-polyfill@^0.1.4 rollup-plugin-node-polyfills@^0.2.1
```

## Files To Add / Update

### Add

 - ProfileMenuWeb3Auth.tsx
 - web3.ts (publicKeyToReduceString)
 - Icons / *.ts
 - Web3AuthService.ts
 - ...

> ...

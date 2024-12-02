# Patch Notes

- `node-datachannel` has been patched to use `typeof process.version` to detect nodejs environment, instead of `typeof document`, since document is defined by `jsdom-global`

- `webrtc-polyfill` has been patched to handle CJS environment (see https://github.com/HexaField/webrtc-polyfill-node/tree/node-cjs) as wel as various bugfixes
# Tests

## End to End Tests

End to end tests run the full xrengine stack, including the client, database, api server, game server & file server. The engine is equipped with full WebXR testing enabled by the [WebXR Emulator](https://github.com/MozillaReality/WebXR-emulator-extension) and the [XREngine Bot](/packages/bot/) package. The bot runs with jest and puppeteer, running the chromium browser environment in headless mode.

## Integration & Unit Tests

Integration and unit tests run inside each package, using jest to test individual functions and modules.
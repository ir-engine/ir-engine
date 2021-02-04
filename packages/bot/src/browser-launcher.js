const puppeteer = require('puppeteer');
const fs = require('fs');

class BrowserLauncher_ {
    constructor() {}

    async browser(options) {
        console.log('Making new browser');
        console.log(this._browser);
        if (this._browser) return await this._browser

        if (fs.existsSync("/.dockerenv"))
        {
            options.headless = true
            options.args = (options.args || []).concat(['--no-sandbox', '--disable-setuid-sandbox'])
        }

        this._browser = puppeteer.launch(options);
        return await this._browser
    }
}

const BrowserLauncher = new BrowserLauncher_()

module.exports = {BrowserLauncher}
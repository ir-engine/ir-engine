const fs = require('fs')
const path = require('path')

const glob = require("glob")

const files = glob.sync('./**/*', { nodir: true }).map((file) => file.substr(2))
const manifest = require('./manifest.json')
manifest.files = files
fs.writeFileSync(path.resolve(__dirname, './manifest.json'), JSON.stringify(manifest, null, 2))
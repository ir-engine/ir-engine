const { exec } = require('child_process')
const util = require('util')

const promiseExec = util.promisify(exec)

const args = process.argv.slice(2)
args.map(async arg => {
    await promiseExec(`scripts/open_browser.sh ${arg}`)
})

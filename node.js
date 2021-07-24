
const dotenv = require("dotenv")
const killport = require("kill-port")
const { spawn } = require("child_process")

dotenv.config({
  path: './.env.local'
})

const killPorts = () => {
  [
    process.env.APP_PORT,
    process.env.MYSQL_PORT,
    process.env.SERVER_PORT,
    process.env.GAMESERVER_PORT,
    process.env.REDIS_PORT,
    process.env.APP_PORT,
  ].forEach((port) => {
    killport(port)
  })
}

killPorts()

const dev = spawn("npm", ["run", "dev"])

process.stdin.pipe(dev.stdin)

dev.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});
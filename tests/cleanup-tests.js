
const dotenv = require("dotenv")
const killport = require("kill-port")

dotenv.config({
  path: './.env.test'
})

const killPorts = () => {
  [ process.env.APP_PORT,
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
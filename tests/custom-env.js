
import dotenv from "dotenv"
import killport from "kill-port"
import { spawn } from "child_process"
import kill from 'tree-kill'

dotenv.config({
  path: './.env.local'
})

const killPorts = () => {
  [
    process.env.APP_PORT, // vite
    process.env.MYSQL_PORT, // docker
    process.env.REDIS_PORT, // redis
    process.env.SERVER_PORT, // api server
    process.env.GAMESERVER_PORT, // game server
    process.env.LOCAL_STORAGE_PROVIDER_PORT, // file server
  ].forEach((port) => {
    killport(port)
  })
}  

killPorts()
let dev 
let running = false
beforeAll(async () => {
  dev = spawn("npm", ["run", "dev"])

  // process.stdin.pipe(dev.stdin)
  const time = Date.now()
  await Promise.race([
    new Promise((resolve) => {
      const listen = (message) => {
        if(!running && message.toString().includes('Server Ready')) {
          console.log(`Successfully launched stack! Took ${Date.now() - time} seconds.`)
          dev.stdout.off('data', listen)
          resolve()
        }
      }
      dev.stdout.on('data', listen)
    }),
    new Promise((resolve) => {
      setTimeout(() => {
        if(running) return
        console.log('WARNING: Stack too long to launch! Tests will run anyway...')
        resolve()
      }, 30 * 1000)
    })
  ])
  running = true
}, 60 * 1000)

afterAll(async () => {
  await new Promise((resolve) => {
    dev.once(('exit'), resolve)
    dev.once(('error'), resolve)
    dev.once(('disconnect'), resolve)
    dev.stdin.pause()
    kill(dev.pid)
  })
  killPorts()
}, 60 * 1000);

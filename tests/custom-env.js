import fs from 'fs'
import dotenv from "dotenv"
import killport from "kill-port"
import { spawn } from "child_process"
import kill from 'tree-kill'
import { register } from 'trace-unhandled'
register()

dotenv.config({
  path: './.env.local'
})

const timeoutMS = 3 * 60 * 1000

process.env.CI = process.env.CI === 'true'
process.env.HEADLESS = process.env.CI

const killPorts = () => {
  if (process.platform.includes('darwin') === 'macOS') return // killing ports causes testing to fail on macOS
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
  let timeout
  
  /**
   * TODO: add checks to see if any errors occur while launching the stack to save time
   */

  process.stdin.pipe(dev.stdin)
  const time = Date.now()
  await Promise.race([
    new Promise((resolve) => {
      const listen = (message) => {
        if(!running) {
          console.log(message.toString()) // UNCOMMENT THIS FOR DEBUGGING LAUNCHING THE STACK
          if(message.toString().includes('Initialized new gameserver instance')) {
            console.log(`Successfully launched stack! Took ${(Date.now() - time) / 1000} seconds.`)
            dev.stdout.off('data', listen)
            resolve()
          }
        }
      }
      dev.stdout.on('data', listen)
    }),
    new Promise((resolve) => {
      timeout = setTimeout(() => {
        if(running) return
        console.log('WARNING: Stack too long to launch! Tests will run anyway...')
        resolve()
      }, timeoutMS)
    })
  ])
  running = true
  clearTimeout(timeout)
}, timeoutMS)

afterAll(async () => {
  await new Promise((resolve) => {
    dev.once(('exit'), resolve)
    dev.once(('error'), resolve)
    dev.once(('disconnect'), resolve)
    dev.stdin.pause()
    kill(dev.pid)
  })
  killPorts()
}, timeoutMS);


process.on('SIGTERM', async (err) => {
  console.log('[XREngine Tests]: Server SIGTERM')
  console.log(err)
})
process.on('SIGINT', () => {
  console.log('[XREngine Tests]: RECEIVED SIGINT')
  process.exit()
})

//emitted when an uncaught JavaScript exception bubbles
process.on('uncaughtException', (err) => {
  console.log('[XREngine Tests]: UNCAUGHT EXCEPTION')
  console.log(err)
  process.exit()
})

//emitted whenever a Promise is rejected and no error handler is attached to it
process.on('unhandledRejection', (reason, p) => {
  console.log('[XREngine Tests]: UNHANDLED REJECTION')
  console.log(reason)
  console.log(p)
  process.exit()
})
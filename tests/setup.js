import dotenv from "dotenv"
import killport from "kill-port"
import { spawn } from "child_process"
import kill from 'tree-kill'
import { register } from 'trace-unhandled'
import { getOS } from '@xrengine/common/src/utils/getOS'

register()

process.on('SIGTERM', async (err) => {
  console.log('[XREngine Tests]: Server SIGTERM')
  dev.stdin.pause()
  kill(dev.pid)
  killPorts()
  console.log(err)
})
process.on('SIGINT', () => {
  console.log('[XREngine Tests]: RECEIVED SIGINT')
  dev.stdin.pause()
  kill(dev.pid)
  killPorts()
  process.exit()
})

//emitted when an uncaught JavaScript exception bubbles
process.on('uncaughtException', (err) => {
  console.log('[XREngine Tests]: UNCAUGHT EXCEPTION')
  console.log(err)
  dev.stdin.pause()
  kill(dev.pid)
  killPorts()
  process.exit()
})

//emitted whenever a Promise is rejected and no error handler is attached to it
process.on('unhandledRejection', (reason, p) => {
  console.log('[XREngine Tests]: UNHANDLED REJECTION')
  console.log(reason)
  console.log(p)
  dev.stdin.pause()
  kill(dev.pid)
  killPorts()
  process.exit()
})

register()

const timeoutMS = 3 * 60 * 1000
// setting up and tearing down the engine causes testing to fail on Apple M1 systems
const skipEngineSetup = getOS() === 'macOS' && process.arch.includes('arm') 

process.env.CI = process.env.CI === 'true'

const killPorts = () => {
  if (skipEngineSetup) return
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

let dev 
let running = false

export const mochaHooks = {

  beforeAll: async () => {
    
    killPorts()
    if (skipEngineSetup)  {
      console.log("Skipping engine setup")
      return
    }

    console.log('starting stack!!!')

    dev = spawn("npm", ["run", "dev"])
    let timeout
    
    const log = (message) => {
      console.log(message.toString()) // UNCOMMENT THIS FOR DEBUGGING LAUNCHING THE STACK
    }
    dev.stdout.on('data', log)
    /**
     * TODO: add checks to see if any errors occur while launching the stack to save time
     */
    const awaitLog = (str) => {
      return new Promise((resolve) => {
        const listen = (message) => {
          if(!running) {
            if(message.toString().includes(str)) {
              dev.stdout.off('data', listen)
              resolve()
            }
          }
        }
        dev.stdout.on('data', listen)
      })
    }

    const launchStack = Promise.all([
      awaitLog('Initialized new gameserver instance'), // GS
      awaitLog('Server Ready'), // api
      awaitLog('dev server running at:'), // vite
    ])

    process.stdin.pipe(dev.stdin)
    const time = Date.now()
    await Promise.race([
      launchStack,
      new Promise((resolve) => {
        timeout = setTimeout(() => {
          if(running) return
          console.log('WARNING: Stack too long to launch! Tests will run anyway...')
          resolve()
        }, timeoutMS)
      })
    ])
    dev.stdout.off('data', log)
    running = true
    clearTimeout(timeout)
    console.log(`Successfully launched stack! Took ${(Date.now() - time) / 1000} seconds.`)
  },

  afterAll: async () => {
    if (!dev) return
    await new Promise((resolve) => {
      dev.once(('exit'), resolve)
      dev.once(('error'), resolve)
      dev.once(('disconnect'), resolve)
      dev.stdin.pause()
      kill(dev.pid)
    })
    killPorts()
  }
}
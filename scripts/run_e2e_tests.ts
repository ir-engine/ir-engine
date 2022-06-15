import childProcess from 'child_process'
import killPort from 'kill-port'

import config from '@xrengine/server-core/src/appconfig'

// we may need an alternative to kill-port for mac & windows

const killports = () => {
  killPort(config.server.port)
  killPort(config.instanceserver.port)
  killPort('3032') // todo, we should put this hardcoded val into env
  killPort(process.env.CORS_SERVER_PORT)
  killPort(process.env.VITE_APP_PORT)
  killPort(process.env.LOCAL_STORAGE_PROVIDER_PORT)
}

killports()
const logOutput = (child) => {
  child.stdout.setEncoding('utf8')
  child.stdout.on('data', function (data) {
    console.log(data)
  })
  child.stderr.setEncoding('utf8')
  child.stderr.on('data', function (data) {
    console.log(data)
  })
}

const devStack = childProcess.spawn('npm', ['run', 'dev'], { shell: process.platform === 'win32' })
logOutput(devStack)
const lernaE2E = childProcess.spawn('npx', ['lerna', 'run', 'test-e2e'], { shell: process.platform === 'win32' })
logOutput(lernaE2E)
lernaE2E.on('exit', (exitCode) => {
  console.log(`'lerna run test-e2e' exited with exit code`, exitCode)
  devStack.kill(exitCode!)
  process.exit(exitCode!)
})
devStack.on('exit', (exitCode) => {
  console.log(`'npm run dev' exited with exit code`, exitCode)
})
process.on('exit', (exitCode) => {
  console.log(`'npm run test-e2e' exited with exit code`, exitCode)
  killports()
  if (!lernaE2E.killed) lernaE2E.kill(exitCode)
  if (!devStack.killed) devStack.kill(exitCode)
})

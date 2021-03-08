#!/usr/bin/env node
import { exec } from 'child_process'
import path from 'path'
import clc from 'cli-color'
import fs from 'fs-extra'

const currentDir = path.resolve(process.cwd())
// Are we in a module or are we running xrengine from source?
let cwd = currentDir
const baseName = path.basename(currentDir)
// const isSubModule = fs.existsSync(currentDir + '/node_modules/xrengine/')
// if (isSubModule) cwd = currentDir + '/node_modules/xrengine/'
const [, , ...args] = process.argv

function showOptions() {
  console.log(clc.bold('Available Commands:'))
  console.log(
    clc.cyan('init').concat(clc.white(' - set your project up for development'))
  )
  console.log(
    clc.yellow('help').concat(clc.white(' - more info about xrengine'))
  )
  console.log(
    clc.green('dev').concat(clc.white(' - use this for local development'))
  )
  console.log(
    clc
      .green('dev-db')
      .concat(
        clc.white(' - start a local dev database') +
          clc.red(' (requires Docker)')
      )
  )
  console.log(
    clc.green('server').concat(clc.white(' - use this for CI/deployments'))
  )
  console.log(
    clc.green('test').concat(clc.white(' - use this to run xrengine tests\n'))
  )
}

function showHelp() {
  console.log(
    'Having issues? Submit a Github issue at: ' +
      clc.cyan('http://github.com/xr3ngine/xrengine')
  )
  console.log(
    'Want to read the documentation? You can find that at ' +
      clc.cyan('http://xrengine.school')
  )
  console.log(
    'You can also find us on Discord: ' +
      clc.cyan('https://discord.gg/cbQAmdV\n')
  )
  console.log(clc.blue('Made with <3 by people all over the world.'))
  console.log(
    clc.green(
      "If you are interested in contributing, we'd absolutely love to have you be involved. Let's build something beautiful together!"
    )
  )
}

function initialize() {
  if (baseName === 'xrengine' && !isSubModule) {
    if (!isSubModule)
      console.log(
        clc.red(
          'Initialization is only necessary if xrengine is running as a submodule'
        )
      )
    if (baseName === 'xrengine')
      console.log(
        clc.red(
          'Warning: Installing into folder xrengine, which is probably not what you want. Rename your folder if it is named xrengine'
        )
      )
    process.exit()
  }

  // Copy the folder structure setup
  fs.copySync(cwd + '/userFolders', currentDir + '/src')

  // Copy the config
  fs.copyFileSync(
    cwd + '/config/default.json',
    currentDir + '/xrengine.config.json'
  )

  // eslint
  fs.copyFileSync(cwd + '/client/.eslintrc.js', currentDir + '/.eslintrc.js')
  fs.copyFileSync(cwd + '/client/.stylelintrc', currentDir + '/.stylelintrc')
  fs.copyFileSync(cwd + '/client/.babelrc', currentDir + '/.babelrc')

  // tsconfig
  fs.copyFileSync(cwd + '/client/tsconfig.json', currentDir + '/tsconfig.json')

  console.log(clc.green('\nXREngine has been initialized!\n'))
  console.log(
    clc.cyan(
      'Documentation and Quickstart are availale at http://xrengine.school\n'
    )
  )
  console.log(
    clc.blue(
      'Make something beautiful with your time in this world :)\n'
    )
  )
  process.exit()
}

if (args.length > 1 || args.length < 1) {
  console.log(clc.red('\nError: xrengine takes one argument\n'))
  showOptions()
  process.exit()
}

let npmCommand

switch (args[0]) {
  case 'init':
    console.log(clc.green('Initializing xrengine...'))
    initialize()
    break
  case 'help':
    showHelp()
    process.exit()
  case 'dev':
    console.log(clc.green('Starting xrengine in development mode...'))
    npmCommand = 'npm run dev'
    break
  case 'dev-db':
    console.log(
      clc.green(
        'Starting development database... leave this running in the background!'
      )
    )
    npmCommand = 'npm run dev-db'
    break
  case 'server':
    npmCommand = 'npm run start'
    break
  case 'test':
    console.log(clc.green('Running tests...'))
    npmCommand = 'npm run test'
    break
  default:
    console.log(clc.red('\nError: invalid argument\n'))
    showOptions()
    process.exit()
}

execCommand(npmCommand)

function execCommand(command){
const cmd = exec(
  'echo ${CWD} && ' + npmCommand,
  { cwd },
  (error, stdout, stderr) => {
    if (error) console.error(clc.red(error))
    if (stdout) console.log(stdout)
    if (stderr) console.error(clc.magenta(stderr))
  }
)

cmd.stdout.on('data', (data) => console.log(data))
cmd.stderr.on('data', (data) => console.error(clc.magenta(data)))

cmd.on('close', (code) => {
  console.log(clc.green(`Process exited with code ${code}`))
})
}
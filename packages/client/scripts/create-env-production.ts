import cli from 'cli'
import fs from 'fs'
import appRootPath from 'app-root-path'

const prefixRegex = /^VITE_/
const lowercaseEnv = process.env.APP_ENV.toLowerCase()
const envPath = appRootPath.path + `/.env.${lowercaseEnv}`

cli.main(async () => {
  let output = ''
  for (let key of Object.keys(process.env)) {
    console.log('key', key, 'value', process.env[key])
    if (prefixRegex.test(key)) {
      console.log('Writing', key, process.env[key], 'to output')
      output = output.concat(`${key}=${process.env[key]}\n`)
    }
  }

  console.log('output to write', output)
  if (fs.existsSync(envPath)) fs.rmSync(envPath)
  fs.writeFileSync(envPath, output)

  process.exit(0)
})

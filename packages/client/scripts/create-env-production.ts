import appRootPath from 'app-root-path'
import cli from 'cli'
import fs from 'fs'

const prefixRegex = /^VITE_/
const lowercaseEnv = process.env.APP_ENV.toLowerCase()
const envPath = appRootPath.path + `/.env.${lowercaseEnv}`

cli.main(async () => {
  let output = ''
  for (let key of Object.keys(process.env)) {
    if (prefixRegex.test(key)) {
      output = output.concat(`${key}=${process.env[key]}\n`)
    }
  }

  if (fs.existsSync(envPath)) fs.rmSync(envPath)
  fs.writeFileSync(envPath, output)

  process.exit(0)
})

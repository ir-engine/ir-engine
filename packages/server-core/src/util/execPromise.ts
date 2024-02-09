import { exec } from 'child_process'

export function execPromise(cmd, opts) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      console.log(stdout ? stdout : stderr)
      resolve(stdout ? stdout : stderr)
    })
  })
}

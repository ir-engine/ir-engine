import simpleGit from 'simple-git'

import logger from '../ServerLogger'

export const useGit = (path?, options?) =>
  simpleGit(path, options).outputHandler((command, stdout, stderr) => {
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
    stdout.on('data', (data) => {
      logger.info(data.toString('utf8'))
    })
  })

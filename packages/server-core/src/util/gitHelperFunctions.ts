import simpleGit from 'simple-git'

export const useGit = (path?, options?) =>
  simpleGit(path, options).outputHandler((command, stdout, stderr) => {
    stdout.pipe(process.stdout)
    stderr.pipe(process.stderr)
    stdout.on('data', (data) => {
      console.log(data.toString('utf8'))
    })
  })

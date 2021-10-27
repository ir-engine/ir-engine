import simpleGit from 'simple-git'

const Git = simpleGit().outputHandler((command, stdout, stderr) => {
  stdout.pipe(process.stdout)
  stderr.pipe(process.stderr)
  stdout.on('data', (data) => {
    console.log(data.toString('utf8'))
  })
})

export const useGit = () => Git

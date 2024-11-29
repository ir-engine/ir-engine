import appRootPath from 'app-root-path'
import { ChildProcess, fork } from 'child_process'

export const startSubprocess = (scriptPath: string) => {
  const child: ChildProcess = fork(scriptPath, {
    execArgv: ['-r', 'ts-node/register'],
    cwd: appRootPath.path,
    stdio: 'inherit',
    detached: true
  })

  process.on('exit', async () => {
    process.kill(-child.pid!, 'SIGINT')
  })

  child.stdout?.pipe(process.stdout)

  return child
}

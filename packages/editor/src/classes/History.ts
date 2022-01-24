/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

import Command from '../commands/Command'

const ALLOWED_TIME_FOR_MERGER = 1000

export default class History {
  undos: Command[] = []
  redos: Command[] = []
  lastCmdTime = new Date()
  idCounter = 0
  commandUpdatesEnabled = true
  debug = false

  execute(cmd: Command): Command {
    const lastCmd = this.undos[this.undos.length - 1]
    const timeDifference = new Date().getTime() - this.lastCmdTime.getTime()

    if (
      this.commandUpdatesEnabled &&
      lastCmd &&
      lastCmd.constructor === cmd.constructor &&
      timeDifference < ALLOWED_TIME_FOR_MERGER &&
      lastCmd.shouldUpdate(cmd)
    ) {
      lastCmd.update(cmd)
      cmd = lastCmd

      if (this.debug) console.log(`update:`, cmd)
    } else {
      // the command is not updatable and is added as a new part of the history
      this.undos.push(cmd)
      cmd.id = ++this.idCounter
      cmd.execute()

      if (this.debug) console.log(`execute:`, cmd)
    }

    this.lastCmdTime = new Date()

    // clearing all the redo-commands
    this.redos = []

    return cmd
  }

  revert(checkpointId: number): void {
    if (this.undos.length === 0) {
      return
    }

    const lastCmd = this.undos[this.undos.length - 1]

    if (lastCmd && checkpointId > lastCmd.id) {
      console.warn('Tried to revert back to an undo action with an id greater than the last action')
      return
    }

    let cmd = this.undos.pop()!
    while (this.undos.length > 0 && checkpointId !== cmd.id) {
      cmd.undo()
      this.redos.push(cmd)

      if (this.debug) console.log(`revert: ${cmd}`)
      cmd = this.undos.pop()!
    }
  }

  undo(): Command | undefined {
    if (this.undos.length === 0) return

    const cmd = this.undos.pop()!
    cmd.undo()
    this.redos.push(cmd)

    if (this.debug) console.log(`undo: ${cmd}`)

    return cmd
  }

  redo(): Command | undefined {
    if (this.redos.length === 0) return

    const cmd = this.redos.pop()!
    cmd.undo()
    this.undos.push(cmd)

    if (this.debug) console.log(`redo: ${cmd}`)

    return cmd
  }

  getDebugLog(): string {
    return this.undos.map((cmd) => cmd.toString()).join('\n')
  }

  clear(): void {
    this.undos = []
    this.redos = []
    this.idCounter = 0
  }
}

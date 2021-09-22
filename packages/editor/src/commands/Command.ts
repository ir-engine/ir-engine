/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */

export interface CommandParams {
  shouldEmitEvent?: boolean
  shouldGizmoUpdate?: boolean
  isObjectSelected?: boolean
}

export default class Command {
  /** Id of the commnad used to track undo and redo state */
  id: number = -1

  /** An Object which is affected by this command */
  affectedObjects: any[]

  /** Name to be print on debug string */
  displayName?: string

  /** Whether the event should be emited of not */
  shouldEmitEvent: boolean

  /** Whether the transform root should be emited of not */
  shouldGizmoUpdate: boolean

  /** Whether the object is selected or not */
  isSelected?: boolean

  /** State before this command executed. Useful while undo */
  prevState: any

  /** Old selected objects prior to this command execution */
  oldSelection: any

  constructor(objects?: any, params?: CommandParams) {
    this.shouldEmitEvent = params.shouldEmitEvent ?? true
    this.shouldGizmoUpdate = params.shouldGizmoUpdate ?? true
    this.isSelected = params.isObjectSelected ?? true
  }

  /** Executes the command logic */
  execute(isRedoCommand?: boolean): void {}

  /** Checks whether the command should update its state or not */
  shouldUpdate(newCommand: Command): boolean {
    return false
  }

  /** Updates the commnad state */
  update(command: Command): void {}

  /** Undo the command effect */
  undo(): void {}

  /** Returns the string representation of the command */
  toString(): string {
    return `${this.displayName ?? this.constructor.name} id: ${this.id}`
  }

  /** Emits event before executing this function */
  emitBeforeExecuteEvent() {}

  /** Emits event after executing this function */
  emitAfterExecuteEvent() {}
}

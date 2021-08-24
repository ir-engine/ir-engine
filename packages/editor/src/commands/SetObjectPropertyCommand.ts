import Command from './Command'
import { serializeObject3D, serializeProperty } from '../functions/debug'
export default class SetObjectPropertyCommand extends Command {
  object: any
  propertyNotation: any
  newValue: any
  oldValue: any
  constructor(editor, object, propertyNotation, value) {
    super(editor)
    const nestProp = propertyNotation.split('.')
    this.object = object
    this.propertyNotation = propertyNotation
    if (value && value.clone) {
      this.newValue = value.clone()
    } else {
      this.newValue = value
    }
    ///
    let interestObj = this.object
    nestProp.forEach((element) => {
      const thing = interestObj[element]
      if (thing === '') {
        console.log('Error while getting values')
        return
      }
      interestObj = interestObj[element]
    })
    ///
    const oldValue = interestObj
    if (oldValue && oldValue.clone) {
      this.oldValue = oldValue.clone()
    } else {
      this.oldValue = oldValue
    }
  }
  execute() {
    this.editor.setObjectProperty(this.propertyNotation, this.newValue, false)
  }
  shouldUpdate(newCommand) {
    return this.object === newCommand.object && this.propertyNotation === newCommand.propertyNotation
  }
  update(command) {
    const newValue = command.newValue
    if (newValue && newValue.clone && newValue.copy) {
      this.newValue = newValue.clone()
    } else {
      this.newValue = newValue
    }
    this.editor.setObjectProperty(this.propertyNotation, this.newValue, false)
  }
  undo() {
    this.editor.setObjectProperty(this.propertyNotation, this.oldValue, false)
  }
  toString() {
    return `SetPropertyCommand id: ${this.id} object: ${serializeObject3D(this.object)} propertyName: ${
      this.propertyNotation
    } newValue: ${serializeProperty(this.newValue)}`
  }
}

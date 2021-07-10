import Command from "./Command";
import { TransformSpace } from "../constants/TransformSpace";
import { serializeVector3, serializeObject3D } from "../functions/debug";
export default class SetScaleCommand extends Command {
  object: any;
  scale: any;
  space: any;
  oldScale: any;
  constructor(editor, object, scale, space) {
    super(editor);
    this.object = object;
    this.scale = scale.clone();
    this.space = space;
    this.oldScale = object.scale.clone();
  }
  execute() {
    this.editor.setScale(this.object, this.scale, this.space, false);
  }
  shouldUpdate(newCommand) {
    return this.object === newCommand.object && this.space === newCommand.space;
  }
  update(command) {
    this.scale = command.scale.clone();
    this.editor.setScale(this.object, command.scale, this.space, false);
  }
  undo() {
    this.editor.setScale(
      this.object,
      this.oldScale,
      TransformSpace.Local,
      false
    );
  }
  toString() {
    return `SetScaleCommand id: ${this.id} object: ${serializeObject3D(
      this.object
    )} scale: ${serializeVector3(this.scale)} space: ${this.space}`;
  }
}

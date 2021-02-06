import Command from "./Command";
export default class RotateOnAxisCommand extends Command {
    object: any;
    axis: any;
    angle: any;
    space: any;
    oldRotation: any;
    constructor(editor: any, object: any, axis: any, angle: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): any;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

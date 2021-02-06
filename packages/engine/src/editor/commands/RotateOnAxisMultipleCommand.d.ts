import Command from "./Command";
export default class RotateOnAxisMultipleCommand extends Command {
    objects: any;
    axis: any;
    angle: any;
    space: any;
    oldRotations: any;
    constructor(editor: any, objects: any, axis: any, angle: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

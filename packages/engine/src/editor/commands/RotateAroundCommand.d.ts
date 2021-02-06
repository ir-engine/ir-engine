import Command from "./Command";
export default class RotateAroundCommand extends Command {
    object: any;
    pivot: any;
    axis: any;
    angle: any;
    oldPosition: any;
    oldRotation: any;
    constructor(editor: any, object: any, pivot: any, axis: any, angle: any);
    execute(): void;
    shouldUpdate(newCommand: any): any;
    update(command: any): void;
    undo(): void;
    objects(arg0: string, objects: any, arg2: string): void;
    toString(): string;
}

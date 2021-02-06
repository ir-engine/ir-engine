import Command from "./Command";
export default class RotateAroundMultipleCommand extends Command {
    objects: any;
    pivot: any;
    axis: any;
    angle: any;
    oldRotations: any;
    oldPositions: any;
    space: any;
    constructor(editor: any, objects: any, pivot: any, axis: any, angle: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

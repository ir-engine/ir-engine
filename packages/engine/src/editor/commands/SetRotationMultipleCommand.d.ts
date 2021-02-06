import Command from "./Command";
export default class SetRotationMultipleCommand extends Command {
    objects: any;
    rotation: any;
    space: any;
    oldRotations: any;
    constructor(editor: any, objects: any, rotation: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

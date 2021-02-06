import Command from "./Command";
export default class SetRotationCommand extends Command {
    object: any;
    rotation: any;
    space: any;
    oldRotation: any;
    constructor(editor: any, object: any, rotation: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

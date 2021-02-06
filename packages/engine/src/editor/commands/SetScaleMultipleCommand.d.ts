import Command from "./Command";
export default class SetScaleMultipleCommand extends Command {
    objects: any;
    scale: any;
    space: any;
    oldScales: any;
    constructor(editor: any, objects: any, scale: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

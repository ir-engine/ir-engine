import Command from "./Command";
export default class SetScaleCommand extends Command {
    object: any;
    scale: any;
    space: any;
    oldScale: any;
    constructor(editor: any, object: any, scale: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

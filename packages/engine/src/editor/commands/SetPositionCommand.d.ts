import Command from "./Command";
export default class SetPositionCommand extends Command {
    object: any;
    position: any;
    space: any;
    oldPosition: any;
    constructor(editor: any, object: any, position: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

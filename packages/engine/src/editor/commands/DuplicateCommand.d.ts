import Command from "./Command";
export default class DuplicateCommand extends Command {
    object: any;
    parent: any;
    before: any;
    oldSelection: any;
    duplicatedObject: any;
    constructor(editor: any, object: any, parent: any, before: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

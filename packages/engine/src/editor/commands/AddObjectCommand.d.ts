import Command from "./Command";
export default class AddObjectCommand extends Command {
    object: any;
    parent: any;
    before: any;
    oldSelection: any;
    editor: any;
    id: any;
    constructor(editor: any, object: any, parent: any, before: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

import Command from "./Command";
export default class AddMultipleObjectsCommand extends Command {
    objects: any;
    parent: any;
    before: any;
    oldSelection: any;
    editor: any;
    id: any;
    constructor(editor: any, objects: any, parent: any, before: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

import Command from "./Command";
export default class DuplicateMultipleCommand extends Command {
    objects: any;
    parent: any;
    before: any;
    selectObjects: any;
    oldSelection: any;
    duplicatedObjects: any[];
    constructor(editor: any, objects: any, parent: any, before: any, selectObjects: any);
    execute(redo: any): void;
    undo(): void;
    toString(): string;
}

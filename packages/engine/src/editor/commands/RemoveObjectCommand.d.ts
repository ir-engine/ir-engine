import Command from "./Command";
export default class RemoveObjectCommand extends Command {
    object: any;
    parent: any;
    before: any;
    oldSelection: any;
    constructor(editor: any, object: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

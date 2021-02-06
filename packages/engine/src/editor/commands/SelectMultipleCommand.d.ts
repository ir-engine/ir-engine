import Command from "./Command";
export default class SelectMultipleCommand extends Command {
    objects: any;
    oldSelection: any;
    constructor(editor: any, objects: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

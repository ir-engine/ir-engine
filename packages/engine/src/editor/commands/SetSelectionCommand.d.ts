import Command from "./Command";
export default class SetSelectionCommand extends Command {
    oldSelection: any;
    objects: any;
    constructor(editor: any, objects: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

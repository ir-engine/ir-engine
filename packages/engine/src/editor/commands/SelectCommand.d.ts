import Command from "./Command";
export default class SelectCommand extends Command {
    object: any;
    oldSelection: any;
    constructor(editor: any, object: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

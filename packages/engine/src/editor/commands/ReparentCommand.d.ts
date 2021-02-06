import Command from "./Command";
export default class ReparentCommand extends Command {
    object: any;
    oldParent: any;
    oldBefore: any;
    newParent: any;
    newBefore: any;
    oldSelection: any;
    constructor(editor: any, object: any, newParent: any, newBefore: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

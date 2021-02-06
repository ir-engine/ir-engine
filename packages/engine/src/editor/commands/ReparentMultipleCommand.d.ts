import Command from "./Command";
export default class ReparentMultipleCommand extends Command {
    objects: any[];
    undoObjects: any[];
    newParent: any;
    newBefore: any;
    oldParents: any[];
    oldBefores: any[];
    oldSelection: any;
    constructor(editor: any, objects: any, newParent: any, newBefore: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

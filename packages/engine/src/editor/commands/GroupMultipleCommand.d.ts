import Command from "./Command";
export default class GroupMultipleCommand extends Command {
    objects: any[];
    undoObjects: any[];
    groupParent: any;
    groupBefore: any;
    oldParents: any[];
    oldBefores: any[];
    oldSelection: any;
    groupNode: any;
    constructor(editor: any, objects: any, groupParent: any, groupBefore: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

import Command from "./Command";
export default class ReparentMultipleWithPositionCommand extends Command {
    objects: any[];
    undoObjects: any[];
    newParent: any;
    newBefore: any;
    oldParents: any[];
    oldBefores: any[];
    oldSelection: any;
    oldPositions: any;
    position: any;
    constructor(editor: any, objects: any, newParent: any, newBefore: any, position: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

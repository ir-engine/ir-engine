import Command from "./Command";
export default class RemoveMultipleObjectsCommand extends Command {
    objects: any[];
    oldParents: any[];
    oldBefores: any[];
    oldNodes: any;
    oldSelection: any;
    constructor(editor: any, objects: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

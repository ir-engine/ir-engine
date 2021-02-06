import Command from "./Command";
export default class LoadMaterialSlotMultipleCommand extends Command {
    objects: any;
    subPieceId: any;
    materialSlotId: any;
    materialId: any;
    prevMaterialIds: any;
    constructor(editor: any, objects: any, subPieceId: any, materialSlotId: any, materialId: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

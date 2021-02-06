import Command from "./Command";
export default class LoadMaterialSlotCommand extends Command {
    object: any;
    subPieceId: any;
    materialSlotId: any;
    materialId: any;
    prevMaterialId: any;
    constructor(editor: any, object: any, subPieceId: any, materialSlotId: any, materialId: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

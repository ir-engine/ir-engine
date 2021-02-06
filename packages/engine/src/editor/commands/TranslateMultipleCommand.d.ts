import Command from "./Command";
export default class TranslateMultipleCommand extends Command {
    objects: any;
    translation: any;
    space: any;
    oldPositions: any;
    constructor(editor: any, objects: any, translation: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

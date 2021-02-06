import Command from "./Command";
export default class TranslateCommand extends Command {
    object: any;
    translation: any;
    space: any;
    oldPosition: any;
    constructor(editor: any, object: any, translation: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

import Command from "./Command";
export default class SetPropertyCommand extends Command {
    object: any;
    propertyName: any;
    disableCopy: any;
    newValue: any;
    oldValue: any;
    constructor(editor: any, object: any, propertyName: any, value: any, disableCopy: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

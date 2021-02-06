import Command from "./Command";
export default class SetPropertyMultipleCommand extends Command {
    objects: any;
    propertyName: any;
    newValue: any;
    oldValues: any;
    constructor(editor: any, objects: any, propertyName: any, value: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

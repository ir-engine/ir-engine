import Command from "./Command";
export default class SetPropertiesMultipleCommand extends Command {
    objects: any;
    newProperties: {};
    objectsOldProperties: any[];
    constructor(editor: any, objects: any, properties: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

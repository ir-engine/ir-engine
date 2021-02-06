import Command from "./Command";
export default class SetPropertiesCommand extends Command {
    object: any;
    newProperties: {};
    oldProperties: {};
    constructor(editor: any, object: any, properties: any);
    execute(): void;
    undo(): void;
    toString(): string;
}

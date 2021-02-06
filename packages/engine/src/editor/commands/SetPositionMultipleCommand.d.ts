import Command from "./Command";
export default class SetPositionMultipleCommand extends Command {
    objects: any;
    position: any;
    space: any;
    oldPositions: any;
    constructor(editor: any, objects: any, position: any, space: any);
    execute(): void;
    shouldUpdate(newCommand: any): boolean;
    update(command: any): void;
    undo(): void;
    toString(): string;
}

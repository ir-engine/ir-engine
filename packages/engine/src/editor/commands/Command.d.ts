/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */
export default class Command {
    editor: any;
    id: number;
    constructor(editor: any);
    execute(_redo: any): void;
    shouldUpdate(_newCommand: any): boolean;
    update(_command: any): void;
    undo(): void;
    toString(): string;
}

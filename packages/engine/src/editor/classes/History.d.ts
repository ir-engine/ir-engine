/**
 * @author dforrer / https://github.com/dforrer
 * Developed as part of a project at University of Applied Sciences and Arts Northwestern Switzerland (www.fhnw.ch)
 */
export default class History {
    undos: any[];
    redos: any[];
    lastCmdTime: Date;
    idCounter: number;
    commandUpdatesEnabled: boolean;
    debug: boolean;
    constructor();
    execute(cmd: any): any;
    revert(checkpointId: any): void;
    undo(): any;
    redo(): any;
    getDebugLog(): string;
    clear(): void;
}

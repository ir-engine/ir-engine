export default class HeightfieldClient {
    worker: any;
    working: boolean;
    workerUrl: string;
    constructor();
    initWorker(): void;
    buildHeightfield(geometry: any, params: any, signal: any): Promise<any>;
}

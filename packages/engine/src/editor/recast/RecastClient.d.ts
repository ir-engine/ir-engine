export default class RecastClient {
    worker: Worker;
    working: boolean;
    workerUrl: string;
    constructor();
    buildNavMesh(geometry: any, params: any, signal: any): Promise<any>;
}

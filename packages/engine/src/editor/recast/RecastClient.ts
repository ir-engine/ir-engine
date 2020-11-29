import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute
} from "three";
// @ts-ignore
// import * as RecastWorker from "./recast.worker";
import RecastWorker from "file-loader?name=[name].js!./recast.worker";

const statuses = [
  "success",
  "unknown error",
  "out of memory error",
  "invalid navmesh data",
  "error generating navmesh heightfield",
  "error rasterizing navmesh",
  "error generating navmesh compact heightfield",
  "error eroding navmesh walkable area",
  "error generating navmesh distance field",
  "error generating navmesh regions",
  "error generating monotone navmesh regions",
  "error generating navmesh layer regions",
  "error generating navmesh contours",
  "error generating navmesh data",
  "error generating navmesh detail geometry"
];
// @ts-ignore
// const worker = new RecastWorker();
let worker = new Worker(RecastWorker);

export default class RecastClient {
  // worker: RecastWorker;
  working: boolean;
  constructor() {
    // @ts-ignore
    this.working = false;
  }
  async buildNavMesh(geometry, params, signal) {
    if (this.working) {
      throw new Error("Already building nav mesh");
    }
    // debugger
    // this.worker = new RecastWorker(params.wasmUrl);
    // this.worker = new RecastWorker();
    this.working = true;
    if (geometry.attributes.position.count === 0) {
      this.working = false;
      return geometry;
    }
    const verts = geometry.attributes.position.array;
    const faces = new Int32Array(verts.length / 3);
    for (let i = 0; i < faces.length; i++) {
      faces[i] = i;
    }
    const navMeshPromise = new Promise((resolve, reject) => {
      const cleanUp = () => {
        signal.removeEventListener("abort", onAbort);
        worker.removeEventListener("message", onMessage);
        worker.removeEventListener("error", onError);
        this.working = false;
      };
      const onMessage = event => {
        // debugger
        resolve(event.data);
        cleanUp();
      };
      const onAbort = () => {
        // debugger
        worker.terminate();
            // @ts-ignore
        worker = new Worker(RecastWorker);
        // this.worker = new RecastWorker(params.wasmUrl);
        const error = new Error("Canceled navmesh generation.");
        error["aborted"] = true;
        reject(error);
        cleanUp();
      };
      const onError = error => {
        // debugger
        reject(error);
        cleanUp();
      };
      signal.addEventListener("abort", onAbort);
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", onError);
      this.working = false
    });
    worker.postMessage(
      {
        verts,
        faces,
        params
      },
      [verts.buffer, faces.buffer]
    );
    const result = await navMeshPromise as any;
    if (result.error) {
      throw new Error(statuses[result.status] || result.error);
    }
    const navmesh = new BufferGeometry();
    navmesh.setAttribute(
      "position",
      new Float32BufferAttribute(result.verts, 3)
    );
    navmesh.setIndex(new Uint16BufferAttribute(result.indices, 1));
    return navmesh;
  }
}

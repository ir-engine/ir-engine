import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute
} from "three";
// @ts-ignore
import RecastWorker from "./recast.worker";

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

export default class RecastClient {
  worker: Worker;
  working: boolean;
  workerUrl: string;
  constructor() {
    this.working = false;
    // Creating blob out of worker script as a workaround.
    const blob = new Blob([RecastWorker]);
    this.workerUrl = URL.createObjectURL(blob)
    this.worker = new Worker(this.workerUrl)
  }
  async buildNavMesh(geometry, params, signal) {
    if (this.working) {
      throw new Error("Already building nav mesh");
    }
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
        this.worker.removeEventListener("message", onMessage);
        this.worker.removeEventListener("error", onError);
        this.working = false;
      };
      const onMessage = event => {
        resolve(event.data);
        cleanUp();
      };
      const onAbort = () => {
        this.worker.terminate();
        this.worker = new Worker(this.workerUrl);
        const error = new Error("Canceled navmesh generation.");
        error["aborted"] = true;
        reject(error);
        cleanUp();
      };
      const onError = error => {
        reject(error);
        cleanUp();
      };
      signal.addEventListener("abort", onAbort);
      this.worker.addEventListener("message", onMessage);
      this.worker.addEventListener("error", onError);
      this.working = false
    });
    this.worker.postMessage(
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

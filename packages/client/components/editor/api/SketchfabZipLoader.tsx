import * as SketchfabZipWorker from "./SketchfabZipLoader.worker";
export async function getFilesFromSketchfabZip(src) {
  return new Promise((resolve, reject) => {
    // BUG: Not sure this will work with the * import
    // @ts-ignore
    const worker = new SketchfabZipWorker();
    worker.onmessage = e => {
      const [success, fileMapOrError] = e.data;
      (success ? resolve : reject)(fileMapOrError);
    };
    worker.postMessage(src);
  });
}

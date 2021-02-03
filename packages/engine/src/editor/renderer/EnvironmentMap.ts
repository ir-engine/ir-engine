import { CubeTextureLoader, RGBFormat } from "three";
import { RethrownError } from "../functions/errors";
let cubeMapTexturePromise = null;
export let environmentMap = null;
export function loadEnvironmentMap(cubeMapURLs) {
  if (cubeMapTexturePromise) {
    return cubeMapTexturePromise;
  }
  cubeMapTexturePromise = new Promise((resolve, reject) => {
    cubeMapTexturePromise = new CubeTextureLoader().load(
      cubeMapURLs,
      texture => {
        texture.format = RGBFormat;
        environmentMap = texture;
        resolve(texture);
      },
      null,
      error =>
        reject(
          new RethrownError(
            `Error loading cubemap images ${cubeMapURLs
              .map(url => `"${url}"`)
              .join(", ")}`,
            error
          )
        )
    );
  });
  return cubeMapTexturePromise;
}

import { CubeTextureLoader, RGBFormat } from "three";
import { RethrownError } from "@xr3ngine/engine/src/editor/functions/errors";
const negx = "/cubemap/negx.jpg";
const negy = "/cubemap/negy.jpg";
const negz = "/cubemap/negz.jpg";
const posx = "/cubemap/posx.jpg";
const posy = "/cubemap/posy.jpg";
const posz = "/cubemap/posz.jpg";
let cubeMapTexturePromise = null;
export let environmentMap = null;
export function loadEnvironmentMap() {
  if (cubeMapTexturePromise) {
    return cubeMapTexturePromise;
  }
  cubeMapTexturePromise = new Promise((resolve, reject) => {
    const cubeMapURLs = [posx, negx, posy, negy, posz, negz];
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

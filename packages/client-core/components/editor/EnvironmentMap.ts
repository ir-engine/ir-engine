// @ts-nocheck
import { CubeTextureLoader, RGBFormat } from "three";
import { RethrownError } from "@xr3ngine/engine/src/editor/functions/errors";
import negx from "./cubemap/negx.jpg";
import negy from "./cubemap/negy.jpg";
import negz from "./cubemap/negz.jpg";
import posx from "./cubemap/posx.jpg";
import posy from "./cubemap/posy.jpg";
import posz from "./cubemap/posz.jpg";
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

import { isNode, isWebWorker } from "../../common/functions/getEnvironment";
import { styleCanvas } from "./styleCanvas";

export const createCanvas = () => {
  if(isWebWorker || isNode) {
    return;
  }
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  styleCanvas(canvas);
  return canvas;
}
import { isNode, isWebWorker } from "../../common/functions/getEnvironment";

export const configCanvasElement = (canvasId) => {
  if (!canvasId) return null;

  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  canvas.ondragstart = (e) => {
    e.preventDefault();
    return false;
  }

  return canvas;
}

export const createCanvas = () => {
  if(isWebWorker || isNode) {
    return;
  }
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  configCanvasElement(canvas);
  return canvas;
}

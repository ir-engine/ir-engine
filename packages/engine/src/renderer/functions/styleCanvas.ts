export const styleCanvas = (canvas: HTMLCanvasElement) => {
  canvas.style.zIndex = '0';
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  canvas.style.position = 'absolute'
  canvas.style.webkitUserSelect = 'none'
  canvas.style.userSelect = 'none'
  canvas.ondragstart = (e) => {
    e.preventDefault();
    return false;
  }
}
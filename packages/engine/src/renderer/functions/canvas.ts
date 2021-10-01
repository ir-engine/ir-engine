export const configCanvasElement = (canvas: string): HTMLCanvasElement => {
  const canvasElement = document.getElementById(canvas) as HTMLCanvasElement

  canvasElement.ondragstart = (e) => {
    e.preventDefault()
    return false
  }

  return canvasElement
}

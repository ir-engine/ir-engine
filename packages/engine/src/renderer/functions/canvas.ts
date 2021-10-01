export const configCanvasElement = (canvas: string): HTMLCanvasElement => {
  const canvasElement = document.getElementById(canvas) as HTMLCanvasElement
  console.log(canvasElement)
  canvasElement.ondragstart = (e) => {
    e.preventDefault()
    return false
  }

  return canvasElement
}

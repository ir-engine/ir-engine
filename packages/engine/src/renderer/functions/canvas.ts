import { isNode, isWebWorker } from '../../common/functions/getEnvironment'

export const configCanvasElement = (canvas: string | HTMLCanvasElement): HTMLCanvasElement => {
  if (!canvas) return null

  const canvasElement = typeof canvas === 'string' ? (document.getElementById(canvas) as HTMLCanvasElement) : canvas

  canvasElement.ondragstart = (e) => {
    e.preventDefault()
    return false
  }

  return canvasElement
}

export const createCanvas = (): HTMLCanvasElement => {
  if (isWebWorker || isNode) {
    return
  }
  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)
  configCanvasElement(canvas)
  return canvas
}

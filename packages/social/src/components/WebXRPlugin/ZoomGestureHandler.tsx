export default class ZoomGestureHandler {
  private readonly element: HTMLElement
  private readonly callback: (zoom: number) => void
  private previousGestureDistance = 0
  public scale = 1

  constructor(element: HTMLElement, callback: (zoom: number) => void) {
    this.element = element
    this.callback = callback

    this.element.addEventListener('touchstart', this.onTouchStart)
  }

  dispose(): void {
    this.element.removeEventListener('touchstart', this.onTouchStart)
    this.element.removeEventListener('touchend', this.onTouchEnd)
    this.element.removeEventListener('touchmove', this.onTouchMove)
  }

  onTouchStart = (e: TouchEvent): void => {
    if (e.touches.length === 2) {
      this.previousGestureDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )

      this.element.addEventListener('touchend', this.onTouchEnd)
      this.element.addEventListener('touchmove', this.onTouchMove)
    }
  }

  onTouchEnd = (): void => {
    this.element.removeEventListener('touchmove', this.onTouchMove)
  }

  onTouchMove = (e: TouchEvent): void => {
    const currentGestureDistance = Math.hypot(
      e.touches[0].pageX - e.touches[1].pageX,
      e.touches[0].pageY - e.touches[1].pageY
    )

    this.scale = currentGestureDistance / this.previousGestureDistance
    this.previousGestureDistance = currentGestureDistance

    this.callback(this.scale)
  }
}

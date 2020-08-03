// TODO: Refactor to fit behavior pattern
import { TouchHandler } from "../interfaces/TouchHandler"

export function setTouchHandler(touchHandler: TouchHandler): void {
  if (
    "verticalZoomIn" in touchHandler ||
    "verticalZoomOut" in touchHandler ||
    "horizontalZoomIn" in touchHandler ||
    "horizontalZoomOut" in touchHandler
  ) {
    const zoomInOutHandler: any = {}

    zoomInOutHandler.th = touchHandler
    zoomInOutHandler.tpCache = []

    zoomInOutHandler.handle_zoom_in_out = function(ev) {
      if (ev.targetTouches.length === 2 && ev.changedTouches.length === 2) {
        const new_point1 = ev.targetTouches[0],
          new_point2 = ev.targetTouches[1]
        let point1 = -1,
          point2 = -1 // Old points indexes.

        // Find old points in tpCache.
        for (let i = 0; i < this.tpCache.length; i++) {
          if (this.tpCache[i].identifier === new_point1.identifier) point1 = i
          if (this.tpCache[i].identifier === new_point2.identifier) point2 = i
        }

        if (point1 === -1 || point2 === -1) {
          this.tpCache = []
          return
        }

        // This threshold is device dependent as well as application specific.
        const threshold = Math.min(ev.target.clientWidth, ev.target.clientHeight) / 10

        // Calculate the difference between the start and move coordinates.
        const y_distance = Math.abs(this.tpCache[point1].clientY - this.tpCache[point2].clientY)
        const new_y_distance = Math.abs(new_point1.clientY - new_point2.clientY)
        const y_distance_diff = Math.abs(y_distance - new_y_distance)

        const x_distance = Math.abs(this.tpCache[point1].clientX - this.tpCache[point2].clientX)
        const new_x_distance = Math.abs(new_point1.clientX - new_point2.clientX)
        const x_distance_diff = Math.abs(x_distance - new_x_distance)

        if (y_distance_diff > threshold && x_distance_diff < threshold) {
          ev.target.style.background = "green"

          if (new_y_distance > y_distance) {
            if ("verticalZoomOut" in this.th) this.th.verticalZoomOut()
          } else {
            if ("verticalZoomIn" in this.th) this.th.verticalZoomIn()
          }

          this.tpCache[point1] = new_point1
          this.tpCache[point2] = new_point2
          return
        }

        if (x_distance_diff > threshold && y_distance_diff < threshold) {
          if (new_x_distance > x_distance) {
            if ("horizontalZoomOut" in this.th) this.th.horizontalZoomOut()
          } else {
            if ("horizontalZoomIn" in this.th) this.th.horizontalZoomIn()
          }

          this.tpCache[point1] = new_point1
          this.tpCache[point2] = new_point2
        }
      }
    }

    zoomInOutHandler.touch_start = function(ev) {
      // If the user makes simultaneous touches, the browser will fire a
      // separate touchstart event for each touch point. Thus if there are
      // three simultaneous touches, the first touchstart event will have
      // targetTouches length of one, the second event will have a length
      // of two, and so on.
      ev.preventDefault()
      // Cache the touch points for later processing of 2-touch zoom.
      if (ev.targetTouches.length === 2) {
        for (let i = 0; i < ev.targetTouches.length; i++) this.tpCache.push(ev.targetTouches[i])
      }
      if ("touchStart" in this.th) this.th.touchStart()
    }

    zoomInOutHandler.touch_move = function(ev) {
      ev.preventDefault()
      this.handle_zoom_in_out(ev)
      if ("touchMove" in this.th) this.th.touchMove()
    }

    zoomInOutHandler.touch_end_handler = function(ev) {
      ev.preventDefault()
      if (ev.targetTouches.length === 0) this.tpCache = []
      if ("touchEnd" in this.th) this.th.touchEnd()
    }

    touchHandler.element.ontouchstart = zoomInOutHandler.touch_start.bind(zoomInOutHandler)
    touchHandler.element.ontouchend = zoomInOutHandler.touch_end.bind(zoomInOutHandler)
    touchHandler.element.ontouchcancel = touchHandler.element.ontouchend
    touchHandler.element.ontouchmove = zoomInOutHandler.touch_move.bind(zoomInOutHandler)
  } else {
    touchHandler.element.ontouchstart = touchHandler.touchStart.bind(touchHandler)
    touchHandler.element.ontouchend = touchHandler.touchEnd.bind(touchHandler)
    touchHandler.element.ontouchcancel = touchHandler.element.ontouchend
    touchHandler.element.ontouchmove = touchHandler.touchMove.bind(touchHandler)
  }
}

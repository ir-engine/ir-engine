function setTouchHandler(touchHandler) {
    if ('verticalZoomIn' in touchHandler ||
        'verticalZoomOut' in touchHandler ||
        'horizontalZoomIn' in touchHandler ||
        'horizontalZoomOut' in touchHandler) {
        let zoomInOutHandler = {};
        zoomInOutHandler.th = touchHandler;
        zoomInOutHandler.tpCache = new Array();
        zoomInOutHandler.handle_zoom_in_out = function (ev) {
            if (ev.targetTouches.length === 2 && ev.changedTouches.length === 2) {
                let new_point1 = ev.targetTouches[0], new_point2 = ev.targetTouches[1];
                let point1 = -1, point2 = -1; // Old points indexes.
                // Find old points in tpCache.
                for (let i = 0; i < this.tpCache.length; i++) {
                    if (this.tpCache[i].identifier === new_point1.identifier)
                        point1 = i;
                    if (this.tpCache[i].identifier === new_point2.identifier)
                        point2 = i;
                }
                if (point1 === -1 || point2 === -1) {
                    this.tpCache = new Array();
                    return;
                }
                // This threshold is device dependent as well as application specific.
                let threshold = Math.min(ev.target.clientWidth, ev.target.clientHeight) / 10;
                // Calculate the difference between the start and move coordinates.
                let y_distance = Math.abs(this.tpCache[point1].clientY - this.tpCache[point2].clientY);
                let new_y_distance = Math.abs(new_point1.clientY - new_point2.clientY);
                let y_distance_diff = Math.abs(y_distance - new_y_distance);
                let x_distance = Math.abs(this.tpCache[point1].clientX -
                    this.tpCache[point2].clientX);
                let new_x_distance = Math.abs(new_point1.clientX - new_point2.clientX);
                let x_distance_diff = Math.abs(x_distance - new_x_distance);
                if (y_distance_diff > threshold && x_distance_diff < threshold) {
                    if (new_y_distance > y_distance) {
                        if ('verticalZoomIn' in this.th)
                            this.th.verticalZoomIn();
                    }
                    else {
                        if ('verticalZoomOut' in this.th)
                            this.th.verticalZoomOut();
                    }
                    this.tpCache[point1] = new_point1;
                    this.tpCache[point2] = new_point2;
                    return;
                }
                if (x_distance_diff > threshold && y_distance_diff < threshold) {
                    if (new_x_distance > x_distance) {
                        if ('horizontalZoomIn' in this.th)
                            this.th.horizontalZoomIn();
                    }
                    else {
                        if ('horizontalZoomOut' in this.th)
                            this.th.horizontalZoomOut();
                    }
                    this.tpCache[point1] = new_point1;
                    this.tpCache[point2] = new_point2;
                }
            }
        };
        zoomInOutHandler.touch_start = function (ev) {
            // If the user makes simultaneous touches, the browser will fire a
            // separate touchstart event for each touch point. Thus if there are
            // three simultaneous touches, the first touchstart event will have
            // targetTouches length of one, the second event will have a length
            // of two, and so on.
            ev.preventDefault();
            // Cache the touch points for later processing of 2-touch zoom.
            if (ev.targetTouches.length === 2) {
                for (let i = 0; i < ev.targetTouches.length; i++)
                    this.tpCache.push(ev.targetTouches[i]);
            }
            if ('touchStart' in this.th)
                this.th.touchStart(ev);
        };
        zoomInOutHandler.touch_move = function (ev) {
            ev.preventDefault();
            this.handle_zoom_in_out(ev);
            if ('touchMove' in this.th)
                this.th.touchMove(ev);
        };
        zoomInOutHandler.touch_end = function (ev) {
            // ev.preventDefault();
            if (ev.targetTouches.length === 0)
                this.tpCache = new Array();
            if ('touchEnd' in this.th)
                this.th.touchEnd(ev);
        };
        touchHandler.element.ontouchstart =
            zoomInOutHandler.touch_start.bind(zoomInOutHandler);
        touchHandler.element.ontouchend =
            zoomInOutHandler.touch_end.bind(zoomInOutHandler);
        touchHandler.element.ontouchcancel = touchHandler.element.ontouchend;
        touchHandler.element.ontouchmove =
            zoomInOutHandler.touch_move.bind(zoomInOutHandler);
    }
    else {
        if ('touchStart' in touchHandler)
            touchHandler.element.ontouchstart = touchHandler.touchStart.bind(touchHandler);
        if ('touchEnd' in touchHandler) {
            touchHandler.element.ontouchend = touchHandler.touchEnd.bind(touchHandler);
            touchHandler.element.ontouchcancel = touchHandler.element.ontouchend;
        }
        if ('touchMove' in touchHandler)
            touchHandler.element.ontouchmove = touchHandler.touchMove.bind(touchHandler);
    }
}

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
class TouchHandler {
    constructor() {
        this.element = document.getElementById('touch-area');
        this.canvas = this.element;
        resizeCanvas(this.canvas);
    }
    drawCircle(x, y) {
        let ctx = this.canvas.getContext('2d');
        ctx.fillStyle = this.circleColor;
        ctx.beginPath();
        ctx.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    touchStart(ev) {
        ev.preventDefault();
        this.circleColor =
            'rgb(' +
                Math.trunc(Math.random() * 255) + ',' +
                Math.trunc(Math.random() * 255) + ',' +
                Math.trunc(Math.random() * 255) + ')';
        if (ev.targetTouches.length)
            this.drawCircle(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
    }
    touchMove(ev) {
        ev.preventDefault();
        if (ev.targetTouches.length)
            this.drawCircle(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
    }
}
function touchHandlerExample1() {
    // console.log('Check.');
    let th = new TouchHandler();
    setTouchHandler(th);
    window.addEventListener('resize', function () {
        resizeCanvas(th.canvas);
    }, false);
}

touchHandlerExample1();

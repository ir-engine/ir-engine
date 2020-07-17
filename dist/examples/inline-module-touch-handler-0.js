function setTouchHandler(touchHandler) {
    touchHandler.element.ontouchstart = touchHandler.touchStart.bind(touchHandler);
    touchHandler.element.ontouchend = touchHandler.touchEnd.bind(touchHandler);
    touchHandler.element.ontouchcancel = touchHandler.touchEnd.bind(touchHandler);
    touchHandler.element.ontouchmove = touchHandler.touchMove.bind(touchHandler);
}

class TouchHandler {
    constructor() {
        this.element = document.getElementById('touch-area');
        this.canvas = this.element;
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
    touchEnd(ev) {
        ev.preventDefault();
    }
    touchMove(ev) {
        ev.preventDefault();
        if (ev.targetTouches.length)
            this.drawCircle(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
    }
}
function touchHandlerExample() {
    // console.log('Check.');
    setTouchHandler(new TouchHandler());
}

touchHandlerExample();

import { ITouchHandler, setTouchHandler }  from '../input/behaviors/touchHandler';

class TouchHandler implements ITouchHandler {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	rectangleWidth: number = 50;
	rectangleHeight: number = 50;

	constructor() {
		this.element = document.getElementById('touch-area');
		this.canvas = <HTMLCanvasElement>this.element;
		this.resizeCanvas();
	}

	resizeCanvas() {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.drawRectangle();
	}

	drawRectangle() {
		let ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
		ctx.strokeRect(
				this.canvas.width / 2 - this.rectangleWidth / 2,
				this.canvas.height / 2 - this.rectangleHeight / 2,
				this.rectangleWidth,
				this.rectangleHeight)
	}

/*
	drawCircle(x: number, y: number) {
		let ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
		ctx.fillStyle = this.circleColor;
		ctx.beginPath();
		ctx.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}
*/
	touchStart(ev: TouchEvent): void {
	}

	touchEnd(ev: TouchEvent): void {
	}

	touchMove(ev: TouchEvent): void {
	}
}

export function touchHandlerExample2(): void {
	// console.log('Check.');
	let th: TouchHandler = new TouchHandler();
	setTouchHandler(th);
	window.addEventListener('resize', th.resizeCanvas.bind(th),	false);
}

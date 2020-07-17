import { ITouchHandler, setTouchHandler }  from '../input/behaviors/touchHandler';

function resizeCanvas(canvas: HTMLCanvasElement) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

class TouchHandler implements ITouchHandler {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	circleColor: string;

	constructor() {
		this.element = document.getElementById('touch-area');
		this.canvas = <HTMLCanvasElement>this.element;
		resizeCanvas(this.canvas);
	}

	drawCircle(x: number, y: number) {
		let ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
		ctx.fillStyle = this.circleColor;
		ctx.beginPath();
		ctx.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fill();
	}

	touchStart(ev: TouchEvent): void {
		ev.preventDefault();
		this.circleColor =
				'rgb(' +
				Math.trunc(Math.random() * 255) + ',' +
				Math.trunc(Math.random() * 255) + ',' +
				Math.trunc(Math.random() * 255) + ')';
		if (ev.targetTouches.length)
			this.drawCircle(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
	}

	touchEnd(ev: TouchEvent): void {
		ev.preventDefault();
	}

	touchMove(ev: TouchEvent): void {
		ev.preventDefault();
		if (ev.targetTouches.length)
			this.drawCircle(ev.targetTouches[0].clientX, ev.targetTouches[0].clientY);
	}
}

export function touchHandlerExample(): void {
	// console.log('Check.');
	let th: TouchHandler = new TouchHandler();
	setTouchHandler(th);
	window.addEventListener(
			'resize',
			function(): void {
				resizeCanvas(th.canvas);
			},
			false);
}

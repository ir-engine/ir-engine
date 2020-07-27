import { ITouchHandler, setTouchHandler }  from '../input/behaviors/touchHandler';

class TouchHandler implements ITouchHandler {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	rectangleWidth: number = 50;
	rectangleHeight: number = 50;
	rectangleChangeSizeStep: number = 30;

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
		ctx.clearRect(1, 1, this.canvas.width - 2, this.canvas.height - 2);
		ctx.strokeRect(
				this.canvas.width / 2 - this.rectangleWidth / 2,
				this.canvas.height / 2 - this.rectangleHeight / 2,
				this.rectangleWidth,
				this.rectangleHeight);
	}

	verticalZoomIn() {
		this.rectangleHeight += this.rectangleChangeSizeStep;
		if (this.rectangleHeight > (this.canvas.height - 10))
			this.rectangleHeight = this.canvas.height - 10;
		this.drawRectangle();
	}

	verticalZoomOut() {
		this.rectangleHeight -= this.rectangleChangeSizeStep;
		if (this.rectangleHeight < 50)
			this.rectangleHeight = 50;
		this.drawRectangle();
	}

	horizontalZoomIn() {
		this.rectangleWidth += this.rectangleChangeSizeStep;
		if (this.rectangleWidth > (this.canvas.width - 10))
			this.rectangleWidth = this.canvas.width - 10;
		this.drawRectangle();
	}

	horizontalZoomOut() {
		this.rectangleWidth -= this.rectangleChangeSizeStep;
		if (this.rectangleWidth < 50)
			this.rectangleWidth = 50;
		this.drawRectangle();
	}

}

export function touchHandlerExample2(): void {
	let th: TouchHandler = new TouchHandler();
	setTouchHandler(th);
	window.addEventListener('resize', th.resizeCanvas.bind(th),	false);
}

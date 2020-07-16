export interface ITouchHandler {
	element: HTMLElement;
	touchStart: (ev: TouchEvent) => void;
	touchEnd: (ev: TouchEvent) => void;
	touchMove: (ev: TouchEvent) => void;
}

export function setTouchHandler(touchHandler: ITouchHandler): void {
	touchHandler.element.ontouchstart = touchHandler.touchStart;
	touchHandler.element.ontouchend = touchHandler.touchEnd;
	touchHandler.element.ontouchcancel = touchHandler.touchEnd;
	touchHandler.element.ontouchmove = touchHandler.touchMove;
}

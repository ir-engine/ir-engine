export interface ITouchHandler {
	element: HTMLElement;
	touchStart: (ev: TouchEvent) => void;
	touchEnd: (ev: TouchEvent) => void;
	touchMove: (ev: TouchEvent) => void;
}

export function setTouchHandler(touchHandler: ITouchHandler): void {
	touchHandler.element.ontouchstart = touchHandler.touchStart.bind(touchHandler);
	touchHandler.element.ontouchend = touchHandler.touchEnd.bind(touchHandler);
	touchHandler.element.ontouchcancel = touchHandler.touchEnd.bind(touchHandler);
	touchHandler.element.ontouchmove = touchHandler.touchMove.bind(touchHandler);
}

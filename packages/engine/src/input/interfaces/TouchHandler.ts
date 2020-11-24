export interface TouchHandler {
  element: HTMLElement;
  touchStart?: (ev: TouchEvent) => void;
  touchEnd?: (ev: TouchEvent) => void;
  touchMove?: (ev: TouchEvent) => void;
  verticalZoomIn?: () => void;
  verticalZoomOut?: () => void;
  horizontalZoomIn?: () => void;
  horizontalZoomOut?: () => void;
}

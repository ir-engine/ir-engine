import { isClient } from "./isClient";

const keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

function preventDefault (e) {
  e.preventDefault();
}

function preventDefaultForScrollKeys (e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}

// modern Chrome requires { passive: false } when adding event
let supportsPassive = false;
try {
  window.addEventListener(
    'test',
    null,
    Object.defineProperty({}, 'passive', {
      get: function () {
        supportsPassive = true;
      }
    })
  );
  // eslint-disable-next-line no-empty
} catch (e) {}

const wheelOpt = supportsPassive ? { passive: false } : false;
// const wheelEvent = "onwheel" in document.createElement("div") ? "wheel" : "mousewheel"

// call this to Disable
export function disableScroll (): void {
  if(!isClient) return
  window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
  // window.addEventListener(wheelEvent, preventDefault, wheelOpt) // modern desktop
  window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
}

// call this to Enable
export function enableScroll (): void {
  if(!isClient) return
  window.removeEventListener('DOMMouseScroll', preventDefault, false);
  // window.removeEventListener(wheelEvent, preventDefault)
  window.removeEventListener('touchmove', preventDefault);
  window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
}

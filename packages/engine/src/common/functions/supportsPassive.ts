export default function supportsPassive() :boolean {
  let supportsPassiveValue = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassiveValue = true;
      }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
  } catch (error) {}
  return supportsPassiveValue;
}
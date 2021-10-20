export default function isInputSelected() {
  const el = document.activeElement as any
  const nodeName = el.nodeName
  return el.isContentEditable || nodeName === 'INPUT' || nodeName === 'SELECT' || nodeName === 'TEXTAREA'
}

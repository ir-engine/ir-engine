export default class PlayModeControls {
  inputManager: any
  editorControls: any
  flyControls: any
  enabled: boolean
  constructor(inputManager, editorControls, flyControls) {
    this.inputManager = inputManager
    this.editorControls = editorControls
    this.flyControls = flyControls
    this.enabled = false
  }
  enable() {
    this.enabled = true
    this.inputManager.canvas.addEventListener('click', this.onClickCanvas)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
  }
  disable() {
    this.enabled = false
    this.editorControls.enable()
    this.flyControls.disable()
    this.inputManager.canvas.removeEventListener('click', this.onClickCanvas)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.exitPointerLock()
  }
  onClickCanvas = () => {
    this.inputManager.canvas.requestPointerLock()
  }
  onPointerLockChange = () => {
    if (document.pointerLockElement === this.inputManager.canvas) {
      this.editorControls.disable()
      this.flyControls.enable()
    } else {
      this.editorControls.enable()
      this.flyControls.disable()
    }
  }

  dispose() {
    this.inputManager.canvas.removeEventListener('click', this.onClickCanvas)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
  }
}

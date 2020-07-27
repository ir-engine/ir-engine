class WebcamState {
  _videoPaused = false
  _audioPaused = false
  constructor() {
    this._videoPaused = true
    this._audioPaused = true
  }

  set videoPaused(paused) {
    this._videoPaused = paused
  }

  get videoPaused() {
    return this._videoPaused
  }

  set audioPaused(paused) {
    this._audioPaused = paused
  }

  get audioPaused() {
    return this._audioPaused
  }

  toggleVideoPaused() {
    this._videoPaused = !this._videoPaused
    return this._videoPaused
  }

  toggleAudioPaused() {
    this._audioPaused = !this._audioPaused
    return this._audioPaused
  }
}
const webcamState = new WebcamState()
export { webcamState }

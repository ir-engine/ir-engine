import { AudioContext } from 'three'
import { FileLoader } from './FileLoader'
import { Loader } from './Loader'

class AudioLoader extends Loader {
  constructor(manager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError, signal) {
    const loader = new FileLoader(this.manager)
    loader.setResponseType('arraybuffer')
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)
    loader.load(
      url,
      function (buffer) {
        try {
          // Create a copy of the buffer. The `decodeAudioData` method
          // detaches the buffer when complete, preventing reuse.
          const bufferCopy = buffer.slice(0)

          const context = AudioContext.getContext()
          context.decodeAudioData(
            bufferCopy,
            function (audioBuffer) {
              onLoad(audioBuffer)
            },
            handleError
          )
        } catch (e) {
          handleError(e)
        }
      },
      onProgress,
      onError,
      signal
    )

    function handleError(e) {
      if (onError) {
        onError(e)
      } else {
        console.error(e)
      }

      this.manager.itemError(url)
    }
  }
}

export { AudioLoader }

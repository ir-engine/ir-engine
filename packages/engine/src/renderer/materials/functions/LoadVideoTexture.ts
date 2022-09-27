import { VideoTexture } from 'three'

import { isClient } from '../../../common/functions/isClient'
import { EngineRenderer } from '../../WebGLRendererSystem'

export default function loadVideoTexture(src, onLoad = (result) => {}) {
  if (!isClient) return

  const el = document.createElement('video')
  el.setAttribute('crossOrigin', 'anonymous')
  el.setAttribute('loop', 'true')
  el.setAttribute('preload', 'metadata')

  // Setting autoplay to false will not work
  // see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-autoplay
  el.setAttribute('autoplay', 'true')

  el.setAttribute('playsInline', 'true')
  el.setAttribute('playsinline', 'true')
  el.setAttribute('webkit-playsInline', 'true')
  el.setAttribute('webkit-playsinline', 'true')
  el.setAttribute('muted', 'true')
  el.muted = true // Needed for some browsers to load videos
  el.hidden = true

  document.body.appendChild(el)
  const errorLoading = () => console.error('error loading ' + src + ' in element ' + el)
  el.addEventListener('error', errorLoading)
  el.addEventListener('loadeddata', () => el.removeEventListener('error', errorLoading))
  el.src = src

  const texture = new VideoTexture(el)
  el.currentTime = 1
  if (!texture) console.error('texture is missing')

  el.addEventListener(
    'loadeddata',
    () => {
      const canvas = EngineRenderer.instance.canvas
      function handleInput() {
        canvas.removeEventListener('keypress', this)
        canvas.removeEventListener('click', this)
        canvas.removeEventListener('auxclick', this)
        canvas.removeEventListener('touchstart', this)
        el.play()
        onLoad(texture)
      }
      canvas.addEventListener('touchstart', handleInput)
      canvas.addEventListener('keypress', handleInput)
      canvas.addEventListener('click', handleInput)
      canvas.addEventListener('auxclick', handleInput)
    },
    { once: true }
  )
}

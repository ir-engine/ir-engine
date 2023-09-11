/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { VideoTexture } from 'three'

import { isClient } from '../../../common/functions/getEnvironment'

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
      el.play()
      onLoad(texture)
      /*
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
      */
    },
    { once: true }
  )
}

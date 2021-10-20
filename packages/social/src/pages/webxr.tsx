import { GLTFLoader } from '@xrengine/engine/src/assets/loaders/gltf/GLTFLoader'
import {
  RingGeometry,
  HemisphereLight,
  CylinderGeometry,
  MeshPhongMaterial,
  WebGLRenderer,
  PerspectiveCamera,
  PCFSoftShadowMap,
  MeshBasicMaterial,
  BoxBufferGeometry,
  Object3D,
  Scene,
  AmbientLight,
  Mesh,
  DirectionalLight,
  PlaneGeometry,
  ShadowMaterial
} from 'three'
import React, { useEffect } from 'react'
import Player from 'volumetric/web/decoder/Player'
// @ts-ignore
import PlayerWorker from 'volumetric/web/decoder/workerFunction.ts?worker'

class ARButton {
  static createButton(renderer, sessionInit: any = {}) {
    const button = document.createElement('button')

    function showStartAR(/*device*/) {
      if (sessionInit.domOverlay === undefined) {
        var overlay = document.createElement('div')
        overlay.style.display = 'none'
        document.body.appendChild(overlay)

        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.setAttribute('width', '38')
        svg.setAttribute('height', '38')
        svg.style.position = 'absolute'
        svg.style.right = '20px'
        svg.style.top = '20px'
        svg.addEventListener('click', () => {
          currentSession.end()
        })
        overlay.appendChild(svg)

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', 'M 12,12 L 28,28 M 28,12 12,28')
        path.setAttribute('stroke', '#fff')
        path.setAttribute('strokeWidth', '2')
        svg.appendChild(path)

        if (sessionInit.optionalFeatures === undefined) {
          sessionInit.optionalFeatures = []
        }

        sessionInit.optionalFeatures.push('dom-overlay')
        sessionInit.domOverlay = { root: overlay }
      }

      //

      let currentSession = null

      async function onSessionStarted(session) {
        session.addEventListener('end', onSessionEnded)

        renderer.xr.setReferenceSpaceType('local')

        await renderer.xr.setSession(session)

        button.textContent = 'STOP AR'
        sessionInit.domOverlay.root.style.display = ''

        currentSession = session
      }

      function onSessionEnded(/*event*/) {
        currentSession.removeEventListener('end', onSessionEnded)

        button.textContent = 'START AR'
        sessionInit.domOverlay.root.style.display = 'none'

        currentSession = null
      }

      //

      button.style.display = ''

      button.style.cursor = 'pointer'
      button.style.left = 'calc(50% - 50px)'
      button.style.width = '100px'

      button.textContent = 'START AR'

      button.onmouseenter = function () {
        button.style.opacity = '1.0'
      }

      button.onmouseleave = function () {
        button.style.opacity = '0.5'
      }

      button.onclick = function () {
        if (currentSession === null) {
          ;(navigator as any).xr.requestSession('immersive-ar', sessionInit).then(onSessionStarted)
        } else {
          currentSession.end()
        }
      }
    }

    function disableButton() {
      button.style.display = ''

      button.style.cursor = 'auto'
      button.style.left = 'calc(50% - 75px)'
      button.style.width = '150px'

      button.onmouseenter = null
      button.onmouseleave = null

      button.onclick = null
    }

    function showARNotSupported() {
      disableButton()

      button.textContent = 'AR NOT SUPPORTED'
    }

    function stylizeElement(element) {
      element.style.position = 'absolute'
      element.style.bottom = '20px'
      element.style.padding = '12px 6px'
      element.style.border = '1px solid #fff'
      element.style.borderRadius = '4px'
      element.style.background = 'rgba(0,0,0,0.1)'
      element.style.color = '#fff'
      element.style.font = 'normal 13px sans-serif'
      element.style.textAlign = 'center'
      element.style.opacity = '0.5'
      element.style.outline = 'none'
      element.style.zIndex = '999'
    }

    if ('xr' in navigator) {
      button.id = 'ARButton'
      button.style.display = 'none'

      stylizeElement(button)
      ;(navigator as any).xr
        .isSessionSupported('immersive-ar')
        .then((supported) => {
          supported ? showStartAR() : showARNotSupported()
        })
        .catch(showARNotSupported)

      return button
    } else {
      const message = document.createElement('a')

      if (window.isSecureContext === false) {
        message.href = document.location.href.replace(/^http:/, 'https:')
        message.innerHTML = 'WEBXR NEEDS HTTPS' // TODO Improve message
      } else {
        message.href = 'https://immersiveweb.dev/'
        message.innerHTML = 'WEBXR NOT AVAILABLE'
      }

      message.style.left = 'calc(50% - 90px)'
      message.style.width = '180px'
      message.style.textDecoration = 'none'

      stylizeElement(message)

      return message
    }
  }
}

export { ARButton }

export const VideoRecording = () => {
  /*
   * Copyright 2017 Google Inc. All Rights Reserved.
   * Licensed under the Apache License, Version 2.0 (the 'License');
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an 'AS IS' BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */

  let container
  let camera, scene, renderer
  let controller

  let reticle

  let hitTestSource = null
  let hitTestSourceRequested = false

  var isRecording = false

  useEffect(() => {
    init()
    animate()

    const player = new Player({
      scene,
      renderer,
      worker: new PlayerWorker(),
      meshFilePath: '/test.uvol',
      videoFilePath: '/test.mp4',
      manifestFilePath: '/test.manifest',
      scale: 1,
      onMeshBuffering: (progress) => {
        console.warn('BUFFERING!!', progress)
        // setBufferingProgress(Math.round(progress * 100));
        // setIsBuffering(true);
      },
      onFrameShow: () => {
        console.warn('SHOWING!!')
      }
    })
    player.mesh.position.set(0, 0, 0)
    player.mesh.matrixAutoUpdate = true
    player.mesh.matrixWorldNeedsUpdate = true
    player.mesh.visible = true

    function init() {
      container = document.createElement('div')
      document.body.appendChild(container)

      scene = new Scene()

      camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100)
      camera.position.set(0, 1, 5)
      scene.add(camera)
      const light = new HemisphereLight(0xffffff, 0xbbbbff, 1)
      light.position.set(0.5, 1, 0.25)
      scene.add(light)

      //

      renderer = new WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.xr.enabled = true
      container.appendChild(renderer.domElement)

      // video: document.getElementById("video")

      const material = new MeshPhongMaterial({ color: 0xffffff * Math.random() })
      const mesh = new Mesh(new CylinderGeometry(0.1, 0.1, 0.1), material)
      mesh.scale.y = Math.random() * 2 + 0.1
      scene.add(mesh)

      //

      document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }))

      function onSelect() {
        if (reticle.visible) {
          // record();
          player.play()

          player.mesh.position.setFromMatrixPosition(reticle.matrix)
          mesh.position.setFromMatrixPosition(reticle.matrix)
        }
      }

      controller = renderer.xr.getController(0)

      controller.addEventListener('select', onSelect)
      scene.add(controller)

      reticle = new Mesh(new RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2), new MeshBasicMaterial())
      reticle.matrixAutoUpdate = false
      reticle.visible = false
      scene.add(reticle)

      //
      window.addEventListener('click', onSelect)

      window.addEventListener('resize', onWindowResize)
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()

      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    //

    function animate() {
      renderer.setAnimationLoop(render)
    }

    function render(timestamp, frame) {
      if (frame && renderer.xr) {
        const referenceSpace = renderer.xr.getReferenceSpace()
        const session = renderer.xr.getSession()

        if (hitTestSourceRequested === false) {
          session.requestReferenceSpace('viewer').then((referenceSpace) => {
            session.requestHitTestSource({ space: referenceSpace }).then((source) => {
              hitTestSource = source
            })
          })

          session.addEventListener('end', () => {
            hitTestSourceRequested = false
            hitTestSource = null
          })

          hitTestSourceRequested = true
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource)

          if (hitTestResults.length) {
            const hit = hitTestResults[0]

            reticle.visible = true
            reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix)
          } else {
            reticle.visible = false
          }
        }
      }
      if (player) {
        player.handleRender(() => {
          renderer.render(scene, camera)
        })
      }
    }
  }, [])

  var isRecording = false

  return (
    <button type="button" onClick={() => {}}>
      Hi
    </button>
  )
}

export default VideoRecording

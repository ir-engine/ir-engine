      import {WebXRButton} from './js/util/webxr-button.js'
      import {Scene} from './js/render/scenes/scene.js'
      import {Renderer, createWebGLContext} from './js/render/core/renderer.js'
      import {Gltf2Node} from './js/render/nodes/gltf2.js'
      import {SkyboxNode} from './js/render/nodes/skybox.js'
      import {vec3} from './js/render/math/gl-matrix.js'
      import {Ray} from './js/render/math/ray.js'
      import {InlineViewerHelper} from './js/util/inline-viewer-helper.js'
      import {QueryArgs} from './js/util/query-args.js'

      // If requested, use the polyfill to provide support for mobile devices
      // and devices which only support WebVR.
      import WebXRPolyfill from './js/third-party/webxr-polyfill/build/webxr-polyfill.module.js'
      if (QueryArgs.getBool('usePolyfill', true)) new WebXRPolyfill()

      import { World } from "//ecsy.io/build/ecsy.module.js"
      import WebXRSystem from "../../src/input/systems/WebXRInputSystem"
      import {
        WebXRRenderer,
        WebXRSpace,
        WebXRViewPoint,
        WebXRPointer,
        WebXRMainController,
        WebXRSecondController,
      } from "../../src/input/components/WebXR"

      // XR globals.
      const world = new World()
      let system = null
      let entity = null
      let session = null
      let xrButton = null
      let isImmersive = false
      let xrImmersiveRefSpace = null
      let inlineViewerHelper = null

      // WebGL scene globals.
      let gl = null
      let renderer = null
      let scene = null

      start()

      function start(){
        initGL()
        createScene()
        initDOM()
        initXR_UI()
        initSystem()
        initEntity()
        
        main()
      }

      function main(){
        let lastTime = performance.now()
        function animationLoop(){
          let time = performance.now()
          let delta = time - lastTime

          world.execute(delta, time)

          lastTime = time
          renderer = entity.getComponent( WebXRRenderer )
          renderer.requestAnimationFrame( animationLoop )
        }
        animationLoop()
      }

      function initXR_UI(){
        xrButton = new WebXRButton({
          onRequestSession: startXR,
          onEndSession: session => session.end(),
          onSessionEnded,
        })
        document.querySelector('header').appendChild(xrButton.domElement)
      }

      function initSystem(){
        world.registerSystem(WebXRSystem, {
          onVRSupportRequested: isSupported => 
            isImmersive = xrButton.enabled = isSupported,
        })
        system = world.getSystem(WebXRSystem)
      }

      function initEntity(){
        entity = world.createEntity()
        world.registerComponent(WebXRRenderer)
        entity.addComponent(WebXRRenderer, {context: gl})
      }

      function startXR(){}

      function initGL() {
        if (gl) return
        gl = createWebGLContext({xrCompatible: true})
        initXRRenderer()
        renderer = new Renderer(gl)
      }

      function initDOM(){
        // Note: If you don't want dragging on the canvas to do things like
        // scroll or pull-to-refresh, you'll want to set touch-action: none;
        // on the canvas' CSS style, which this page does in common.css
        document.body.appendChild(gl.canvas)

        function onResize() {
          gl.canvas.width = gl.canvas.clientWidth * window.devicePixelRatio;
          gl.canvas.height = gl.canvas.clientHeight * window.devicePixelRatio;
        }
        window.addEventListener('resize', onResize)
        onResize()
      }

      function createScene(){
        scene = new Scene()
        scene.addNode(new Gltf2Node({url: 'media/gltf/cave/cave.gltf'}))
        scene.addNode(new SkyboxNode({url: 'media/textures/eilenriede-park-2k.png'}))
        scene.standingStats(true)

        scene.setRenderer(renderer)
        // Loads a generic controller meshes.
        scene.inputRenderer.setControllerMesh(new Gltf2Node({url: 'media/gltf/controller/controller.gltf'}), 'right');
        scene.inputRenderer.setControllerMesh(new Gltf2Node({url: 'media/gltf/controller/controller-left.gltf'}), 'left');
      }

      function drawFrame() {
        scene.startFrame()
        renderer.requestAnimationFrame(drawFrame)
        renderMain()
        session = entity.getComponent(WebXRViewPoint)
        const viewer = entity.getComponent(WebXRViewPoint)
        viewer && scene.drawXRFrame({session}, viewer.pose)
        scene.endFrame()
      }

      function renderMain() {

        const { pose, pointerMode } = entity.getComponent(WebXRPointer)
        if (pointerMode == 'tracked-pointer') {
          // If we have a pointer matrix and the pointer origin is the users
          // hand (as opposed to their head or the screen) use it to render
          // a ray coming out of the input device to indicate the pointer
          // direction.
          scene.inputRenderer.addLaserPointer(pose.transform)
        }

        //entity.getComponent(WebXRSpace)
        const gripSpace, gripPose
        
        const controllers = [ 
          entity.getComponent(WebXRMainController),
          entity.getComponent(WebXRSecondController)
        ]

        for (let { pose, gripSpace, handId } of controllers) {

          if (!pose) continue

          // If we have a pointer matrix we can also use it to render a cursor
          // for both handheld and gaze-based input sources.

          // Statically render the cursor 2 meters down the ray since we're
          // not calculating any intersections in this sample.
          let targetRay = new Ray(pose.transform)
          let cursorDistance = 2.0
          let cursorPos = vec3.fromValues(
              targetRay.origin.x,
              targetRay.origin.y,
              targetRay.origin.z
              )
          vec3.add(cursorPos, cursorPos, [
              targetRay.direction.x * cursorDistance,
              targetRay.direction.y * cursorDistance,
              targetRay.direction.z * cursorDistance,
              ])
          // vec3.transformMat4(cursorPos, cursorPos, inputPose.targetRay.transformMatrix);

          scene.inputRenderer.addCursor(cursorPos)
          
          if (gripSpace && gripPose) {
              // If we have a grip pose use it to render a mesh showing the
              // position of the controller.
              scene.inputRenderer.addController(gripPose.transform.matrix, handId)
          }
        }

      }

      function onSessionEnded() {
        if (isImmersive) {
          xrButton.setSession(null)
        }
      }
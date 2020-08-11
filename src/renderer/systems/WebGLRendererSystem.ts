import { System } from "ecsy"
import { WebGLRendererComponent } from "../components/WebGLRendererComponent.js"
import { CameraComponent } from "../../camera/components/CameraComponent.js"
import { SceneComponent } from "../../common/components/SceneComponent.js"

export class WebGLRendererSystem extends System {
  onResize() {
    WebGLRendererComponent.instance.needsResize = true
  }

  init() {
    WebGLRendererComponent.instance.needsResize = true
    this.onResize = this.onResize.bind(this)
    window.addEventListener("resize", this.onResize, false)
  }

  dispose() {
    window.removeEventListener("resize", this.onResize)
  }

  execute() {
    const entities = this.queries.renderers.results

    for (let i = 0; i < entities.length; i++) {
      if (WebGLRendererComponent.instance.needsResize) {
        const canvas = WebGLRendererComponent.instance.renderer.domElement

        const curPixelRatio = WebGLRendererComponent.instance.renderer.getPixelRatio()

        if (curPixelRatio !== window.devicePixelRatio) {
          WebGLRendererComponent.instance.renderer.setPixelRatio(window.devicePixelRatio)
        }

        const width = canvas.clientWidth
        const height = canvas.clientHeight

        CameraComponent.instance.camera.aspect = width / height
        CameraComponent.instance.camera.updateProjectionMatrix()
        WebGLRendererComponent.instance.renderer.setSize(width, height, false)

        WebGLRendererComponent.instance.needsResize = false
      }

      WebGLRendererComponent.instance.renderer.render(SceneComponent.instance.scene, CameraComponent.instance.camera)
    }
  }
}

WebGLRendererSystem.queries = {
  renderers: { components: [WebGLRendererComponent] }
}

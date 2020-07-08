import { System } from 'ecsy'
import { Object3DComponent } from 'ecsy-three'
import { Camera } from 'ecsy-three/src/extras/components'

class CameraSystem extends System {
  someProp: any

  init (someProp): void {
    this.someProp = someProp
  }

  execute (delta): void {
    console.debug(delta)
    this.queries.entities.results.forEach(entity => {
      console.debug(entity)
    })

    this.queries.entities.added.forEach(entity => {
    })
    this.queries.entities.changed.forEach(entity => {
      const cameraComp = entity.getComponent(Camera)
      const camera3dObjectComp = (entity.getMutableComponent(Object3DComponent) as any).value

      camera3dObjectComp.fov = (cameraComp as any).fov
      camera3dObjectComp.aspect = (cameraComp as any).aspect
      camera3dObjectComp.near = (cameraComp as any).near
      camera3dObjectComp.far = (cameraComp as any).far
      // camera3dObjectComp.layers = (cameraComp as any).layers
      camera3dObjectComp.handleResize = (cameraComp as any).handleResize
    })
  }
}

CameraSystem.queries = {
  entities: {
    components: [Camera, Object3DComponent],
    listen: {
      added: true,
      changed: true
    }
  }
}

export default CameraSystem

import { GLTFLoader, Parent } from 'ecsy-three/src/extras/components'

export default function loadGLTFModelComponent (scene: any, entity: any, component: any): void {
  entity.addComponent(GLTFLoader, {
    url: component.data.src,
    onLoaded: () => { console.log('gltf loaded') }
  })
    .addComponent(Parent, { value: scene })
}

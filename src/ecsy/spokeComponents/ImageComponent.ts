import * as THREE from 'three'

import Image from '../components/Image'

export default function loadImageComponent (scene: any, entity: any, component: any): void {

  entity.addComponent(Image, {
    src: component.data.src,
    projection: component.data.projection,
    parent: scene
  })
}

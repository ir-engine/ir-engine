import * as THREE from 'three'
import { System } from 'ecsy'

import Image from '../components/Image'

class MySystem extends System {
  someProp: any

  init (someProp): void {
    this.someProp = someProp
  }

  execute (delta): void {
    this.queries.entities.results.forEach(entity => {
      console.log(entity)
    })

    this.queries.entities.added.forEach(entity => {
      console.log(entity)

      const component = entity.getComponent(Image)
      let geo, mat, mesh

      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load(
        component.src,
        () => {console.log('image loaded')},
        null,
        error => console.log(error)
      );

      mat = new THREE.MeshBasicMaterial({
        map: texture
      })

      if (component.projection === "360-equirectangular") {
        geo = new THREE.SphereBufferGeometry(1, 64, 32);
        geo.scale(-1, 1, 1);
      } else {
        geo = new THREE.PlaneBufferGeometry();
        mat.side = THREE.DoubleSide;
      }

      mesh = new THREE.Mesh(geo, mat);

      (entity as any).addObject3DComponent(mesh, component.parent)
    })
    this.queries.entities.removed.forEach(entity => {
      console.log(entity);
      (entity as any).removeObject3DComponent()
    })
    this.queries.entities.changed.forEach(entity => {
      console.log(entity);
      (entity as any).removeObject3DComponent()

      const component = entity.getComponent(Image)
      let geo, mat, mesh

      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load(
        component.src,
        () => {console.log('image loaded')},
        null,
        error => console.log(error)
      );

      mat = new THREE.MeshBasicMaterial({
        map: texture
      })

      if (component.projection === "360-equirectangular") {
        geo = new THREE.SphereBufferGeometry(1, 64, 32);
        geo.scale(-1, 1, 1);
      } else {
        geo = new THREE.PlaneBufferGeometry();
        mat.side = THREE.DoubleSide;
      }

      mesh = new THREE.Mesh(geo, mat);

      (entity as any).addObject3DComponent(mesh, component.parent)

    })
  }
}

MySystem.queries = {
  entities: {
    components: [Image],
    listen: {
      added: true,
      removed: true,
      changed: true
    }
  }
}

export default MySystem

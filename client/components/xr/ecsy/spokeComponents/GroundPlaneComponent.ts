import * as THREE from 'three'

export default function loadGroundPlaneComponent (scene: any, entity: any, component: any): void {
  const geometry = new THREE.PlaneGeometry(40000, 40000)
  const material = new THREE.MeshBasicMaterial({ color: component.data.color, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(geometry, material)
  plane.rotateX(180)
  entity.addObject3DComponent(plane, scene)
}

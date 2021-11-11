import { CircleBufferGeometry, Color, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'

export type GroundPlaneDataProps = {
  color: Color,
  receiveShadow: boolean,
  walkable: boolean
}

export class GroundPlaneData implements ComponentData {
  static legacyComponentName = ComponentNames.GROUND_PLANE

  constructor(obj3d: Mesh, props: GroundPlaneDataProps) {
    this.obj3d = obj3d
    this.obj3d.geometry = new CircleBufferGeometry(1000, 32)
    this.obj3d.material = new MeshStandardMaterial({
      color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
      roughness: 0
    })

    this.obj3d.name = 'GroundPlaneMesh'
    this.obj3d.position.setY(-0.05)
    this.obj3d.rotation.x = -Math.PI / 2

    this.walkableMesh = new Mesh(
      new CircleBufferGeometry(1, 32),
      new MeshBasicMaterial({ color: new Color('#ff0000')})
    )

    this.walkableMesh.name = 'WalkableMesh'
    this.walkableMesh.scale.set(100, 100, 100)
    this.walkableMesh.visible = false
    this.obj3d.add(this.walkableMesh)

    this.obj3d.userData = {
      type: 'ground',
      collisionLayer: CollisionGroups.Ground,
      collisionMask: CollisionGroups.Default
    }

    this.color = typeof props.color === 'string' ? new Color(props.color) : props.color
    this.receiveShadow =  props.receiveShadow ?? false
    this.walkable = props.walkable ?? false

    this.obj3d.updateMatrix()
  }

  obj3d: Mesh
  walkableMesh: Mesh
  walkable: boolean

  get color(): Color {
    if (Array.isArray(this.obj3d.material)) {
      return (this.obj3d.material[0] as MeshStandardMaterial).color
    } else {
      return (this.obj3d.material as MeshStandardMaterial).color
    }
  }

  set color(color: Color) {
    if (!this.obj3d.material) return

    if (Array.isArray(this.obj3d.material)) {
      this.obj3d.material.forEach((m: MeshStandardMaterial) => m.color = color)
    } else {
      (this.obj3d.material as MeshStandardMaterial).color = color
    }
  }

  get receiveShadow() {
    return this.obj3d.receiveShadow
  }

  set receiveShadow(receiveShadow: boolean) {
    this.obj3d.receiveShadow = receiveShadow
  }

  serialize(): GroundPlaneDataProps {
    return {
      color: this.color,
      receiveShadow: this.receiveShadow,
      walkable: this.walkable
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const GroundPlaneComponent = createMappedComponent<GroundPlaneData>(ComponentNames.GROUND_PLANE)

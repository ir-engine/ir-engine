import { CircleBufferGeometry, Color, Mesh, MeshBasicMaterial, MeshStandardMaterial, Quaternion, Vector3 } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'
import { Component } from './Component'

export type GroundPlaneComponentProps = {
  color: Color,
  receiveShadow: boolean,
  walkable: boolean
  obj3d?: Mesh
}

// TODO: Component class to hold the component data
export class GroundPlaneComponentClass implements Component {
  static legacyComponentName = 'ground-plane'

  // TODO: Will be used for rendering Editor input UI
  static metadata: [
    {
      name: 'coler',
      displayName: 'Color',
      type: 'Color',
    },
    {
      name: 'receiveShadow',
      displayName: 'Receive Shadow',
      type: 'boolean',
    },
    {
      name: 'walkable',
      displayName: 'Walkable',
      type: 'boolean',
    }
  ]

  constructor(props: GroundPlaneComponentProps) {
    this.obj3d = props.obj3d ?? new Mesh(
      new CircleBufferGeometry(1000, 32),
      new MeshStandardMaterial({
        color: new Color(0.313410553336143494, 0.31341053336143494, 0.30206481294706464),
        roughness: 0
      })
    )

    this.obj3d.name = 'GroundPlaneMesh'
    this.obj3d.position.setY(-0.05)
    this.obj3d.rotateX(-Math.PI / 2)

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

  serialize(): GroundPlaneComponentProps {
    return {
      color: this.color,
      receiveShadow: this.receiveShadow,
      walkable: this.walkable
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }

  deserialize(props): GroundPlaneComponentClass {
    return new GroundPlaneComponentClass(props)
  }

  deserializeFromJSON(json: string): GroundPlaneComponentClass {
    return this.deserialize(JSON.parse(json))
  }
}

// TODO: Compoent type
export const GroundPlaneComponent = createMappedComponent<GroundPlaneComponentClass>('GroundPlaneComponent')

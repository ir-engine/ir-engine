import { BoxBufferGeometry, BoxHelper, Material, Mesh } from 'three'
import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { CollisionGroups } from '../../physics/enums/CollisionGroups'

export type TriggerVolumeDataProps = {
  args: any
  target: any
  showHelper: boolean
  active: boolean
}

export class TriggerVolumeData implements ComponentData {
  static legacyComponentName = ComponentNames.TRIGGER_VOLUME

  constructor(obj3d: Mesh, props?: TriggerVolumeDataProps) {
    this.obj3d = obj3d

    this.obj3d.geometry = new BoxBufferGeometry()
    this.obj3d.material = new Material()

    this.obj3d.userData = {
      type: 'box',
      isTrigger: true,
      collisionLayer: CollisionGroups.Trigger,
      collisionMask: CollisionGroups.Default
    }

    if (props) {
      this.active = props.active
      this.target = props.target

      if (props.showHelper) {
        this.showHelper = props.showHelper
      }
    }
  }

  obj3d: Mesh
  helper: BoxHelper
  active: boolean
  target: any

  get showHelper() {
    return this.helper ? this.helper.visible : false
  }

  set showHelper(showHelper: boolean) {
    if (showHelper && !this.helper) {
      this.helper = new BoxHelper(this.obj3d, 0xffff00)
      this.helper.layers.set(1)
      this.obj3d.scale.multiplyScalar(2) // engine uses half-extents for box size, to be compatible with gltf and threejs
      this.obj3d.add(this.helper)
    }

    this.helper.visible = showHelper
  }

  serialize(): object {
    return {
      active: this.active,
      showHelper: this.showHelper,
      target: this.target
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const TriggerVolumeComponent = createMappedComponent<TriggerVolumeData>('TriggerVolumeComponent')

import EditorNodeMixin from './EditorNodeMixin'
import PhysicalDirectionalLight from '@xrengine/engine/src/scene/classes/PhysicalDirectionalLight'
import EditorDirectionalLightHelper from '@xrengine/engine/src/scene/classes/EditorDirectionalLightHelper'
import { CameraHelper, DirectionalLight, Color, Vector2, Vector3, Quaternion, Euler } from 'three'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { DirectionalLightComponent } from '@xrengine/engine/src/scene/components/DirectionalLightComponent'
import { addObject3DComponent } from '@xrengine/engine/src/scene/functions/addObject3DComponent'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { VisibleComponent } from '@xrengine/engine/src/scene/components/VisibleComponent'
import { PersistTagComponent } from '@xrengine/engine/src/scene/components/PersistTagComponent'

// TODO: Nayan - Remove dependency of EditorNodeMixin
export default class DirectionalLightNode extends EditorNodeMixin(PhysicalDirectionalLight) {
  static legacyComponentName = 'directional-light'
  static nodeName = 'Directional Light'

  static async deserialize(json) {
    await super.deserialize(json)

    const entity = createEntity()
    deserializeDirectionalLight(entity, json.components)

    const obj3d = getComponent(entity, Object3DComponent)?.value

    // TODO: Nayan - Make this clean
    obj3d.entity = entity
    obj3d.constructor.legacyComponentName = 'directional-light'
    obj3d.constructor.nodeName = 'Directional Light'
    obj3d.isNode = true
    obj3d.name = json.name

    // TODO: Nayan - Find way to handle this events
    obj3d.onSelect = function () {
      this.helper.visible = true

      const component = getComponent(entity, DirectionalLightComponent)

      this.cameraHelper.visible = component.showCameraHelper
    }
    obj3d.onDeselect = function () {
      this.helper.visible = false
      this.cameraHelper.visible = false
    }

    return obj3d as any
  }

  copy(source, recursive = true) {
    super.copy(source, false)
    if (recursive) {
      this.remove(this.helper)
      this.remove(this.target)
      for (let i = 0; i < source.children.length; i++) {
        const child = source.children[i]
        if (child.type === 'CameraHelper') continue
        if (child === source.helper) {
          this.helper = new EditorDirectionalLightHelper(this)
          this.add(this.helper)
        } else if (child === source.target) {
          this.target = child.clone()
          this.add(this.target)
        } else if (child === source.cameraHelper) {
          this.cameraHelper = new CameraHelper(this.shadow.camera)
          this.cameraHelper.visible = false
          this.add(this.cameraHelper)
        } else {
          this.add(child.clone())
        }
      }
    }
    return this
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)
    this.addGLTFComponent('directional-light', {
      color: this.color,
      intensity: this.intensity,
      castShadow: this.castShadow,
      shadowMapResolution: this.shadowMapResolution.toArray(),
      shadowBias: this.shadowBias,
      shadowRadius: this.shadowRadius,
      cameraFar: this.cameraFar,
      showCameraHelper: this.showCameraHelper
    })
    this.replaceObject()
  }
}

// TODO: Nayan - For serialization and deserialization we need some kind of schema or this functions will be added back to the node
// and node will extend Object3d class from three js library directly without EditorMixin
export const serializeDirectionalLight = (entity: Entity) => {
  const component = getComponent(entity, DirectionalLightComponent)

  return {
    name: 'directional-light',
    props: {
      color: component.color,
      intensity: component.intensity,
      castShadow: component.castShadow,
      shadowMapResolution: component.shadowMapResolution,
      shadowBias: component.shadowBias,
      shadowRadius: component.shadowRadius,
      cameraFar: component.cameraFar,
      showCameraHelper: component.showCameraHelper
    }
  }
}

export const deserializeDirectionalLight = (entity: Entity, components: any[]) => {
  if (!components) return

  const light = new DirectionalLight()

  ;(light as any).helper = new EditorDirectionalLightHelper(light)
  ;(light as any).helper.visible = false
  light.add((light as any).helper)
  ;(light as any).cameraHelper = new CameraHelper(light.shadow.camera)
  ;(light as any).cameraHelper.visible = false
  light.add((light as any).cameraHelper)

  addObject3DComponent(entity, light)

  // TODO: Nayan - Need to saperate desirialization functions for different component
  for (let component of components) {
    if (component.name === 'transform') {
      const { position, rotation, scale } = component.props
      addComponent(entity, TransformComponent, {
        position: new Vector3(position.x, position.y, position.z),
        rotation: new Quaternion().setFromEuler(
          new Euler().setFromVector3(new Vector3(rotation.x, rotation.y, rotation.z), 'XYZ')
        ),
        scale: new Vector3(scale.x, scale.y, scale.z)
      })
    } else if (component.name === 'visible') {
      addComponent(entity, VisibleComponent, { value: component.props.visible })
    } else if (component.name === 'persist') {
      addComponent(entity, PersistTagComponent, { value: component.props.visible })
    } else if (component.name === 'includeInCubemapBake') {
      // addComponent(entity, includeInCubemapBakeComponent, { value: component.props.visible })
    } else if (component.name === 'directional-light') {
      const lightComponent = addComponent(entity, DirectionalLightComponent, {
        ...component.props,
        color: new Color(component.props.color),
        shadowMapResolution: new Vector2().fromArray(component.props.shadowMapResolution)
      })
      lightComponent.dirty = true
    }
  }
}

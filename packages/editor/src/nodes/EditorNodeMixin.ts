import { StaticModes } from '../functions/StaticMode'
import { Color, Object3D } from 'three'
import serializeColor from '../functions/serializeColor'
import ErrorIcon from '../classes/ErrorIcon'

export default function EditorNodeMixin(Object3DClass) {
  return class extends Object3DClass {
    static nodeName = 'Unknown Node'
    static useMultiplePlacementMode = false
    // Used for props like src that have side effects that we don't want to happen in the constructor
    static initialElementProps = {}
    static hideInElementsPanel = false
    includeInCubemapBake: boolean
    static canAddNode() {
      return true
    }
    static async load() {
      return Promise.resolve()
    }
    static async deserialize(json, loadAsync?, onError?) {
      // Unused params used in derived class methods
      const node = new this()
      node.name = json.name
      if (json.components) {
        const transformComponent = json.components.find((c) => c.name === 'transform')
        if (transformComponent) {
          const { position, rotation, scale } = transformComponent.props
          node.position.set(position.x, position.y, position.z)
          node.rotation.set(rotation.x, rotation.y, rotation.z)
          node.scale.set(scale.x, scale.y, scale.z)
        }

        const visibleComponent = json.components.find((c) => c.name === 'visible')
        if (visibleComponent) node.visible = visibleComponent.props.visible

        const persistComponent = json.components.find((c) => c.name === 'persist')
        node.persist = !!persistComponent

        const includeInCubemapBakeComponent = json.components.find((c) => c.name === 'includeInCubemapBake')
        node.includeInCubemapBake = !!includeInCubemapBakeComponent
      }
      return node
    }
    constructor(...args) {
      super(...args)
      this.nodeName = (this.constructor as any).nodeName
      this.name = (this.constructor as any).nodeName
      this.isNode = true
      this.isCollapsed = false
      this.useMultiplePlacementMode = (this.constructor as any).useMultiplePlacementMode
      this.staticMode = StaticModes.Inherits
      this.originalStaticMode = null
      this.errorIcon = null
      this.issues = []
    }
    clone(recursive) {
      return new (this as any).constructor().copy(this, recursive)
    }
    copy(source, recursive = true): this {
      if (recursive) {
        this.remove(this.errorIcon)
      }
      super.copy(source, recursive)
      if (recursive) {
        const errorIconIndex = source.children.findIndex((child) => child === source.errorIcon)
        if (errorIconIndex !== -1) {
          this.errorIcon = this.children[errorIconIndex]
        }
      }
      this.issues = source.issues.slice()
      return this
    }
    onPlay() {}
    onUpdate(delta: number, time?: number) {}
    onPause() {}
    onAdd() {}
    onChange(prop: string) {}
    onRemove() {}
    onSelect() {}
    onDeselect() {}
    async serialize(projectID, components?): Promise<any> {
      const entityJson = {
        name: this.name,
        components: [
          {
            name: 'transform',
            props: {
              position: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
              },
              rotation: {
                x: this.rotation.x,
                y: this.rotation.y,
                z: this.rotation.z
              },
              scale: {
                x: this.scale.x,
                y: this.scale.y,
                z: this.scale.z
              }
            }
          },
          {
            name: 'visible',
            props: {
              visible: this.visible
            }
          }
        ]
      }

      if (this.persist) {
        entityJson.components.push({
          name: 'persist',
          props: {} as any
        })
      }

      if (this.includeInCubemapBake) {
        entityJson.components.push({
          name: 'includeInCubemapBake',
          props: {} as any
        })
      }

      if (components) {
        for (const componentName in components) {
          if (!Object.prototype.hasOwnProperty.call(components, componentName)) continue
          const serializedProps = {}
          const componentProps = components[componentName]
          for (const propName in componentProps) {
            if (!Object.prototype.hasOwnProperty.call(componentProps, propName)) continue
            const propValue = componentProps[propName]
            if (propValue instanceof Color) {
              serializedProps[propName] = serializeColor(propValue)
            } else {
              serializedProps[propName] = propValue
            }
          }
          ;(entityJson.components as any).push({
            name: componentName,
            props: serializedProps
          })
        }
      }
      return entityJson
    }
    prepareForExport(ctx?: any): void {
      this.userData.editor_uuid = this.uuid
      if (!this.visible) {
        this.addGLTFComponent('visible', {
          visible: this.visible
        })
      }
    }
    addGLTFComponent(name, props?) {
      if (!this.userData.gltfExtensions) {
        this.userData.gltfExtensions = {}
      }
      if (!this.userData.gltfExtensions.componentData) {
        this.userData.gltfExtensions.componentData = {}
      }
      if (props !== undefined && typeof props !== 'object') {
        throw new Error('glTF component props must be an object or undefined')
      }
      const componentProps = {}
      for (const key in props) {
        if (!Object.prototype.hasOwnProperty.call(props, key)) continue
        const value = props[key]
        if (value instanceof Color) {
          componentProps[key] = serializeColor(value)
        } else {
          componentProps[key] = value
        }
      }
      this.userData.gltfExtensions.componentData[name] = componentProps
    }
    replaceObject(replacementObject?) {
      replacementObject = replacementObject || new Object3D().copy(this as any, false)
      replacementObject.uuid = this.uuid
      if (this.userData.gltfExtensions && this.userData.gltfExtensions.componentData) {
        replacementObject.userData.gltfExtensions.componentData = this.userData.gltfExtensions.componentData
      }
      for (const child of this.children) {
        if (child.isNode) {
          replacementObject.children.push(child)
          child.parent = replacementObject
        }
      }
      this.parent.add(replacementObject)
      this.parent.remove(this)
    }
    gltfIndexForUUID(nodeUUID) {
      return { __gltfIndexForUUID: nodeUUID }
    }
    showErrorIcon() {
      if (!this.errorIcon) {
        this.errorIcon = new ErrorIcon()
        this.add(this.errorIcon)
      }
      const worldScale = this.getWorldScale(this.errorIcon.scale)
      if (worldScale.x === 0 || worldScale.y === 0 || worldScale.z === 0) {
        this.errorIcon.scale.set(1, 1, 1)
      } else {
        this.errorIcon.scale.set(1 / worldScale.x, 1 / worldScale.y, 1 / worldScale.z)
      }
    }
    hideErrorIcon() {
      if (this.errorIcon) {
        this.remove(this.errorIcon)
        this.errorIcon = null
      }
    }
    findNodeByType(nodeType) {
      if (this.constructor === nodeType) {
        return this
      }
      for (const child of this.children) {
        if (child.isNode) {
          const result = child.findNodeByType(nodeType)
          if (result) {
            return result
          }
        }
      }
      return null
    }
  }
}

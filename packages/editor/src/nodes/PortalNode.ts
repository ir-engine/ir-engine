import Model from '@xrengine/engine/src/scene/classes/Model'
import {
  BoxBufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3
} from 'three'
import EditorNodeMixin from './EditorNodeMixin'

export default class PortalNode extends EditorNodeMixin(Model) {
  static legacyComponentName = 'portal'
  static nodeName = 'Portal'

  linkedPortalId: string
  locationName: string
  spawnPosition: Vector3 = new Vector3()
  spawnRotation: Euler = new Euler()
  spawnCylinder: Mesh
  triggerHelper: Mesh

  triggerPosition: Vector3 = new Vector3()
  triggerRotation: Euler = new Euler()
  triggerScale: Vector3 = new Vector3(1, 1, 1)

  static async deserialize(json) {
    const node = (await super.deserialize(json)) as PortalNode
    const portalComponent = json.components.find((c) => c.name === 'portal')
    console.log(json)
    if (portalComponent) {
      node.linkedPortalId = portalComponent.props.linkedPortalId
      node.locationName = portalComponent.props.locationName
      node.cubemapBakeId = portalComponent.props.cubemapBakeId

      node.spawnPosition = new Vector3()
      if (portalComponent.props.spawnPosition) {
        ;(node as any as Object3D).updateMatrixWorld(true)
        node.spawnPosition.copy(
          (node as any as Object3D).worldToLocal(
            new Vector3(
              portalComponent.props.spawnPosition.x,
              portalComponent.props.spawnPosition.y,
              portalComponent.props.spawnPosition.z
            )
          )
        )
      }
      node.spawnRotation = new Euler()
      if (portalComponent.props.spawnRotation) {
        node.spawnRotation.set(
          portalComponent.props.spawnRotation.x - node.rotation.x, // Have to convert from global space to local space
          portalComponent.props.spawnRotation.y - node.rotation.y,
          portalComponent.props.spawnRotation.z - node.rotation.z
        )
      }
      node.updateSpawnPositionOnScene()
      node.updateSpawnRotationOnScene()

      if (portalComponent.props.triggerPosition) node.triggerPosition.copy(portalComponent.props.triggerPosition)
      if (portalComponent.props.triggerRotation)
        node.triggerRotation.set(
          portalComponent.props.triggerRotation.x ?? 0,
          portalComponent.props.triggerRotation.y ?? 0,
          portalComponent.props.triggerRotation.z ?? 0
        )
      if (portalComponent.props.triggerScale) node.triggerScale.copy(portalComponent.props.triggerScale)

      node.updateTrigger()
    }
    return node
  }
  constructor() {
    super()

    this.triggerHelper = new Mesh(
      new BoxBufferGeometry(1, 1, 0.2),
      new MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.25 })
    )

    this.add(this.triggerHelper)

    this.spawnCylinder = new Mesh(
      new CylinderGeometry(1, 1, 0.3, 6, 1, false, (30 * Math.PI) / 180),
      new MeshBasicMaterial({ color: 0x2b59c3 })
    )

    const spawnDirection = new Mesh(
      new ConeGeometry(0.15, 0.5, 4, 1, false, Math.PI / 4),
      new MeshBasicMaterial({ color: 0xd36582 })
    )

    spawnDirection.position.set(0, 0, 1.25)
    spawnDirection.rotateX(Math.PI / 2)

    this.spawnCylinder.add(spawnDirection)
    this.add(this.spawnCylinder)

    this.updateSpawnPositionOnScene()
    this.updateSpawnRotationOnScene()

    this.spawnCylinder.visible = false
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.triggerHelper)
      this.remove(this.spawnCylinder)
    }
    super.copy(source, recursive)
    this.location = source.location
    return this
  }
  async serialize(projectID) {
    // Have to convert from local space to global space
    const rotation = {
      x: this.spawnRotation.x + this.rotation.x,
      y: this.spawnRotation.y + this.rotation.y,
      z: this.spawnRotation.z + this.rotation.z
    }
    const pos = this.spawnCylinder.getWorldPosition(new Vector3())

    const components = {
      portal: {
        locationName: this.locationName,
        linkedPortalId: this.linkedPortalId,
        cubemapBakeId: this.cubemapBakeId,
        spawnPosition: pos,
        spawnRotation: rotation,
        triggerPosition: this.triggerPosition,
        triggerRotation: { x: this.triggerRotation.x, y: this.triggerRotation.y, z: this.triggerRotation.z },
        triggerScale: this.triggerScale
      }
    } as any
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.triggerHelper)

    // Have to convert from local space to global space
    const rotation = {
      x: this.spawnRotation.x + this.rotation.x,
      y: this.spawnRotation.y + this.rotation.y,
      z: this.spawnRotation.z + this.rotation.z
    }
    const pos = this.spawnCylinder.getWorldPosition(new Vector3())

    this.addGLTFComponent('portal', {
      locationName: this.locationName,
      linkedPortalId: this.linkedPortalId,
      cubemapBakeId: this.cubemapBakeId,
      spawnPosition: pos,
      spawnRotation: rotation,
      triggerPosition: this.triggerPosition,
      triggerRotation: { x: this.triggerRotation.x, y: this.triggerRotation.y, z: this.triggerRotation.z },
      triggerScale: this.triggerScale
    })
  }

  updateSpawnPositionOnScene() {
    this.spawnCylinder.position.set(this.spawnPosition.x || 0, this.spawnPosition.y || 0, this.spawnPosition.z || 0)
  }

  updateSpawnRotationOnScene() {
    this.spawnCylinder.rotation.set(this.spawnRotation.x || 0, this.spawnRotation.y || 0, this.spawnRotation.z || 0)
  }

  updateTrigger() {
    this.triggerHelper.position.copy(this.triggerPosition)
    this.triggerHelper.rotation.copy(this.triggerRotation)
    this.triggerHelper.scale.copy(this.triggerScale)
  }

  onSelect() {
    this.spawnCylinder.visible = true
  }

  onDeselect() {
    this.spawnCylinder.visible = false
  }

  onChange(prop) {
    if (prop === 'triggerPosition' || prop === 'triggerRotation' || prop === 'triggerScale') {
      this.updateTrigger()
    } else if (prop === 'spawnPosition') {
      this.updateSpawnPositionOnScene()
    } else if (prop === 'spawnRotation') {
      this.updateSpawnRotationOnScene()
    }
    this.spawnCylinder.scale.set(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z)
  }
}

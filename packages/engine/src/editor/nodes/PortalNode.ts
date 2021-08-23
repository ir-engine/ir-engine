import { BoxBufferGeometry, ConeGeometry, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import Model from '../../scene/classes/Model'
import { Engine } from '../../ecs/classes/Engine'

export default class PortalNode extends EditorNodeMixin(Model) {
  static legacyComponentName = 'portal'
  static nodeName = 'Portal'

  mesh: Mesh
  linkedPortalId: string
  locationName: string
  modelUrl: string
  displayText: string
  spawnPosition: Vector3 = new Vector3()
  spawnRotation: Euler = new Euler()
  spawnCylinder: Mesh
  triggerHelper: Mesh

  triggerPosition: Vector3 = new Vector3()
  triggerRotation: Euler = new Euler()
  triggerScale: Vector3 = new Vector3(1, 1, 1)

  static async deserialize(editor, json) {
    const node = (await super.deserialize(editor, json)) as PortalNode
    const portalComponent = json.components.find((c) => c.name === 'portal')
    if (portalComponent) {
      node.entityId = json.entityId
      node.linkedPortalId = portalComponent.props.linkedPortalId
      node.modelUrl = portalComponent.props.modelUrl
      node.loadModel()
      node.displayText = portalComponent.props.displayText
      node.locationName = portalComponent.props.locationName
      node.cubemapBakeId = portalComponent.props.cubemapBakeId

      node.spawnPosition = new Vector3()
      if (portalComponent.props.spawnPosition) {
        node.spawnPosition.set(
          portalComponent.props.spawnPosition.x - node.position.x, // Have to convert from global space to local space
          portalComponent.props.spawnPosition.y - node.position.y,
          portalComponent.props.spawnPosition.z - node.position.z
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
      if (portalComponent.props.triggerRotation) node.triggerRotation.copy(portalComponent.props.triggerRotation)
      if (portalComponent.props.triggerScale) node.triggerScale.copy(portalComponent.props.triggerScale)

      node.updateTrigger()
    }
    return node
  }
  constructor(editor) {
    super(editor)

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
  async loadModel() {
    if (!this.modelUrl || this.modelUrl === '') return
    const model = await this.loadGLTF(this.modelUrl)
    if (this.mesh) {
      this.remove(this.mesh)
    }
    this.mesh = model
    this.add(this.mesh)
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.mesh)
      this.remove(this.triggerHelper)
      this.remove(this.spawnCylinder)
    }
    super.copy(source, recursive)
    this.location = source.location
    this.displayText = source.displayText
    return this
  }
  async serialize(projectID) {
    // Have to convert from local space to global space
    const rotation = {
      x: this.spawnRotation.x + this.rotation.x,
      y: this.spawnRotation.y + this.rotation.y,
      z: this.spawnRotation.z + this.rotation.z
    }

    const components = {
      portal: {
        locationName: this.locationName,
        linkedPortalId: this.linkedPortalId,
        modelUrl: this.modelUrl,
        displayText: this.displayText,
        cubemapBakeId: this.cubemapBakeId,
        spawnPosition: this.spawnPosition.add(this.position), // Have to convert from local space to global space
        spawnRotation: rotation,
        triggerPosition: this.triggerPosition,
        triggerRotation: this.triggerRotation,
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

    this.addGLTFComponent('portal', {
      locationName: this.locationName,
      linkedPortalId: this.linkedPortalId,
      modelUrl: this.modelUrl,
      displayText: this.displayText,
      cubemapBakeId: this.cubemapBakeId,
      spawnPosition: this.spawnPosition.add(this.position), // Have to convert from local space to global space
      spawnRotation: rotation,
      triggerPosition: this.triggerPosition,
      triggerRotation: this.triggerRotation,
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
    } else if (prop === 'modelUrl') {
      this.loadModel()
    }
    this.spawnCylinder.scale.set(1 / this.scale.x, 1 / this.scale.y, 1 / this.scale.z)
  }
}

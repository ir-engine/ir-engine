import { ConeGeometry, CylinderGeometry, Euler, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import EditorNodeMixin from './EditorNodeMixin'
import Model from '../../scene/classes/Model'
import { Engine } from '../../ecs/classes/Engine'

export default class PortalNode extends EditorNodeMixin(Model) {
  static legacyComponentName = 'portal'
  static nodeName = 'Portal'

  mesh: Mesh
  linkedPortalId: string
  locationName: string
  displayText: string
  spawnPosition: Vector3 = new Vector3()
  spawnRotation: Euler = new Euler()
  spawnCylinder: Mesh

  static async deserialize(editor, json) {
    const node = (await super.deserialize(editor, json)) as PortalNode
    const portalComponent = json.components.find((c) => c.name === 'portal')
    if (portalComponent) {
      node.entityId = json.entityId
      node.linkedPortalId = portalComponent.props.linkedPortalId
      node.displayText = portalComponent.props.displayText
      node.spawnPosition = new Vector3()
      node.locationName = portalComponent.props.locationName
      node.reflectionProbeId = portalComponent.props.reflectionProbeId
      if (portalComponent.props.spawnPosition)
        node.spawnPosition.set(
          portalComponent.props.spawnPosition.x - node.position.x, // Have to convert from global space to local space
          portalComponent.props.spawnPosition.y - node.position.y,
          portalComponent.props.spawnPosition.z - node.position.z
        )
      node.spawnRotation = new Euler()
      if (portalComponent.props.spawnRotation)
        node.spawnRotation.set(
          portalComponent.props.spawnRotation.x - node.rotation.x, // Have to convert from global space to local space
          portalComponent.props.spawnRotation.y - node.rotation.y,
          portalComponent.props.spawnRotation.z - node.rotation.z
        )
    }
    return node
  }
  constructor(editor) {
    super(editor)
    this.loadGLTF(Engine.publicPath + '/models/common/portal_frame.glb').then((model) => {
      this.mesh = model
      this.add(this.mesh)

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
    })
  }
  copy(source, recursive = true) {
    if (recursive) {
      this.remove(this.mesh)
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
        displayText: this.displayText,
        reflectionProbeId: this.reflectionProbeId,
        spawnPosition: this.spawnPosition.add(this.position), // Have to convert from local space to global space
        spawnRotation: rotation
      }
    } as any
    return await super.serialize(projectID, components)
  }
  prepareForExport() {
    super.prepareForExport()
    this.remove(this.helper)

    // Have to convert from local space to global space
    const rotation = {
      x: this.spawnRotation.x + this.rotation.x,
      y: this.spawnRotation.y + this.rotation.y,
      z: this.spawnRotation.z + this.rotation.z
    }

    this.addGLTFComponent('portal', {
      locationName: this.locationName,
      linkedPortalId: this.linkedPortalId,
      displayText: this.displayText,
      reflectionProbeId: this.reflectionProbeId,
      spawnPosition: this.spawnPosition.add(this.position), // Have to convert from local space to global space
      spawnRotation: rotation
    })
  }

  updateSpawnPositionOnScene() {
    this.spawnCylinder.position.set(this.spawnPosition.x || 0, this.spawnPosition.y || 0, this.spawnPosition.z || 0)
  }

  updateSpawnRotationOnScene() {
    this.spawnCylinder.rotation.set(this.spawnRotation.x || 0, this.spawnRotation.y || 0, this.spawnRotation.z || 0)
  }

  onSelect() {
    this.spawnCylinder.visible = true
  }

  onDeselect() {
    this.spawnCylinder.visible = false
  }

  onChange(prop) {
    if (prop === 'spawnPosition') {
      this.updateSpawnPositionOnScene()
    } else if (prop === 'spawnRotation') {
      this.updateSpawnRotationOnScene()
    }
  }
}

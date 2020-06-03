import AFRAME from 'aframe'
import Player, { defaultPlayerHeight, defaultPlayerID } from '../../../classes/aframe/player'
import { AvatarOptions, defaultTemplateID, defaultAvatarOptions } from '../../../classes/aframe/avatar/avatar'
import { AvatarSchemaComponent, defaultComponents } from '../../../classes/aframe/avatar/avatar-schema'

import { ControllerComponent } from '../../../classes/aframe/controls/controls'
import PlayerControls from '../../../classes/aframe/controls/player-controls'
import LookController from '../../../classes/aframe/controls/look-controls'
import WASDController from '../../../classes/aframe/controls/wasd-controls'

import CameraRig from '../../../classes/aframe/camera/camera-rig'
import CameraComponent from '../../../classes/aframe/camera/camera'

import PropertyMapper from './ComponentUtils'

export const ComponentName = 'player'

export interface PlayerData {
  templateID: string
  components: AvatarSchemaComponent[]
  playerID: string
  playerHeight: number
  nafEnabled: boolean
  fuseEnabled: boolean
  deviceType: string
  inVr: boolean
  movementEnabled: boolean
  options?: AvatarOptions
}

export const PlayerComponentSchema: AFRAME.MultiPropertySchema<PlayerData> = {
  templateID: { default: defaultTemplateID },
  components: { default: defaultComponents },
  options: { default: defaultAvatarOptions },
  playerID: { default: defaultPlayerID },
  playerHeight: { default: defaultPlayerHeight },
  nafEnabled: { default: false },
  fuseEnabled: { default: false },
  deviceType: { default: 'desktop' },
  inVr: { default: false },
  movementEnabled: { default: true }
}

export interface Props {
  player: Player,
  controls: PlayerControls,
  cameraRig: CameraRig,
  cameraRigEl: AFRAME.Entity | null,
  playerCameraEl: AFRAME.Entity | null,
  cameraComponent: CameraComponent,
  firstUpdate: boolean,
  initPlayer: () => void,
  getCursorType: () => string
}

export const PlayerComponent: AFRAME.ComponentDefinition<Props> = {
  schema: PlayerComponentSchema,
  data: {
  } as PlayerData,

  player: {} as Player,
  controls: {} as PlayerControls,
  cameraRig: {} as CameraRig,
  cameraRigEl: {} as AFRAME.Entity,
  playerCameraEl: {} as AFRAME.Entity,
  cameraComponent: {} as CameraComponent,
  firstUpdate: true,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initPlayer()
    else this.el.sceneEl?.addEventListener('loaded', this.initPlayer.bind(this))
  },

  play() {
  },

  pause() {
  },

  update(oldData: PlayerData) {
    const changedData = Object.keys(this.data).filter(x => this.data[x] !== oldData[x])
    if (['fuseEnabled', 'deviceType', 'inVr'].some(prop => changedData.includes(prop)) &&
      Object.keys(this.cameraRig).length !== 0) {
      this.cameraRig.tearDownCameraRig()
      this.el.removeChild(this.cameraRigEl)

      const cursorType: string = this.getCursorType()
      this.cameraRig = new CameraRig('player-camera', {}, cursorType)
      this.cameraRigEl = this.cameraRig.el
      this.playerCameraEl = this.cameraRig.cameraEl
      this.cameraComponent = this.cameraRig.camera
      if (this.cameraRigEl) this.el.appendChild(this.cameraRigEl)

      this.cameraRig.setActive()
      this.cameraRig.removeDefaultCamera()
    }
    if (['movementEnabled'].some(prop => changedData.includes(prop)) &&
      Object.keys(this.cameraRig).length !== 0) {
      this.controls.teardownControls(this.el)

      const controllers: ControllerComponent[] = [new LookController()]
      if (this.data.movementEnabled) controllers.push(new WASDController())

      this.controls = new PlayerControls(controllers)
      this.controls.setupControls(this.el)
    }
  },

  initPlayer() {
    this.el.setAttribute('id', this.data.playerID)

    const cursorType: string = this.getCursorType()
    this.cameraRig = new CameraRig('player-camera', {}, cursorType)
    this.cameraRigEl = this.cameraRig.el
    this.playerCameraEl = this.cameraRig.cameraEl
    this.cameraComponent = this.cameraRig.camera
    if (this.cameraRigEl) this.el.appendChild(this.cameraRigEl)

    this.player = new Player(this.data.playerID)
    if (this.data.nafEnabled) this.player.setupAvatar()

    this.cameraRig.setActive()
    this.cameraRig.removeDefaultCamera()

    const controllers: ControllerComponent[] = [new LookController()]
    if (this.data.movementEnabled) controllers.push(new WASDController())

    this.controls = new PlayerControls(controllers)
    this.controls.setupControls(this.el)

    this.el.object3D.position.set(this.el.object3D.position.x, this.data.playerHeight, this.el.object3D.position.z)
  },

  getCursorType(): string {
    if (this.data.inVr && this.data.deviceType === 'smartphone') return 'fuse'
    return 'mouse'
  }

}

const primitiveProperties = [
  'playerHeight',
  'fuseEnabled',
  'deviceType',
  'inVr',
  'movementEnabled'
]

export const PlayerPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    ...PropertyMapper(primitiveProperties, ComponentName),
    'template-id': ComponentName + '.templateID',
    'player-id': ComponentName + '.playerID',
    'asset-type': ComponentName + '.options.assetType',
    'attach-template-to-local': ComponentName + '.options.attachTemplateToLocal'
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: PlayerComponent,
  primitive: PlayerPrimitive
}

export default ComponentSystem

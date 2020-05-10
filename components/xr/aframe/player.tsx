import AFRAME from 'aframe'
import Player, { defaultPlayerHeight, defaultPlayerID } from '../../../classes/aframe/player'
import { AvatarOptions, defaultTemplateID, defaultAvatarOptions } from '../../../classes/aframe/avatar/avatar'
import { AvatarSchemaComponent, defaultComponents } from '../../../classes/aframe/avatar/avatar-schema'

import PlayerControls from '../../../classes/aframe/controls/player-controls'
import CameraRig from '../../../classes/aframe/camera/camera-rig'
import CameraCoponent from '../../../classes/aframe/camera/camera'

export const ComponentName = 'player'

export interface PlayerData {
  templateID: string
  components: AvatarSchemaComponent[]
  playerID: string
  playerHeight: number
  nafEnabled: boolean
  options?: AvatarOptions
}

export const PlayerComponentSchema: AFRAME.MultiPropertySchema<PlayerData> = {
  templateID: { default: defaultTemplateID },
  components: { default: defaultComponents },
  options: { default: defaultAvatarOptions },
  playerID: { default: defaultPlayerID },
  playerHeight: { default: defaultPlayerHeight },
  nafEnabled: { default: false }
}

export interface PlayerProps {
  player: Player,
  controls: PlayerControls,
  cameraRig: CameraRig,
  cameraRigEl: AFRAME.Entity | null,
  playerCameraEl: AFRAME.Entity | null,
  cameraCoponent: CameraCoponent,
  firstUpdate: boolean,
  initPlayer: () => void,
  getCursorType: () => string
}

export const PlayerComponent: AFRAME.ComponentDefinition<PlayerProps> = {
  schema: PlayerComponentSchema,
  data: {
  } as PlayerData,

  player: {} as Player,
  controls: {} as PlayerControls,
  cameraRig: {} as CameraRig,
  cameraRigEl: {} as AFRAME.Entity,
  playerCameraEl: {} as AFRAME.Entity,
  cameraCoponent: {} as CameraCoponent,
  firstUpdate: true,

  init () {
    if (this.el.sceneEl?.hasLoaded) this.initPlayer()
    else this.el.sceneEl?.addEventListener('loaded', this.initPlayer.bind(this))
  },

  play() {
  },

  pause() {
  },

  initPlayer() {
    this.el.setAttribute('id', this.data.playerID)

    const cursorType: string = this.getCursorType()
    this.cameraRig = new CameraRig('player-camera', {}, cursorType)
    this.cameraRigEl = this.cameraRig.el
    this.playerCameraEl = this.cameraRig.cameraEl
    this.cameraCoponent = this.cameraRig.camera
    if (this.cameraRigEl) this.el.appendChild(this.cameraRigEl)

    this.player = new Player(this.data.playerID)
    if (this.data.nafEnabled) this.player.setupAvatar()

    this.cameraRig.setActive()
    this.cameraRig.removeDefaultCamera()

    this.controls = new PlayerControls()
    this.controls.setupControls(this.el)

    this.el.object3D.position.set(this.el.object3D.position.x, this.data.playerHeight, this.el.object3D.position.z)
  },

  getCursorType(): string {
    return AFRAME.utils.device.isGearVR() ? 'fuse' : 'mouse'
  }

}

export const PlayerPrimitive: AFRAME.PrimitiveDefinition = {
  defaultComponents: {
    ComponentName: {}
  },
  deprecated: false,
  mappings: {
    templateID: ComponentName + '.templateID',
    playerID: ComponentName + '.playerID',
    playerHeight: ComponentName + '.playerHeight',
    assetType: ComponentName + '.options.assetType',
    attachTemplateToLocal: ComponentName + '.options.attachTemplateToLocal'
  }
}

const ComponentSystem = {
  name: ComponentName,
  component: PlayerComponent,
  primitive: PlayerPrimitive
}

export default ComponentSystem

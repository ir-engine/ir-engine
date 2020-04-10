// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
import Player, { defaultPlayerHeight, defaultPlayerID } from '../../../classes/aframe/player'
// eslint-disable-next-line no-unused-vars
import { AvatarOptions, defaultTemplateID, defaultAvatarOptions } from '../../../classes/aframe/avatar/avatar'
// eslint-disable-next-line no-unused-vars
import { AvatarSchemaComponent, defaultComponents } from '../../../classes/aframe/avatar/avatar-schema'

import PlayerControls from '../../../classes/aframe/controls/player-controls'
import CameraRig from '../../../classes/aframe/camera/camera-rig'
// eslint-disable-next-line no-unused-vars
import CameraCoponent from '../../../classes/aframe/camera/camera'

export const ComponentName = 'player'

export interface PlayerData {
  templateID: string
  components: AvatarSchemaComponent[]
  playerID: string
  playerHeight: number
  options?: AvatarOptions
}

export const PlayerComponentSchema: AFRAME.MultiPropertySchema<PlayerData> = {
  templateID: { default: defaultTemplateID },
  components: { default: defaultComponents },
  options: { default: defaultAvatarOptions },
  playerID: { default: defaultPlayerID },
  playerHeight: { default: defaultPlayerHeight }
}

export interface PlayerProps {
  player: Player,
  controls: PlayerControls,
  cameraRig: CameraRig,
  cameraRigEl: AFRAME.Entity | null,
  playerCameraEl: AFRAME.Entity | null,
  cameraCoponent: CameraCoponent,
  firstUpdate: boolean,
  initPlayer: () => void
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

    this.cameraRig = new CameraRig()
    this.cameraRigEl = this.cameraRig.el
    this.playerCameraEl = this.cameraRig.cameraEl
    this.cameraCoponent = this.cameraRig.camera
    if (this.cameraRigEl) this.el.appendChild(this.cameraRigEl)

    this.player = new Player(this.data.playerID)
    this.player.setupAvatar()

    this.cameraRig.setActive()
    this.cameraRig.removeDefaultCamera()

    this.controls = new PlayerControls()
    this.controls.setupControls(this.el)

    this.el.object3D.position.set(this.el.object3D.position.x, this.data.playerHeight, this.el.object3D.position.z)
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

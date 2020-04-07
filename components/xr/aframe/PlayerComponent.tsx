// eslint-disable-next-line no-unused-vars
import AFRAME from 'aframe'
import Player, { defaultPlayerHeight, defaultPlayerID } from '../../../classes/aframe/player'
// eslint-disable-next-line no-unused-vars
import { AvatarOptions, defaultTemplateID, defaultAvatarOptions } from '../../../classes/aframe/avatar'
// eslint-disable-next-line no-unused-vars
import { AvatarSchemaComponent, defaultComponents } from '../../../classes/aframe/avatar-schema'

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
  cameraRig: AFRAME.Entity,
  playerCamera: AFRAME.Entity
}

export const PlayerComponent: AFRAME.ComponentDefinition<PlayerProps> = {
  schema: PlayerComponentSchema,
  data: {
  } as PlayerData,

  player: {} as Player,
  cameraRig: {} as AFRAME.Entity,
  playerCamera: {} as AFRAME.Entity,

  init () {
    this.el.setAttribute('id', this.data.playerID)
    this.el.setAttribute('wasd-controls', { acceleration: 100 })
    this.el.setAttribute('look-controls', { reverseMouseDrag: false })
    this.el.object3D.position.set(0, this.data.playerHeight, 0)

    const cameraRig = document.createElement('a-entity')
    cameraRig.setAttribute('id', 'camera-rig')
    cameraRig.setAttribute('class', 'carmera-rig')
    this.cameraRig = cameraRig

    const playerCamera = document.createElement('a-entity')
    playerCamera.setAttribute('id', 'player-camera')
    playerCamera.classList.add('player-camera')
    playerCamera.classList.add('camera')
    playerCamera.setAttribute('camera', {})
    this.playerCamera = playerCamera

    cameraRig.appendChild(playerCamera)
    this.el.appendChild(cameraRig)

    this.player = new Player(this.data.playerID)
    this.player.setupAvatar()
  },

  play() {
  },

  pause() {
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

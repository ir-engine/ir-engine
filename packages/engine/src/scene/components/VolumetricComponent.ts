import { ComponentData } from '../../common/classes/ComponentData'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type VolumetricDataProps = {
  player?: any
  src: string
  loop: number
  autoPlay: boolean
  interactable: boolean
}

export class VolumetricData implements ComponentData {
  static legacyComponentName = ComponentNames.VOLUMETRIC

  constructor(props?: VolumetricDataProps) {
    if (props) {
      this.player = props.player
    }
  }

  player: any
  interactable: boolean

  get src() {
    return this.player.src
  }

  set src(src: string) {
    this.player.src = src
  }

  get loop() {
    return this.player.loop
  }

  set loop(loop: number) {
    this.player.loop = loop
  }

  get autoPlay() {
    return this.player.autoPlay
  }

  set autoPlay(autoPlay: boolean) {
    this.player.autoPlay = autoPlay
  }

  serialize(): object {
    return {
      src: this.src,
      loop: this.loop,
      autoPlay: this.autoPlay,
      interactable: this.interactable
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const VolumetricComponent = createMappedComponent<VolumetricData>('VolumetricComponent')

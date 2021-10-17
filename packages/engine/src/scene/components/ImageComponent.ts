import Image, { ImageAlphaModeType, ImageProjectionType } from '../classes/Image'
import { ComponentNames } from '../../common/constants/ComponentNames'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ComponentData } from '../../common/classes/ComponentData'

export type ImageDataProps = {
  src: string
  alphaMode: ImageAlphaModeType
  alphaCutoff: number
  projection: ImageProjectionType
}

export class ImageData implements ComponentData {
  static legacyComponentName = ComponentNames.IMAGE

  constructor(obj3d: Image, props?: ImageDataProps) {
    this.obj3d = obj3d

    if (props) {
      this.src = props.src
      this.alphaCutoff = props.alphaCutoff
      this.alphaMode = props.alphaMode
      this.projection = props.projection
    }
  }

  obj3d: Image

  get src() {
    return this.obj3d.src
  }

  set src(src: string) {
    this.obj3d.src = src
  }

  // get controls() {
  //   return this.obj3d.controls
  // }

  // set controls(controls: number) {
  //   this.obj3d.controls = controls
  // }

  get alphaMode() {
    return this.obj3d.alphaMode
  }

  set alphaMode(alphaMode: ImageAlphaModeType) {
    this.obj3d.alphaMode = alphaMode
  }

  get projection() {
    return this.obj3d.projection
  }

  set projection(projection: ImageProjectionType) {
    this.obj3d.projection = projection
  }

  get alphaCutoff() {
    return this.obj3d.alphaCutoff
  }

  set alphaCutoff(alphaCutoff: number) {
    this.obj3d.alphaCutoff = alphaCutoff
  }

  serialize(): ImageDataProps {
    return {
      src: this.src,
      alphaMode: this.alphaMode,
      alphaCutoff: this.alphaCutoff,
      projection: this.projection
    }
  }

  serializeToJSON(): string {
    return JSON.stringify(this.serialize())
  }
}

export const ImageComponent = createMappedComponent<ImageData>('ImageComponent')

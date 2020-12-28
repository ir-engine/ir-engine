import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

class ImageComponent extends Component<ImageComponent> {
  src: string
  projection: string
  parent: any

  static _schema = {
    src: { type: Types.String, default: '' },
    projection: { type: Types.String, default: 'flat' },
    parent: { default: null, type: Types.Ref }
  }
}

export default ImageComponent;

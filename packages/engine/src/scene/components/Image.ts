import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export interface Props {
  src: string;
  projection: string;
  parent: any; // Types.Ref
}

class ImageComponent extends Component<Props> {
  constructor (props: Props) {
    super();
    this.reset();
    if (props === undefined) return;
    this.src = props.src;
    this.projection = props.projection;
    this.parent = props.parent;
  }

  src: string
  projection: string
  parent: any

  static schema = {
    src: { type: Types.String, default: '' },
    projection: { type: Types.String, default: 'flat' },
    parent: { default: null, type: Types.Ref }
  }

  copy (src: this): this {
    this.src = src.src;
    this.projection = src.projection;
    this.parent = src.parent;
    return this;
  }

  reset (): void {
    this.src = '';
    this.projection = 'flat';
    this.parent = null;
  }
}

export default ImageComponent;

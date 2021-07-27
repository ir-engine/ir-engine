import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'
import { Tween } from '@tweenjs/tween.js'

export class TweenComponent extends Component<TweenComponent> {
  tween: Tween<any>

  static _schema = {
    tween: { default: null, type: Types.Ref }
  }
}

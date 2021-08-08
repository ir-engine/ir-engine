import { Tween } from '@tweenjs/tween.js'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type TweenComponentType = {
  tween: Tween<any>
}

export const TweenComponent = createMappedComponent<TweenComponentType>()
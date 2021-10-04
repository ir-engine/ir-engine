import { Tween } from '@tweenjs/tween.js'
import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type TweenComponentType = {
  tween: Tween<any>
}

export const TweenComponent = createMappedComponent<TweenComponentType>('TweenComponent')

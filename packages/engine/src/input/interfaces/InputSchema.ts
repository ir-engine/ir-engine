import { NumericalType } from '../../common/types/NumericalTypes'
import { Entity } from '../../ecs/classes/Entity'
import { InputAlias } from '../types/InputAlias'
import { InputValue } from './InputValue'

export type InputBehaviorType = (entity: Entity, inputKey: InputAlias, inputValue: InputValue, delta: number) => void

export interface InputSchema {
  inputMap: Map<InputAlias, InputAlias>
  behaviorMap: Map<InputAlias, InputBehaviorType>
}

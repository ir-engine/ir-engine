import { NumericalType } from '../../common/types/NumericalTypes'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { InputSchema } from '../interfaces/InputSchema'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'

export type InputComponentType = {
  data: Map<InputAlias, InputValue>
  schema: InputSchema
}

export const InputComponent = createMappedComponent<InputComponentType>('InputComponent')

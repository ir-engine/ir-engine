import { NumericalType } from '../../common/types/NumericalTypes'
import { createMappedComponent } from '../../ecs/functions/EntityFunctions'
import { InputSchema } from '../interfaces/InputSchema'
import { InputValue } from '../interfaces/InputValue'
import { InputAlias } from '../types/InputAlias'

export type InputComponentType = {
  prevData: Map<InputAlias, InputValue<NumericalType>>
  data: Map<InputAlias, InputValue<NumericalType>>
  schema: InputSchema
}

export const InputComponent = createMappedComponent<InputComponentType>()

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { VariableJSON } from '@etherealengine/visual-script'

import { useVisualScriptFlow } from './useVisualScriptFlow'

type visualScriptFlow = ReturnType<typeof useVisualScriptFlow>
let variableCounter = 1
export const useVariableHandler = ({
  variables,
  setVariables
}: Pick<visualScriptFlow, 'variables' | 'setVariables'>) => {
  const createVariable = (): VariableJSON => ({
    id: uuidv4(),
    name: 'variable ' + variableCounter++,
    valueTypeName: 'string',
    initialValue: ''
  })

  const handleAddVariable = useMemo(
    () => () => {
      try {
        setVariables((graphVariable) => [...graphVariable, createVariable()])
      } catch (error) {
        console.error('Error adding variable:', error)
      }
    },
    [variables]
  )

  const handleEditVariable = (editedVariable: VariableJSON) => {
    try {
      setVariables((currentVariables) => {
        const filterList = currentVariables.filter((variable) => variable.id !== editedVariable.id)
        return [...filterList, editedVariable]
      })
    } catch (error) {
      console.error('Error editing variable:', error)
    }
  }

  const handleDeleteVariable = (deleteVariable: VariableJSON) => {
    try {
      variableCounter--
      setVariables((currentVariables) => currentVariables.filter((variable) => variable.id !== deleteVariable.id))
    } catch (error) {
      console.error('Error deleting variable:', error)
    }
  }

  return { handleAddVariable, handleEditVariable, handleDeleteVariable }
}

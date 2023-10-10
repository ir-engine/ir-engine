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

import { useCallback } from 'react'
import { useReactFlow } from 'reactflow'

export const useModifyNodeSocket = (
  id: string,
  type: 'inputs' | 'outputs' | 'both',
  change: 'increase' | 'decrease',
  defaultValue: number
) => {
  const instance = useReactFlow()

  return useCallback(() => {
    instance.setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id !== id) return n
        let newConfiguration
        let actionValue
        switch (change) {
          case 'increase':
            actionValue = 1
            break
          case 'decrease':
            actionValue = -1
            break
        }

        switch (type) {
          case 'inputs':
            newConfiguration = {
              numInputs: Math.max(1, (n.data.configuration?.numInputs ?? defaultValue) + actionValue)
            }
            break

          case 'outputs':
            newConfiguration = {
              numOutputs: Math.max(1, (n.data.configuration?.numOutputs ?? defaultValue) + actionValue)
            }
            break
          case 'both':
            newConfiguration = {
              numCases: Math.max(1, (n.data.configuration?.numCases ?? defaultValue) + actionValue)
            }
            break
        }
        return {
          ...n,
          data: {
            ...n.data,
            configuration: {
              ...n.data.configuration,
              ...newConfiguration
            }
          }
        }
      })
    )
  }, [instance, id, type, change])
}

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

import ActionFunctions from './functions/ActionFunctions'
import StateFunctions from './functions/StateFunctions'
import StoreFunctions, { HyperStore } from './functions/StoreFunctions'

export * from './utils/useHookEffect'
export { useState } from '@speigg/hookstate'

function dynamicFunctionReference<M extends { [name: string]: Function }, K extends keyof M>(
  functionMap: M,
  functionName: K
): M[K] {
  return ((...args) => {
    return functionMap[functionName](...args)
  }) as any
}

export const createHyperStore = dynamicFunctionReference(StoreFunctions, 'createHyperStore')

export const defineAction = dynamicFunctionReference(ActionFunctions, 'defineAction')
export const dispatchAction = dynamicFunctionReference(ActionFunctions, 'dispatchAction')
export const addActionReceptor = dynamicFunctionReference(ActionFunctions, 'addActionReceptor')
export const createActionQueue = dynamicFunctionReference(ActionFunctions, 'createActionQueue')
export const addTopic = dynamicFunctionReference(ActionFunctions, 'addTopic')
export const removeTopic = dynamicFunctionReference(ActionFunctions, 'removeTopic')
export const removeActionReceptor = dynamicFunctionReference(ActionFunctions, 'removeActionReceptor')
export const applyIncomingActions = dynamicFunctionReference(ActionFunctions, 'applyIncomingActions')
export const clearOutgoingActions = dynamicFunctionReference(ActionFunctions, 'clearOutgoingActions')

export const defineState = dynamicFunctionReference(StateFunctions, 'defineState')
export const registerState = dynamicFunctionReference(StateFunctions, 'registerState')
export const getState = dynamicFunctionReference(StateFunctions, 'getState')
export const addStateReactor = dynamicFunctionReference(StateFunctions, 'addStateReactor')
export const removeStateReactor = dynamicFunctionReference(StateFunctions, 'removeStateReactor')

export type { HyperStore }

import ActionFunctions from './functions/ActionFunctions'
import StateFunctions from './functions/StateFunctions'
import StoreFunctions from './functions/StoreFunctions'
import matches from './MatchesUtils'

function dynamicFunctionReference<M extends { [name: string]: Function }, K extends keyof M>(
  functionMap: M,
  functionName: K
): M[K] {
  return ((...args) => {
    return functionMap[functionName](...args)
  }) as any
}

export const createStore = dynamicFunctionReference(StoreFunctions, 'createStore')
export const getStore = dynamicFunctionReference(StoreFunctions, 'getStore')

export const defineAction = dynamicFunctionReference(ActionFunctions, 'defineAction')
export const dispatchAction = dynamicFunctionReference(ActionFunctions, 'dispatchAction')
export const dispatchLocalAction = dynamicFunctionReference(ActionFunctions, 'dispatchLocalAction')
export const addActionReceptor = dynamicFunctionReference(ActionFunctions, 'addActionReceptor')
export const removeActionReceptor = dynamicFunctionReference(ActionFunctions, 'removeActionReceptor')

export const defineState = dynamicFunctionReference(StateFunctions, 'defineState')
export const addStateReactor = dynamicFunctionReference(StateFunctions, 'addStateReactor')
export const removeStateReactor = dynamicFunctionReference(StateFunctions, 'removeStateReactor')

export { matches }

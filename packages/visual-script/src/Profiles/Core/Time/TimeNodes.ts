// Unreal Engine Blueprint Time nodes: https://docs.unrealengine.com/4.27/en-US/BlueprintAPI/Utilities/Time/

import { makeInNOutFunctionDesc } from '../../../VisualScriptModule'

export const Now = makeInNOutFunctionDesc({
  name: 'flow/time/now',
  label: 'Now',
  out: 'float',
  exec: () => Date.now() / 1000
})

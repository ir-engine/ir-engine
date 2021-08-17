import { GolfBotHookFunctions } from './golfBotHookFunctions'

export const registerGolfBotHooks = () => {
  Object.entries(GolfBotHookFunctions).forEach(([key, func]) => {
    globalThis.botHooks[key] = func
  })
}

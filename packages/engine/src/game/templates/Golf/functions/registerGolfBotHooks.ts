import { GolfBotHookFunctions } from '../../../../bot/functions/golfBotHookFunctions'

export const registerGolfBotHooks = () => {
  Object.entries(GolfBotHookFunctions).forEach(([key, func]) => {
    globalThis.botHooks[key] = func
  })
}

import { HookContext } from '@feathersjs/feathers'

export default (...params: string[]): any => {
  const args = Array.from(params)
  return (hook: HookContext): boolean => {
    return hook.data && args.includes(hook.data.action)
  }
}

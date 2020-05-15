import { Hook, HookContext } from '@feathersjs/feathers'
import bcrypt from 'bcrypt'

export default function (options = {}): Hook {
  return async (context: HookContext) => {
    const { data } = context
    if (data?.password) { data.password = await bcrypt.hash(data.password, 10) }
    return context
  }
}

import { HookContext } from '@feathersjs/feathers'
import crypto from 'crypto'

// This will attach the owner ID in the contact while creating/updating list item
export default () => {
  return (context: HookContext): HookContext => {
    // Getting logged in user and attaching owner of user
    const { data } = context
    data.passcode = crypto.randomBytes(8).toString('hex')

    return context
  }
}

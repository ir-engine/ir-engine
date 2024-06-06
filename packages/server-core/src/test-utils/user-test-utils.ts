import { AvatarType, avatarPath } from '@etherealengine/common/src/schemas/user/avatar.schema'
import { InviteCode, UserName, userPath } from '@etherealengine/common/src/schemas/user/user.schema'
import { Application } from '@etherealengine/server-core/declarations'
import { Paginated } from '@feathersjs/feathers'
import crypto from 'crypto'
import { random } from 'lodash'
import { v1 } from 'uuid'

/**
 * Method to get random avatar id
 * @param app
 * @returns
 */
const getAvatarId = async (app: Application) => {
  const avatars = (await app
    .service(avatarPath)
    .find({ isInternal: true, query: { isPublic: true, $limit: 10 } })) as Paginated<AvatarType>

  return avatars.data[random(avatars.data.length - 1)].id
}

/**
 * Method to create user
 * @param app
 * @returns
 */
export const createUser = async (app: Application) => {
  const avatarId = await getAvatarId(app)
  const code = crypto.randomBytes(4).toString('hex') as InviteCode

  const user = await app.service(userPath).create({
    name: `User ${v1()}` as UserName,
    inviteCode: code,
    avatarId
  })

  return user
}

/**
 * Method used to get user from id
 * @param app
 * @param userId
 * @returns
 */
export const getUser = async (app: Application, userId: string) => {
  const user = await app.service(userPath).get(userId)
  return user
}

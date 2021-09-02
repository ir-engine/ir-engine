import { avatarsFetched } from './actions'
import { client } from '../../../../feathers'
import { Dispatch } from 'redux'

export function fetchAdminAvatars(incDec?: 'increment' | 'decrement') {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    const adminAvatarState = getState().get('adminAvatar').get('avatars')
    const limit = adminAvatarState.get('limit')
    const skip = adminAvatarState.get('skip')
    const avatars = await client.service('static-resource').find({
      query: {
        $select: ['id', 'sid', 'key', 'name', 'url', 'staticResourceType', 'userId'],
        staticResourceType: 'avatar',
        userId: null,
        $limit: limit,
        $skip: incDec === 'increment' ? skip + limit : incDec === 'decrement' ? skip - limit : skip,
        getAvatarThumbnails: true
      }
    })
    dispatch(avatarsFetched(avatars))
  }
}

import { AvatarAction } from './AvatarActions'
import { client } from '../../../../feathers'
import { Dispatch } from 'redux'
import { useAvatarState } from './AvatarState'

export const AvatarService = {
  fetchAdminAvatars: (incDec?: 'increment' | 'decrement') => {
    return async (dispatch: Dispatch): Promise<any> => {
      const adminAvatarState = useAvatarState().avatars
      const limit = adminAvatarState.limit.value
      const skip = adminAvatarState.skip.value
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
      dispatch(AvatarAction.avatarsFetched(avatars))
    }
  }
}

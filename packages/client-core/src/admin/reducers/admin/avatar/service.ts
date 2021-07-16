import { avatarsFetched } from './actions'
import { client } from '../../../../feathers'
import { Dispatch } from 'redux'

export function fetchAdminAvatars() {
  return async (dispatch: Dispatch): Promise<any> => {
    const avatars = await client.service('static-resource').find({
      query: {
        $select: ['id', 'sid', 'key', 'name', 'url', 'staticResourceType', 'userId'],
        staticResourceType: {
          $in: ['avatar', 'user-thumbnail']
        },
        userId: null,
        $limit: 1000
      }
    })
    dispatch(avatarsFetched(avatars))
  }
}

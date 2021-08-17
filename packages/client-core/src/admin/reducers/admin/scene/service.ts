// import { collectionsFetched } from '../../../../world/reducers/scenes/actions'
// import { client } from '../../../../feathers'
// import { Dispatch } from 'redux'

// export function fetchAdminScenes() {
//   return async (dispatch: Dispatch): Promise<any> => {
//     const scenes = await client.service('collection').find({
//       query: {
//         $limit: 100,
//         $sort: {
//           name: -1
//         }
//       }
//     })
//     dispatch(collectionsFetched(scenes))
//   }
// }

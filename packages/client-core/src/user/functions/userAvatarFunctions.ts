import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { client } from '../../feathers'

// export const loadAvatarForUpdatedUser = async (user) => {
//   if (user.instanceId == null && user.channelInstanceId == null) return Promise.resolve(true)

//   const world = useWorld()

//   const networkUser = world?.clients?.get(user.id)
//   console.log('\n\n\n\n\n\nnetworkUser', networkUser)

//   return new Promise(async (resolve) => {
//     const networkUser = world?.clients?.get(user.id)

//     // If network is not initialized then wait to be initialized.
//     if (!networkUser) {
//       setTimeout(async () => {
//         await loadAvatarForUpdatedUser(user)
//         resolve(true)
//       }, 200)
//       return
//     }

//     if (networkUser?.avatarDetail?.avatarURL === user.avatarURL) {
//       resolve(true)
//       return
//     }

//     // Fetch Avatar Resources for updated user.
//     const avatars = await getAvatarResources(user)

//     if (avatars?.data && avatars.data.length === 2) {
//       const avatarURL = avatars?.data[0].staticResourceType === 'avatar' ? avatars?.data[0].url : avatars?.data[1].url
//       const thumbnailURL =
//         avatars?.data[0].staticResourceType === 'user-thumbnail' ? avatars?.data[0].url : avatars?.data[1].url

//       networkUser.avatarDetail = { avatarURL, thumbnailURL }

//       //Find entityId from network objects of updated user and dispatch avatar load event.
//       const world = useWorld()
//       const userEntity = world.getUserAvatarEntity(user.id)
//       setAvatar(userEntity, avatarURL)
//     } else {
//       await loadAvatarForUpdatedUser(user)
//     }
//     resolve(true)
//   })
// }

// TODO
export const loadXRAvatarForUpdatedUser = async (user) => {
  // if (!user || !user.id) Promise.resolve(true)
  // return new Promise(async (resolve) => {
  //   const world = useWorld()
  //   const networkUser = world.clients.get(user.id)
  //   // If network is not initialized then wait to be initialized.
  //   if (!networkUser) {
  //     setTimeout(async () => {
  //       await loadAvatarForUpdatedUser(user)
  //       resolve(true)
  //     }, 200)
  //     return
  //   }
  //   const avatarURL = user.avatarUrl
  //   const thumbnailURL = user.avatarUrl
  //   networkUser.avatarDetail = { avatarURL, thumbnailURL }
  //   //Find entityId from network objects of updated user and dispatch avatar load event.
  //   const userEntity = world.getUserAvatarEntity(user.id)
  //   setAvatar(userEntity, avatarURL)
  //   resolve(true)
  // })
}

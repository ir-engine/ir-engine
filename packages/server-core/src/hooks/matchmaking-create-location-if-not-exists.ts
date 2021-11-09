import { Hook, HookContext } from '@feathersjs/feathers'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, result } = context
    console.log('assignment HOOK!', result)
    const connection = result?.connection
    // context.params.connection
    if (!connection) {
      // throw error?!
      throw new Error('Unexpected response from match finder')
    }
    const locationService = app.service('location') as any
    const locationSettingsService = app.service('location-settings') as any

    try {
      // const locationResult = await locationService.find({
      //   query: {
      //     slugifiedName: connection,
      //     joinableLocations: true
      //   }
      // })
      // console.log('Location found?', locationResult.data)
      // // create
      // if (!locationResult.data[0]) {
      //   console.log('CREATE LOCATION!! ------ ')
      //   await locationService
      //     .create({
      //       name: connection,
      //       // slugifiedName: connection, // 'create' method will autogenerate slugifiedName from name
      //       maxUsersPerInstance: 4, // TODO: get it from assignment?
      //       sceneId: 'j9o2NLiD', // TODO: make scene dependent on type? get it from assignment?
      //       isLobby: false,
      //       location_settings: {
      //         locationType: 'public', // TODO: check other location types
      //         videoEnabled: false,
      //         audioEnabled: false,
      //         instanceMediaChatEnabled: false
      //       }
      //     })
      //     .catch(() => {
      //       // TODO: ignore?
      //     })
      // }
      const locationData = {
        name: 'Random match ' + connection, // TODO: get gamemode from assignment?
        slugifiedName: connection, // 'create' method will autogenerate slugifiedName from name
        maxUsersPerInstance: 4, // TODO: get it from assignment?
        sceneId: 'j9o2NLiD', // TODO: make scene dependent on type? get it from assignment?
        isLobby: false
      }
      const location = await locationService.Model.create(locationData)

      const locationSettingsData = {
        locationId: location.id,
        locationType: 'public', // TODO: check other location types
        videoEnabled: false,
        audioEnabled: false,
        instanceMediaChatEnabled: false
      }
      await locationSettingsService.Model.create(locationSettingsData)
    } catch (e) {
      // TODO: check error? skip?
      console.log('Random location creation failed:', e.errors[0].message)
    }

    return context
  }
}

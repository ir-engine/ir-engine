let client

// @feathersjs/client is exposed as the `feathers` global.
export const getClient = (): any => {
  return client
}

export const setClient = (instanceClient: any): any => {
  console.log('setClient')
  client = instanceClient
  console.log(client.connections)
  console.log(client.service('instance-provision'))

  client.service('instance-provision').on('created', (params) => {
    console.log('instance-provision created listener')
    console.log(params.cool)
  })
}

export const deleteClient = (): any => {
  client = null
}

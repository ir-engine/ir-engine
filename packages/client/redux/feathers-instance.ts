let client

// @feathersjs/client is exposed as the `feathers` global.
export const getClient = (): any => {
  return client
}

export const setClient = (instanceClient: any): any => {
  client = instanceClient
}

export const deleteClient = (): any => {
  client = null
}

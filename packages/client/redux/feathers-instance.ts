let client;

// @feathersjs/client is exposed as the `feathers` global.
export const getClient = (): any => {
  return client;
};

export const setClient = (instanceClient: any): any => {
  client = instanceClient;
  // client.service('instance-provision').on('created', (params) => {
  //   console.log('instance-provision created event received')
  //   console.log(params)
  // })
};

export const deleteClient = (): any => {
  client = null;
};

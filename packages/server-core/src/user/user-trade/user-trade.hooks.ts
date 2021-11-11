import { disallow } from 'feathers-hooks-common'
//import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import { HookContext } from '@feathersjs/feathers'
import * as authentication from '@feathersjs/authentication'
//import app from "../../../../server/src/app"

function processCollectionEntities(usertrade: any): any {
  return usertrade
}

/*
const findRequest = async context => {
  const { data, params } = context
  console.log(data)
  for(let item in data){
    if(item.startsWith('fromInventoryItemId')){
      console.log(item)
      const invData = await app.service("inventory-item").find(data[item])
      console.log(context.data.extra)
      if(context.data.extra == undefined){
        context.data.extra = [invData.data[0]]
      }else{
        context.data.extra.push(invData.data[0])
      }
    }
  }
  return context
};
*/
const { authenticate } = authentication.hooks

export default {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [/*findRequest*/],
    update: [disallow()],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [(context: HookContext): HookContext => {
      context.result = processCollectionEntities(context.result)
      return context
    }],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any

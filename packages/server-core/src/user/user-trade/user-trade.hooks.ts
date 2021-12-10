import { disallow } from 'feathers-hooks-common'
//import addAssociations from '@xrengine/server-core/src/hooks/add-associations'
import { HookContext } from '@feathersjs/feathers'
import * as authentication from '@feathersjs/authentication'
//import app from "../../../../server/src/app"

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
    all: [],
    find: [],
    get: [],
    create: [
      /*findRequest*/
    ],
    update: [disallow()],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [
      (context: HookContext): HookContext => {
        try {
          for (let x = 0; x < context.result.data.length; x++) {
            let data = [...JSON.parse(context.result.data[x].fromUserInventoryIds)]
            context.result.data[x].fromUserInventoryIds = data
          }
        } catch {
          context.result.data[0].fromUserInventoryIds = []
        }
        try {
          for (let x = 0; x < context.result.data.length; x++) {
            let data = [...JSON.parse(context.result.data[x].toUserInventoryIds)]
            context.result.data[x].toUserInventoryIds = data
          }
        } catch {
          context.result.data[0].toUserInventoryIds = []
        }
        return context
      }
    ],
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

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
    all: [authenticate('jwt')],
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
          if (context.result?.data[0]?.fromUserInventoryIds) {
            for (let x = 0; x < context.result.data.length; x++) {
              context.result.data[x].fromUserInventoryIds = JSON.parse(context.result.data[x].fromUserInventoryIds)
              for (let i = 0; i < context.result.data[0].fromUserInventoryIds.length; i++) {
                context.result.data[x].fromUserInventoryIds[i].metadata = JSON.parse(
                  context.result.data[x].fromUserInventoryIds[i].metadata
                )
              }
            }
          } else {
            context.result.data[0].toUserInventoryIds = []
          }
          if (context.result?.data[0]?.toUserInventoryIds) {
            for (let x = 0; x < context.result.data.length; x++) {
              context.result.data[x].toUserInventoryIds = JSON.parse(context.result.data[x].toUserInventoryIds)
              for (let i = 0; i < context.result.data[0].toUserInventoryIds.length; i++) {
                context.result.data[x].toUserInventoryIds[i].metadata = JSON.parse(
                  context.result.data[x].toUserInventoryIds[i].metadata
                )
              }
            }
          } else {
            context.result.data[0].toUserInventoryIds = []
          }
        } catch {
          context.result.data = []
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

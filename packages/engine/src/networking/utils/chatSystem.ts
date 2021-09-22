import { Network } from '../classes/Network'

//updates the client list with the right username for the user
export async function _updateUsername(userId, username) {
  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].userId === userId) {
      Network.instance.clients[p].name = username
      return
    }
  }
}

//checks if a player has subscribed to a chat system
export function hasSubscribedToChatSystem(userId, system: string): boolean {
  if (system === undefined || system === '' || userId === undefined) return false

  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].userId === userId) {
      return Network.instance.clients[p].subscribedChatUpdates.includes(system)
    }
  }

  return false
}
//subscribe a player to a chat system
export function subscribeToChatSystem(userId, system: string) {
  if (system === undefined || system === '' || userId === undefined) return

  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].userId === userId) {
      if (system !== 'all' && !Network.instance.clients[p].subscribedChatUpdates.includes(system)) {
        Network.instance.clients[p].subscribedChatUpdates.push(system)
        return
      } else if (system === 'all') {
        Network.instance.clients[p].subscribedChatUpdates.push('emotions_system')
        Network.instance.clients[p].subscribedChatUpdates.push('jl_system')
        Network.instance.clients[p].subscribedChatUpdates.push('proximity_system')
        //add all chat systems
        return
      }
    }
  }
}
//unsubscribe a player from a chat system
export function unsubscribeFromChatSystem(userId, system: string) {
  if (system === undefined || system === '' || userId === undefined) return

  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].userId === userId) {
      if (system !== 'all' && Network.instance.clients[p].subscribedChatUpdates.includes(system)) {
        Network.instance.clients[p].subscribedChatUpdates.splice(
          Network.instance.clients[p].subscribedChatUpdates.indexOf(system),
          1
        )
        return
      } else if (system === 'all') {
        Network.instance.clients[p].subscribedChatUpdates = []
        return
      }
    }
  }
}
//gets all the systems that a user has subscribed to
export function getSubscribedChatSystems(userId): string[] {
  if (userId === undefined) return undefined

  for (let p in Network.instance.clients) {
    if (Network.instance.clients[p].userId === userId) {
      return Network.instance.clients[p].subscribedChatUpdates
    }
  }

  return undefined
}

//gets the chat system from a chat message
export function getChatMessageSystem(text: string): string {
  if (text.startsWith('[emotions]')) return 'emotions_system'
  else if (text.startsWith('[jl_system]') || text.includes('joined the layer')) return 'jl_system'
  else if (text.startsWith('[proximity')) return 'proximity_system'

  return 'none'
}

//removes the chat system command from a chat message
export function removeMessageSystem(text: string): string {
  return text.substring(text.indexOf(']', 0) + 1)
}

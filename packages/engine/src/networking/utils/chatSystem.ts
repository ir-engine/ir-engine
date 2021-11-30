import { useEngine } from '../../ecs/classes/Engine'

//updates the client list with the right username for the user
export async function _updateUsername(userId, username) {
  for (let [_, client] of useEngine().defaultWorld.clients) {
    if (client.userId === userId) {
      client.name = username
      return
    }
  }
}

//checks if a player has subscribed to a chat system
export function hasSubscribedToChatSystem(userId, system: string): boolean {
  if (system === undefined || system === '' || userId === undefined) return false

  for (let [_, client] of useEngine().defaultWorld.clients) {
    if (client.userId === userId) {
      return client.subscribedChatUpdates.includes(system)
    }
  }

  return false
}
//subscribe a player to a chat system
export function subscribeToChatSystem(userId, system: string) {
  if (system === undefined || system === '' || userId === undefined) return

  for (let [_, client] of useEngine().defaultWorld.clients) {
    if (client.userId === userId) {
      if (system !== 'all' && !client.subscribedChatUpdates.includes(system)) {
        client.subscribedChatUpdates.push(system)
        return
      } else if (system === 'all') {
        client.subscribedChatUpdates.push('emotions_system')
        client.subscribedChatUpdates.push('jl_system')
        client.subscribedChatUpdates.push('proximity_system')
        //add all chat systems
        return
      }
    }
  }
}
//unsubscribe a player from a chat system
export function unsubscribeFromChatSystem(userId, system: string) {
  if (system === undefined || system === '' || userId === undefined) return

  for (let [_, client] of useEngine().defaultWorld.clients) {
    if (client.userId === userId) {
      if (system !== 'all' && client.subscribedChatUpdates.includes(system)) {
        client.subscribedChatUpdates.splice(client.subscribedChatUpdates.indexOf(system), 1)
        return
      } else if (system === 'all') {
        client.subscribedChatUpdates = []
        return
      }
    }
  }
}
//gets all the systems that a user has subscribed to
export function getSubscribedChatSystems(userId): string[] {
  if (userId === undefined) return []

  for (let [_, client] of useEngine().defaultWorld.clients) {
    if (client.userId === userId) {
      return client.subscribedChatUpdates
    }
  }

  return []
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

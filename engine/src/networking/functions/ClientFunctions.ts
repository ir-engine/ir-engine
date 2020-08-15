import { Network as NetworkComponent } from "../components/Network"
import { MessageTypes } from "../enums/MessageTypes"

export function getNearbyClients(): any[] {
  // TODO: InterestManagement!
  return NetworkComponent.instance.clients
}

export function initializeClient(myClientId, allClientIds): void {
  NetworkComponent.instance.mySocketID = myClientId
  console.log("Initialized with socket ID", myClientId)
  if (allClientIds === undefined) return console.log("All IDs are null")
  // for each existing user, add them as a client and add tracks to their peer connection
  for (let i = 0; i < allClientIds.length; i++) addClient(allClientIds[i])
}

export function addClient(_id: string): void {
  if (NetworkComponent.instance.clients.includes(_id)) return console.error("Client is already in client list")
  NetworkComponent.instance.clients.push(_id)
  NetworkComponent.instance.schema.messageHandlers[MessageTypes.ClientConnected].behavior(
    _id,
    _id === NetworkComponent.instance.mySocketID
  ) // args: ID, isLocalPlayer?
}

export function removeClient(_id: string): void {
  // args: ID, isLocalPlayer?
  if (_id in NetworkComponent.instance.clients) {
    NetworkComponent.instance.clients.splice(NetworkComponent.instance.clients.indexOf(_id))
    NetworkComponent.instance.schema.messageHandlers[MessageTypes.ClientDisconnected].behavior(
      _id,
      _id === NetworkComponent.instance.mySocketID
    ) // args: ID, isLocalPlayer?
  } else console.warn("Couldn't remove client because they didn't exist in our list")
}

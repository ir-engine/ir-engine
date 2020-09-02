import { Network as NetworkComponent } from '../components/Network';

export function removeClient(_id: string): void {
  // args: ID, isLocalPlayer?
  if (_id in NetworkComponent.instance.clients[_id] !== undefined) {
    delete NetworkComponent.instance.clients[_id];
    console.log("WARN: Handle remove of prefab")
  }
  else
    console.warn("Couldn't remove client because they didn't exist in our list");
}

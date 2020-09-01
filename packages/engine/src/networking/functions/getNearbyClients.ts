import { Network as NetworkComponent } from '../components/Network';

export function getNearbyClients(): any[] {
  // TODO: InterestManagement!
  return NetworkComponent.instance.clients;
}

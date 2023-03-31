import { Engine } from '../../ecs/classes/Engine'
import { NetworkTopics } from '../classes/Network'
import { JoinWorldProps } from './receiveJoinWorld'

export const receiveJoinMediaServer = (props: JoinWorldProps) => {
  if (!props) return
  const { cachedActions, peerID } = props
  console.log('RECEIVED JOIN MEDIA RESPONSE', cachedActions)

  for (const action of cachedActions) Engine.instance.store.actions.incoming.push({ ...action, $fromCache: true })

  Engine.instance.mediaNetworkState.peerID.set(peerID)

  Engine.instance.store.actions.outgoing[NetworkTopics.media].queue.push(
    ...Engine.instance.store.actions.outgoing[NetworkTopics.media].history
  )
}

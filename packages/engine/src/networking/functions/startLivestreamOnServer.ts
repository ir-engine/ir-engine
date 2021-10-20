import { Entity } from '../../ecs/classes/Entity'
import Twitch from 'twitch-m3u8'
// import { getComponent } from '../../ecs/functions/ComponentFunctions'
// import LivestreamProxyComponent from '../../scene/components/LivestreamProxyComponent'

export const startLivestreamOnServer = async (entity: Entity): Promise<void> => {
  // const livestreamProxyComponent = getComponent(entity, LivestreamProxyComponent)
  try {
    const dataStream = await Twitch.getStream('hexafield', true)
    console.log('startLivestreamOnServer dataStream', dataStream)
  } catch (e) {
    // console.error('Failed to get livestream!', e, livestreamProxyComponent.src)
  }
}

import { Network } from '../classes/Network'

export function checkIfIdHavePrepair(uniqueId) {
  return (
    Object.keys(Network.instance.networkObjects)
      .map(Number)
      .reduce(
        (result, key) => (Network.instance.networkObjects[key]?.uniqueId === uniqueId ? (result = key) : result),
        null
      ) ?? Network.getNetworkId()
  )
}

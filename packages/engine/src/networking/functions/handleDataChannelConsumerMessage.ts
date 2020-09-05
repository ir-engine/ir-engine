import { DataConsumer } from 'mediasoup-client/lib/types'

export const handleDataChannelConsumerMessage = (
  dataConsumer: DataConsumer
) => (message: any) => {
  // If Data is anything other than string then parse it else just use message directly
  // as it is probably not a json object string
  let data
  try {
    data = JSON.parse(message)
  } catch (e) {
    data = message
  }
  // switch on channel, probably use sort of an enums just like MessageTypes for the cases
  switch (dataConsumer.label) {
    // example
    // case 'physics'
    // DO STUFF
    // case 'location'
    // DO STUFF
    case 'default':
      // DO STUFF ON DEFAULT CHANNEL HERE
      console.warn('Default Channel got unreliable message on it!', data)
      break
    default:
      console.warn(
        `Unreliable Message received on ${dataConsumer.label} channel: `,
        data
      )
  }
}

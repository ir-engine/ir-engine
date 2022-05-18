import SocketIO from 'socket.io'

export interface Client {
  socket: SocketIO.Socket
  lastSeenTs: number
  joinTs: number
  media: any
  consumerLayers: any
  stats: any
}

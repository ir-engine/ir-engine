const MessageTypes = {
  Heartbeat: 0,
  ConnectionRequest: 1,
  ClientConnected: 2,
  DisconnectionRequest: 3,
  ClientDisconnected: 4,
  InitializationRequest: 5,
  InitializationResponse: 6,
  SynchronizationRequest: 7,
  JoinWorldRequest: 8,
  LeaveWorldRequest: 9,
  WebRTCTransportCreateRequest: 9,
  WebRTCTransportConnectRequest: 10,
  WebRTCTransportCloseRequest: 11,
  WebRTCSendTrackRequest: 12,
  WebRTCReceiveTrackRequest: 13,
  WebRTCPauseConsumerRequest: 14,
  WebRTCResumeConsumerRequest: 15,
  WebRTCCloseConsumerRequest: 16,
  WebRTCPauseProducerRequest: 17,
  WebRTCResumeProducerRequest: 18,
  WebRTCCloseProducerRequest: 19,
  WebRTCMuteOtherProducerRequest: 20,
  WebRTCUnmuteOtherProducerRequest: 21,
  WebRTCConsumerSetLayersRequest: 22
}

export default MessageTypes

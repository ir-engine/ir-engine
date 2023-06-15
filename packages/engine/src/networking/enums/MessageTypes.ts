/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

/** Network Message Types. */
export enum MessageTypes {
  Heartbeat = 0,
  ClientConnected = 1,
  ClientDisconnected = 2,
  Initialization = 3,
  JoinWorld = 4,
  LeaveWorld = 5,
  UpdatePeers = 6,
  WebRTCTransportCreate = 7,
  WebRTCTransportConnect = 8,
  WebRTCTransportClose = 9,
  WebRTCSendTrack = 10,
  WebRTCReceiveTrack = 11,
  WebRTCPauseConsumer = 12,
  WebRTCResumeConsumer = 13,
  WebRTCCloseConsumer = 14,
  WebRTCPauseProducer = 15,
  WebRTCResumeProducer = 16,
  WebRTCCloseProducer = 17,
  WebRTCMuteOtherProducer = 18,
  WebRTCUnmuteOtherProducer = 19,
  WebRTCConsumerSetLayers = 20,
  WebRTCConsumeData = 21,
  WebRTCProduceData = 22,
  ReliableMessage = 23,
  WebRTCCreateProducer = 24,
  Authorization = 25,
  Kick = 26,
  WebRTCRequestCurrentProducers = 29,
  InitializeRouter = 31,
  ActionData = 42
}

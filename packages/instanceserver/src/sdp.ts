// const getCodecInfoFromRtpParameters = (kind, rtpParameters) => {
//     return {
//       payloadType: rtpParameters.codecs[0].payloadType,
//       codecName: rtpParameters.codecs[0].mimeType.replace(`${kind}/`, ''),
//       clockRate: rtpParameters.codecs[0].clockRate,
//       channels: kind === 'audio' ? rtpParameters.codecs[0].channels : undefined
//     };
//   };

// // File to create SDP text from mediasoup RTP Parameters
// export const createSdpText = (rtpParameters) => {
//   const { video, audio } = rtpParameters;

//   // Video codec info
//   const videoCodecInfo = getCodecInfoFromRtpParameters('video', video.rtpParameters);

//   // Audio codec info
//   const audioCodecInfo = getCodecInfoFromRtpParameters('audio', audio.rtpParameters);

//   return `v=0
//   o=- 0 0 IN IP4 127.0.0.1
//   s=FFmpeg
//   c=IN IP4 127.0.0.1
//   t=0 0
//   m=video ${video.remoteRtpPort} RTP/AVP ${videoCodecInfo.payloadType}
//   a=rtpmap:${videoCodecInfo.payloadType} ${videoCodecInfo.codecName}/${videoCodecInfo.clockRate}
//   a=sendonly
//   m=audio ${audio.remoteRtpPort} RTP/AVP ${audioCodecInfo.payloadType}
//   a=rtpmap:${audioCodecInfo.payloadType} ${audioCodecInfo.codecName}/${audioCodecInfo.clockRate}/${audioCodecInfo.channels}
//   a=sendonly
//   `;
// };

import { onStartRecording, onStopRecording } from './ServerRecordingSystem'
import { handleWebRtcReceiveTrack } from './WebRTCFunctions'
import CONFIG from "./config";
import MediasoupClient from "mediasoup-client";
import SocketClient from "socket.io-client";
const SocketPromise = require("socket.io-promise").default;

const global = {
  server: {
    socket: null,
  },

  mediasoup: {
    device: null,

    webrtc: {
      transport: null,
      audioProducer: null,
      videoProducer: null,
    },
  },

  recording: {
    waitForAudio: false,
    waitForVideo: false,
  },
};


async function startWebrtcSend() {
  const device:any = global.mediasoup.device;
  const socket:any = global.server.socket;

  // mediasoup WebRTC transport


  const socketRequest = SocketPromise(socket);
  const response = await socketRequest({ type: "WEBRTC_RECV_START" });
  const webrtcTransportOptions = response.data;

  console.log("[server] WebRTC RECV transport created");

  let transport;
  try {
    transport = device.createSendTransport(webrtcTransportOptions);
  } catch (err) {
    console.error(err);
    return;
  }
  global.mediasoup.webrtc.transport = transport;

  console.log("[client] WebRTC SEND transport created");

  // "connect" is emitted upon the first call to transport.produce()
  transport.on("connect", ({ dtlsParameters }, callback, _errback) => {
    // Signal local DTLS parameters to the server side transport
    socket.emit("WEBRTC_RECV_CONNECT", dtlsParameters);
    callback();
  });

  // "produce" is emitted upon each call to transport.produce()
  transport.on("produce", (produceParameters, callback, _errback) => {
    socket.emit("WEBRTC_RECV_PRODUCE", produceParameters, (producerId) => {
      console.log("[server] WebRTC RECV producer created");
      callback({ producerId });
    });
  });

  // mediasoup WebRTC producer
  // Getting user media as required

  const uiMedia = (document.querySelector("input[name='uiMedia']:checked")as HTMLInputElement)?.value;

  let useAudio = false;
  let useVideo = false;
  if (uiMedia.indexOf("audio") !== -1) {
    useAudio = true;
    global.recording.waitForAudio = true;
  }
  if (uiMedia.indexOf("video") !== -1) {
    useVideo = true;
    global.recording.waitForVideo = true;
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: useAudio,
      video: useVideo,
    });
  } catch (err) {
    console.error(err);
    return;
  }

  ui.localVideo.srcObject= stream;

  // Start mediasoup-client's WebRTC producer(s)

  if (useAudio) {
    const audioTrack = stream.getAudioTracks()[0];
    const audioProducer = await transport.produce({ track: audioTrack });
    global.mediasoup.webrtc.audioProducer = audioProducer;
  }

  if (useVideo) {
    const videoTrack = stream.getVideoTracks()[0];
    const videoProducer = await transport.produce({
      track: videoTrack,
      ...CONFIG.mediasoup.client.videoProducer,
    });
    global.mediasoup.webrtc.videoProducer = videoProducer;
  }
}

function startRecording():any {
  const uiRecorder = (document.querySelector("input[name='uiRecorder']:checked")as HTMLInputElement).value;
  console.log("START_RECORDING", uiRecorder);

}

function stopRecording():any {
  console.log("STOP_RECORDING");

}

// HTML UI elements

async function startMediasoup():Promise<undefined> {
  const socket = global.server.socket;

  const socketRequest = SocketPromise(socket);
  const uiVCodecName = (document.querySelector(
    "input[name='uiVCodecName']:checked"
  )as HTMLInputElement).value;
  const response = await socketRequest({
    type: "START_MEDIASOUP",
    vCodecName: uiVCodecName,
  });
  const routerRtpCapabilities = response.data;

  console.log("[server] mediasoup router created");

  let device:any = null;
  try {
    device = new MediasoupClient.Device();
  } catch (err) {
    console.error(err);
    return;
  }
  global.mediasoup.device = device;

  try {
    await device.load({ routerRtpCapabilities });
  } catch (err) {
    console.error(err);
    return;
  }

  console.log(
    "mediasoup device created, handlerName: %s, use audio: %s, use video: %s",
    device.handlerName,
    device.canProduce("audio"),
    device.canProduce("video")
  );

  console.log("rtpCapabilities:\n%O", device.rtpCapabilities);
}

async function startWebRTC() {
  console.log("Start WebRTC transmission from browser to mediasoup");

  await startMediasoup();
  await startWebrtcSend();
}

const ui = {
  console: document.getElementById("uiConsole"),
  // <button>
  startWebRTC: handleWebRtcReceiveTrack,
  startRecording: onStartRecording,
  stopRecording: onStopRecording,

  // <video>
  localVideo: (document.getElementById("uiLocalVideo") as HTMLMediaElement),
};

ui.startWebRTC = startWebRTC;
ui.startRecording = startRecording;
ui.stopRecording = stopRecording;

window.addEventListener("load", function () {
  console.log("Page loaded, connect WebSocket");
  connectSocket();

  if ("adapter" in window) {
    console.log("Adapter code not working");
  } else {
    console.warn("webrtc-adapter is not loaded! an install or config issue?");
  }
});

window.addEventListener("beforeunload", function () {
  console.log("Page unloading, close WebSocket");
});
// ----

function connectSocket() {
  const serverUrl = `https://${window.location.host}`;

  console.log("Connect with Application Server:", serverUrl);

  const socket = SocketClient(serverUrl, {
    path: CONFIG.https.wsPath,
    transports: ["websocket"],
  });
  global.server.socket = socket;

  socket.on("connect", () => {
    console.log("WebSocket connected");
  });

  socket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  socket.on("WEBRTC_RECV_PRODUCER_READY", (kind) => {
    console.log(`Server producer is ready, kind: ${kind}`);
    switch (kind) {
      case "audio":
        global.recording.waitForAudio = false;
        break;
      case "video":
        global.recording.waitForVideo = false;
        break;
    }
  });
}
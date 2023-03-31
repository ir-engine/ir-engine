import * as Config from "./config"
import FFmpegStatic from "ffmpeg-static"
import Express from "express"
import Fs from "fs";
import Https from "https";
import Mediasoup from "mediasoup";
import SocketServer from "socket.io";
const Socketserver = (SocketServer as any)
import Process from "child_process";
import Util from "util";

const global:any = {
  server: {
    expressApp: null,
    https: null,
    socket: null,
    socketServer: null,
  },

  mediasoup: {
    worker: null,
    router: null,

    // WebRTC connection with the browser
    webrtc: {
      recvTransport: null,
      audioProducer: null,
      videoProducer: null,
    },

    // RTP connection with recording process
    rtp: {
      audioTransport: null,
      audioConsumer: null,
      videoTransport: null,
      videoConsumer: null,
    },
  },

  recProcess: null,
};

// Sending all logging to both console and WebSocket
for (const name of ["log", "info", "warn", "error"]) {
  const method = console[name];
  console[name] = function (...args) {
    method(...args);
    if (global.server.socket) {
      global.server.socket.emit("LOG", Util.format(...args));
    }
  };
}

// Creating HTTPS server
{
  const expressApp = Express();
  global.server.expressApp = expressApp;
  expressApp.use("/", Express.static(__dirname));

  const https = Https.createServer(
    {
      cert: Fs.readFileSync(Config.default.https.cert),
      key: Fs.readFileSync(Config.default.https.certKey),
    },
    expressApp
  );
  global.server.https = https;

  https.on("listening", () => {
    console.log(
      `Web server is listening on https://localhost:${Config.default.https.port}`
    );
  });
  https.on("error", (err) => {
    console.error("HTTPS error:", err.message);
  });
  https.on("tlsClientError", (err) => {
    if (err.message.includes("alert number 46")) {
      // Ignore: this is the client browser rejecting our self-signed certificate
    } else {
      console.error("TLS error:", err);
    }
  });
  https.listen(Config.default.https.port);
}

// Creating WebSocket server
{
  const socketServer = Socketserver(global.server.https, {
    path: Config.default.https.wsPath,
    serveClient: false,
    pingTimeout: Config.default.https.wsPingTimeout,
    pingInterval: Config.default.https.wsPingInterval,
    transports: ["websocket"],
  });
  global.server.socketServer = socketServer;

  socketServer.on("connect", (socket) => {
    console.log(
      "WebSocket server connected, port: %s",
      socket.request.connection.remotePort
    );
    global.server.socket = socket;

    // Events sent by the client's "socket.io-promise" have the fixed name
    // "request", and a field "type" that we use as identifier
    socket.on("request", handleRequest);

    // Events sent by the client's "socket.io-client" have a name
    // that we use as identifier
    socket.on("WEBRTC_RECV_CONNECT", handleWebrtcRecvConnect);
    socket.on("WEBRTC_RECV_PRODUCE", handleWebrtcRecvProduce);
    socket.on("START_RECORDING", handleStartRecording);
    socket.on("STOP_RECORDING", handleStopRecording);
  });
}

async function handleRequest(request, callback) {
  let responseData:any = null;

  switch (request.type) {
    case "START_MEDIASOUP":
      responseData = await handleStartMediasoup(request.vCodecName);
      break;
    case "WEBRTC_RECV_START":
      responseData = await handleWebrtcRecvStart();
      break;
    default:
      console.warn("Invalid request type:", request.type);
      break;
  }

  callback({ type: request.type, data: responseData });
}

// Util functions
function audioEnabled() {
  return global.mediasoup.webrtc.audioProducer !== null;
}

function videoEnabled() {
  return global.mediasoup.webrtc.videoProducer !== null;
}

function h264Enabled() {
  const codec = global.mediasoup.router.rtpCapabilities.codecs.find(
    (c) => c.mimeType === "video/H264"
  );
  return codec !== undefined;
}

// ----------------------------------------------------------------------------

/*
 * Creating a mediasoup worker and router.
 * vCodecName: One of "VP8", "H264".
 */
async function handleStartMediasoup(vCodecName) {
  const worker: any = await Mediasoup.createWorker(Config.default.mediasoup.worker as any);
  global.mediasoup.worker = worker;

  worker.on("died", () => {
    console.error(
      "mediasoup worker died, exit in 3 seconds... [pid:%d]",
      worker.pid
    );
    setTimeout(() => process.exit(1), 3000);
  });

  console.log("mediasoup worker created [pid:%d]", worker.pid);

  // Building a RouterOptions based on 'CONFIG.mediasoup.router' and the
  // requested 'vCodecName'
  const routerOptions:any = {
    mediaCodecs: [],
  };

  const audioCodec = Config.default.mediasoup.router.mediaCodecs.find(
    (c) => c.mimeType === "audio/opus"
  );
  if (!audioCodec) {
    console.error("Undefined codec mime type: audio/opus -- Check config.js");
    process.exit(1);
  }
  routerOptions.mediaCodecs.push(audioCodec);

  const videoCodec = Config.default.mediasoup.router.mediaCodecs.find(
    (c) => c.mimeType === `video/${vCodecName}`
  );
  if (!videoCodec) {
    console.error(
      `Undefined codec mime type: video/${vCodecName} -- Check config.js`
    );
    process.exit(1);
  }
  routerOptions.mediaCodecs.push(videoCodec);

  let router;
  try {
    router = await worker.createRouter(routerOptions);
  } catch (err) {
    console.error("BUG:", err);
    process.exit(1);
  }
  global.mediasoup.router = router;

  // At this point, the computed "router.rtpCapabilities" includes the
  // router codecs enhanced with retransmission and RTCP capabilities,
  // and the list of RTP header extensions supported by mediasoup.

  console.log("mediasoup router created");

  console.log("mediasoup router RtpCapabilities:\n%O", router.rtpCapabilities);

  return router.rtpCapabilities;
}

// Creating a mediasoup WebRTC RECV transport

async function handleWebrtcRecvStart() {
  const router = global.mediasoup.router;

  const transport = await router.createWebRtcTransport(
    Config.default.mediasoup.webrtcTransport
  );
  global.mediasoup.webrtc.recvTransport = transport;

  console.log("mediasoup WebRTC RECV transport created");

  const webrtcTransportOptions = {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
    sctpParameters: transport.sctpParameters,
  };

  console.log(
    "mediasoup WebRTC RECV TransportOptions:\n%O",
    webrtcTransportOptions
  );

  return webrtcTransportOptions;
}

// Calls WebRtcTransport.connect() whenever the browser client part is ready

async function handleWebrtcRecvConnect(dtlsParameters) {
  const transport = global.mediasoup.webrtc.recvTransport;

  await transport.connect({ dtlsParameters });

  console.log("mediasoup WebRTC RECV transport connected");
}

// Calls WebRtcTransport.produce() to start receiving media from the browser

async function handleWebrtcRecvProduce(produceParameters, callback) {
  const transport = global.mediasoup.webrtc.recvTransport;

  const producer = await transport.produce(produceParameters);
  switch (producer.kind) {
    case "audio":
      global.mediasoup.webrtc.audioProducer = producer;
      break;
    case "video":
      global.mediasoup.webrtc.videoProducer = producer;
      break;
  }

  global.server.socket.emit("WEBRTC_RECV_PRODUCER_READY", producer.kind);

  console.log(
    "mediasoup WebRTC RECV producer created, kind: %s, type: %s, paused: %s",
    producer.kind,
    producer.type,
    producer.paused
  );

  console.log(
    "mediasoup WebRTC RECV producer RtpParameters:\n%O",
    producer.rtpParameters
  );

  callback(producer.id);
}

async function handleStartRecording(recorder) {
  const router = global.mediasoup.router;

  const useAudio = audioEnabled();
  const useVideo = videoEnabled();

  // Start mediasoup's RTP consumer(s)

  if (useAudio) {
    const rtpTransport = await router.createPlainTransport({
      // No RTP will be received from the remote side
      comedia: false,

      // FFmpeg don't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
      rtcpMux: false,

      ...Config.default.mediasoup.plainTransport,
    });
    global.mediasoup.rtp.audioTransport = rtpTransport;

    await rtpTransport.connect({
      ip: Config.default.mediasoup.recording.ip,
      port: Config.default.mediasoup.recording.audioPort,
      rtcpPort: Config.default.mediasoup.recording.audioPortRtcp,
    });

    console.log(
      "mediasoup AUDIO RTP SEND transport connected: %s:%d <--> %s:%d (%s)",
      rtpTransport.tuple.localIp,
      rtpTransport.tuple.localPort,
      rtpTransport.tuple.remoteIp,
      rtpTransport.tuple.remotePort,
      rtpTransport.tuple.protocol
    );

    console.log(
      "mediasoup AUDIO RTCP SEND transport connected: %s:%d <--> %s:%d (%s)",
      rtpTransport.rtcpTuple.localIp,
      rtpTransport.rtcpTuple.localPort,
      rtpTransport.rtcpTuple.remoteIp,
      rtpTransport.rtcpTuple.remotePort,
      rtpTransport.rtcpTuple.protocol
    );

    const rtpConsumer = await rtpTransport.consume({
      producerId: global.mediasoup.webrtc.audioProducer.id,
      rtpCapabilities: router.rtpCapabilities, // Assume the recorder supports same formats as mediasoup's router
      paused: true,
    });
    global.mediasoup.rtp.audioConsumer = rtpConsumer;

    console.log(
      "mediasoup AUDIO RTP SEND consumer created, kind: %s, type: %s, paused: %s, SSRC: %s CNAME: %s",
      rtpConsumer.kind,
      rtpConsumer.type,
      rtpConsumer.paused,
      rtpConsumer.rtpParameters.encodings[0].ssrc,
      rtpConsumer.rtpParameters.rtcp.cname
    );
  }

  if (useVideo) {
    const rtpTransport = await router.createPlainTransport({
      // No RTP will be received from the remote side
      comedia: false,

      // FFmpeg don't support RTP/RTCP multiplexing ("a=rtcp-mux" in SDP)
      rtcpMux: false,

      ...Config.default.mediasoup.plainTransport,
    });
    global.mediasoup.rtp.videoTransport = rtpTransport;

    await rtpTransport.connect({
      ip: Config.default.mediasoup.recording.ip,
      port: Config.default.mediasoup.recording.videoPort,
      rtcpPort: Config.default.mediasoup.recording.videoPortRtcp,
    });

    console.log(
      "mediasoup VIDEO RTP SEND transport connected: %s:%d <--> %s:%d (%s)",
      rtpTransport.tuple.localIp,
      rtpTransport.tuple.localPort,
      rtpTransport.tuple.remoteIp,
      rtpTransport.tuple.remotePort,
      rtpTransport.tuple.protocol
    );

    console.log(
      "mediasoup VIDEO RTCP SEND transport connected: %s:%d <--> %s:%d (%s)",
      rtpTransport.rtcpTuple.localIp,
      rtpTransport.rtcpTuple.localPort,
      rtpTransport.rtcpTuple.remoteIp,
      rtpTransport.rtcpTuple.remotePort,
      rtpTransport.rtcpTuple.protocol
    );

    const rtpConsumer = await rtpTransport.consume({
      producerId: global.mediasoup.webrtc.videoProducer.id,
      rtpCapabilities: router.rtpCapabilities, // Assume the recorder supports same formats as mediasoup's router
      paused: true,
    });
    global.mediasoup.rtp.videoConsumer = rtpConsumer;

    console.log(
      "mediasoup VIDEO RTP SEND consumer created, kind: %s, type: %s, paused: %s, SSRC: %s CNAME: %s",
      rtpConsumer.kind,
      rtpConsumer.type,
      rtpConsumer.paused,
      rtpConsumer.rtpParameters.encodings[0].ssrc,
      rtpConsumer.rtpParameters.rtcp.cname
    );
  }

  switch (recorder) {
    case "ffmpeg":
      await startRecordingFfmpeg();
      break;
    case "external":
      await startRecordingExternal();
      break;
    default:
      console.warn("Invalid recorder:", recorder);
      break;
  }

  if (useAudio) {
    const consumer = global.mediasoup.rtp.audioConsumer;
    console.log(
      "Resume mediasoup RTP consumer, kind: %s, type: %s",
      consumer.kind,
      consumer.type
    );
    consumer.resume();
  }
  if (useVideo) {
    const consumer = global.mediasoup.rtp.videoConsumer;
    console.log(
      "Resume mediasoup RTP consumer, kind: %s, type: %s",
      consumer.kind,
      consumer.type
    );
    consumer.resume();
  }
}

// ----

/* FFmpeg recording
 * ================
 *
 * The intention here is to record the RTP stream as is received from
 * the media server, i.e. WITHOUT TRANSCODING. Hence the "codec copy"
 * commands in FFmpeg.
 *
 * ffmpeg \
 *     -nostdin \
 *     -protocol_whitelist file,rtp,udp \
 *     -fflags +genpts \
 *     -i recording/input-vp8.sdp \
 *     -map 0:a:0 -c:a copy -map 0:v:0 -c:v copy \
 *     -f webm -flags +global_header \
 *     -y recording/output-ffmpeg-vp8.webm
 *
 * NOTES:
 *
 * '-map 0:x:0' ensures that one media of each type is used.
 *
 * FFmpeg 2.x (Ubuntu 16.04 "Xenial") does not support the option
 * "protocol_whitelist", but it is mandatory for FFmpeg 4.x (newer systems).
 */
function startRecordingFfmpeg() {
  // Return a Promise that can be awaited
  let recResolve;
  const promise = new Promise((res, _rej) => {
    recResolve = res;
  });

  const useAudio = audioEnabled();
  const useVideo = videoEnabled();
  const useH264 = h264Enabled();

  // const cmdProgram = "ffmpeg"; // Found through $PATH
  const cmdProgram:any = FFmpegStatic; // From package "ffmpeg-static"

  let cmdInputPath = `${__dirname}/recording/input-vp8.sdp`;
  let cmdOutputPath = `${__dirname}/recording/output-ffmpeg-vp8.webm`;
  let cmdCodec = "";
  let cmdFormat = "-f webm -flags +global_header";

  // Ensure correct FFmpeg version is installed
  const ffmpegOut = Process.execSync(cmdProgram + " -version", {
    encoding: "utf8",
  });
  const ffmpegVerMatch = /ffmpeg version (\d+)\.(\d+)\.(\d+)/.exec(ffmpegOut);
  let ffmpegOk = false;
  if (ffmpegOut.startsWith("ffmpeg version git")) {
    // Accept any Git build (it's up to the developer to ensure that a recent
    // enough version of the FFmpeg source code has been built)
    ffmpegOk = true;
  } else if (ffmpegVerMatch) {
    const ffmpegVerMajor = parseInt(ffmpegVerMatch[1], 10);
    if (ffmpegVerMajor >= 4) {
      ffmpegOk = true;
    }
  }

  if (!ffmpegOk) {
    console.error("FFmpeg >= 4.0.0 not found in $PATH; please install it");
    process.exit(1);
  }

  if (useAudio) {
    cmdCodec += " -map 0:a:0 -c:a copy";
  }
  if (useVideo) {
    cmdCodec += " -map 0:v:0 -c:v copy";

    if (useH264) {
      cmdInputPath = `${__dirname}/recording/input-h264.sdp`;
      cmdOutputPath = `${__dirname}/recording/output-ffmpeg-h264.mp4`;

      // "-strict experimental" is required to allow storing
      // OPUS audio into MP4 container
      cmdFormat = "-f mp4 -strict experimental";
    }
  }

  // Run process
  const cmdArgStr = [
    "-nostdin",
    "-protocol_whitelist file,rtp,udp",
    "-fflags +genpts",
    `-i ${cmdInputPath}`,
    cmdCodec,
    cmdFormat,
    `-y ${cmdOutputPath}`,
  ]
    .join(" ")
    .trim();

  console.log(`Run command: ${cmdProgram} ${cmdArgStr}`);

  let recProcess = Process.spawn(cmdProgram, cmdArgStr.split(/\s+/));
  global.recProcess = recProcess;

  recProcess.on("error", (err) => {
    console.error("Recording process error:", err);
  });

  recProcess.on("exit", (code, signal) => {
    console.log("Recording process exit, code: %d, signal: %s", code, signal);

    global.recProcess = null;
    stopMediasoupRtp();

    if (!signal || signal === "SIGINT") {
      console.log("Recording stopped");
    } else {
      console.warn(
        "Recording process didn't exit cleanly, output file might be corrupt"
      );
    }
  });

  // FFmpeg writes its logs to stderr
  recProcess.stderr.on("data", (chunk) => {
    chunk
      .toString()
      .split(/\r?\n/g)
      .filter(Boolean) // Filter out empty strings
      .forEach((line) => {
        console.log(line);
        if (line.startsWith("ffmpeg version")) {
          setTimeout(() => {
            recResolve();
          }, 1000);
        }
      });
  });

  return promise;
}

async function startRecordingExternal() {
  // Return a Promise that can be awaited
  let resolve;
  const promise = new Promise((res, _rej) => {
    resolve = res;
  });

  // Countdown to let the user start the external process
  const timeout = 10;
  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  for (let time = timeout; time > 0; time--) {
    console.log(`Recording starts in ${time} seconds...`);

    await sleep(1000);
  }

  resolve();

  return promise;
}

// ----------------------------------------------------------------------------

async function handleStopRecording() {
  if (global.recProcess) {
    global.recProcess.kill("SIGINT");
  } else {
    stopMediasoupRtp();
  }
}

// ----

function stopMediasoupRtp() {
  console.log("Stop mediasoup RTP transport and consumer");

  const useAudio = audioEnabled();
  const useVideo = videoEnabled();

  if (useAudio) {
    global.mediasoup.rtp.audioConsumer.close();
    global.mediasoup.rtp.audioTransport.close();
  }

  if (useVideo) {
    global.mediasoup.rtp.videoConsumer.close();
    global.mediasoup.rtp.videoTransport.close();
  }
}

export {};
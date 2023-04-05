// // import * as Config from "./config"
// // import FFmpegStatic from "ffmpeg-static"
// // import { Readable } from 'stream'
// // import { EventEmitter } from 'events'
// // import { createSdpText } from './sdp'
// import { startWebRTC } from './WebRTCFunctions'
// import fs from "fs";
// import * as childProcess from "child_process";
// import { sendCurrentProducers } from "./WebRTCFunctions";

// // const RECORD_FILE_LOCATION_PATH = '/home/utsav/etherealengine/packages/instanceserver/src/recording'

// const { routers } = await startWebRTC()

// const transport = routers.createPlainTransport({ listenIp: "0.0.0.0" });

// const fileStream = fs.createWriteStream("./output.mp4");

// const ffmpegProcess = childProcess.spawn("ffmpeg", [
//   "-hide_banner",
//   "-protocol_whitelist",
//   "pipe,udp,rtp,file,crypto",
//   "-f",
//   "rawvideo",
//   "-pix_fmt",
//   "yuv420p",
//   "-s",
//   "640x480",
//   "-i",
//   "-",
//   "-c:v",
//   "libx264",
//   "-b:v",
//   "1000k",
//   "-f",
//   "mpegts",
//   `rtp://127.0.0.1:${transport.tuple.localPort}?pkt_size=1200`,
// ]);

// const consumer = await transport.consume({ sendCurrentProducers });

// consumer.on("transportclose", () => {
//   ffmpegProcess.kill("SIGINT");
// });

// consumer.pipe(fileStream);
// consumer.pipe(ffmpegProcess.stdin);

// ffmpegProcess.stderr.on("data", (data) => {
//   console.error(`ffmpeg stderr: ${data}`);
// });

// ffmpegProcess.on("exit", (code, signal) => {
//   console.log(`ffmpeg process exited with code ${code} and signal ${signal}`);
// });

// // const convertStringToStream = (stringToConvert:string) => {
// //   const stream = new Readable();
// //   stream._read = () => {};
// //   stream.push(stringToConvert);
// //   stream.push(null);

// //   return stream;
// // };

// // export class FFmpeg {
// //   _rtpParameters: any;
// //   _process: undefined;
// //   _observer: EventEmitter;
// //   constructor (rtpParameters) {
// //     this._rtpParameters = rtpParameters;
// //     this._process = undefined;
// //     this._observer = new EventEmitter();
// //     this._createProcess();
// //   }

// //   _createProcess () {
// //     const sdpString = createSdpText(this._rtpParameters);
// //     const sdpStream = convertStringToStream(sdpString);

// //     console.log('createProcess() [sdpString:%s]', sdpString);

// //     this._process = child_process.spawn('ffmpeg', this._commandArgs);

// //     if (this._process.stderr) {
// //       this._process.stderr.setEncoding('utf-8');

// //       this._process.stderr.on('data', data =>
// //         console.log('ffmpeg::process::data [data:%o]', data)
// //       );
// //     }

// //     if (this._process.stdout) {
// //       this._process.stdout.setEncoding('utf-8');

// //       this._process.stdout.on('data', data =>
// //         console.log('ffmpeg::process::data [data:%o]', data)
// //       );
// //     }

// //     this._process.on('message', message =>
// //       console.log('ffmpeg::process::message [message:%o]', message)
// //     );

// //     this._process.on('error', error =>
// //       console.error('ffmpeg::process::error [error:%o]', error)
// //     );

// //     this._process.once('close', () => {
// //       console.log('ffmpeg::process::close');
// //       this._observer.emit('process-close');
// //     });

// //     sdpStream.on('error', error =>
// //       console.error('sdpStream::error [error:%o]', error)
// //     );

// //     // Pipe sdp stream to the ffmpeg process
// //     sdpStream.resume();
// //     sdpStream.pipe(this._process.stdin);
// //   }

// //   kill () {
// //     console.log('kill() [pid:%d]', this._process.pid);
// //     this._process.kill('SIGINT');
// //   }

// //   get _commandArgs () {
// //     let commandArgs = [
// //       '-loglevel',
// //       'debug',
// //       '-protocol_whitelist',
// //       'pipe,udp,rtp',
// //       '-fflags',
// //       '+genpts',
// //       '-f',
// //       'sdp',
// //       '-i',
// //       'pipe:0'
// //     ];

// //     commandArgs = commandArgs.concat(this._videoArgs);
// //     commandArgs = commandArgs.concat(this._audioArgs);

// //     commandArgs = commandArgs.concat([
// //       /*
// //       '-flags',
// //       '+global_header',
// //       */
// //       `${RECORD_FILE_LOCATION_PATH}/${this._rtpParameters.fileName}.webm`
// //     ]);

// //     console.log('commandArgs:%o', commandArgs);

// //     return commandArgs;
// //   }

// //   get _videoArgs () {
// //     return [
// //       '-map',
// //       '0:v:0',
// //       '-c:v',
// //       'copy'
// //     ];
// //   }

// //   get _audioArgs () {
// //     return [
// //       '-map',
// //       '0:a:0',
// //       '-strict', // libvorbis is experimental
// //       '-2',
// //       '-c:a',
// //       'copy'
// //     ];
// //   }
// // }

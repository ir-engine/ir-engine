import { WebPlugin, registerWebPlugin } from '@capacitor/core';
import { XRFrameData, XRPluginPlugin, CameraOptions, VideoEditorOptions, VideoEditorThumbnailProperties, VideoEditorTranscodeProperties, VideoEditorTrimProperties } from './definitions';

export class XRPluginWeb extends WebPlugin implements XRPluginPlugin {
  constructor() {
    super({
      name: 'XRPlugin',
      platforms: ['web'],
    });
  }

  async initialize(options: {}): Promise<{ status: string }> {
    console.log("Initialize called to plugin on web");
    return new Promise((resolve, _) => {
      resolve({ status: "web" })
    });
  }

  async start(options: CameraOptions): Promise<{}> {
    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        audio:!options.disableAudio,  
        video:true}
      );

      const video = document.getElementById("video");
      const parent = options.parent ? document.getElementById(options.parent) : document.body;
      if (!video) {
        const videoElement = document.createElement("video");
        videoElement.id = "video";
        videoElement.setAttribute("class", options.className || "");
        videoElement.setAttribute(
          "style",
          "-webkit-transform: scaleX(-1); transform: scaleX(-1);"
        );

        (parent as HTMLElement).appendChild(videoElement);

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // Not adding `{ audio: true }` since we only want video now
          navigator.mediaDevices.getUserMedia({ video: true }).then(
            function (stream) {
              //video.src = window.URL.createObjectURL(stream);
              videoElement.srcObject = stream;
              videoElement.play();
              resolve({});
            },
            (err) => {
              reject(err);
            }
          );
        }
      } else {
        reject({ message: "camera already started" });
      }
    });
  }

  async handleTap(): Promise<void> {

  }

  async stop(): Promise<any> {
    const video = <HTMLVideoElement>document.getElementById("video");
    if (video) {
      video.pause();

      const st: any = video.srcObject;
      const tracks = st.getTracks();

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
      }
      video.remove();
    }
  }

  async transcodeVideo(options: VideoEditorTranscodeProperties): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({ status: "success", path: "" })
    });
  };

  async createThumbnail(options: VideoEditorThumbnailProperties): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({ status: "success", path: "" })
    });
  };

  async trim(options: VideoEditorTrimProperties): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({ status: "success", path: "" })
    });
  };

  async getVideoInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  };

  async execFFMPEG(options: {}): Promise<{ status: string }> {
    console.log("execFFMPEG called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async execFFPROBE(options: {}): Promise<{ status: string }> {
    console.log("execFFPROBE called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async getXRDataForFrame(options: {}): Promise<{ data: XRFrameData }> {
    console.log("getXRDataForFrame called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ data: { hasData: false } })
    });
  }

  async startRecording(
    isAudio?: any,
    width?: number,
    height?: number,
    bitRate?: number,
    dpi?: number,
    filePath?: string
): Promise<{ status: string }> {
    console.log("startRecording called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async stopRecording(options: {}): Promise<{ status: string }> {
    console.log("stopRecording called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async getRecordingStatus(options: {}): Promise<{ status: string }> {
    console.log("getRecordingStatus called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async takePhoto(options: {}): Promise<{ status: string }> {
    console.log("takePhoto called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }


  async saveRecordingToVideo(options: {}): Promise<{ status: string }> {
    console.log("saveRecordingToVideo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async shareMedia(options: {}): Promise<{ status: string }> {
    console.log("shareMedia called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }


  async showVideo(options: {}): Promise<{ status: string }> {
    console.log("showVideo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async hideVideo(options: {}): Promise<{ status: string }> {
    console.log("showVideo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async playVideo(options: {}): Promise<{ status: string }> {
    console.log("playVideo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async pauseVideo(options: {}): Promise<{ status: string }> {
    console.log("pauseVideo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async scrubTo(options: {}): Promise<{ status: string }> {
    console.log("scrubTo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }

  async deleteVideo(options: {}): Promise<{ status: string }> {
    console.log("deleteVideo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }


  async saveVideoTo(options: {}): Promise<{ status: string }> {
    console.log("saveVideoTo called to plugin on web");
    return new Promise((resolve, reject) => {
      resolve({ status: "success" })
    });
  }
}

const XRPlugin = new XRPluginWeb();
registerWebPlugin(XRPlugin);

export { XRPlugin };


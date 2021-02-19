import { WebPlugin } from '@capacitor/core';
import { XRFrameData, XRPluginInterface, CameraOptions, VideoEditorThumbnailProperties, VideoEditorTranscodeProperties, VideoEditorTrimProperties } from './definitions';

export class XRPluginWeb extends WebPlugin implements XRPluginInterface {
  constructor() {
    super({
      name: 'XRPlugin',
      platforms: ['web'],
    });
  }

  async initialize(_options: {}): Promise<{ status: string }> {
    console.log("Initialize called to plugin on web");
    return new Promise((resolve, _) => {
      resolve({ status: "success" })
    });
  }

  async start(options: CameraOptions): Promise<{}> {
    return new Promise((resolve, reject) => {

      navigator.mediaDevices.getUserMedia({
        audio:!options.disableAudio,  
        video:true}
      );

      const video = document.getElementById("video");
      const parent = options.parent ? document.getElementById(options.parent) : null;
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

  async transcodeVideo(_options: VideoEditorTranscodeProperties): Promise<any> {
    return new Promise((resolve) => {
      resolve({ status: "success", path: "" })
    });
  };

  async createThumbnail(_options: VideoEditorThumbnailProperties): Promise<any> {
    return new Promise((resolve) => {
      resolve({ status: "success", path: "" })
    });
  };

  async trim(_options: VideoEditorTrimProperties): Promise<any> {
    return new Promise((resolve) => {
      resolve({ status: "success", path: "" })
    });
  };

  async getVideoInfo(): Promise<any> {
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  };

  async startXR(_options: {}): Promise<{ status: string }> {
    console.log("startXR called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async execFFMPEG(): Promise<{ status: string }> {
    console.log("execFFMPEG called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async execFFPROBE(): Promise<{ status: string }> {
    console.log("execFFPROBE called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async stopXR(_options: {}): Promise<{ status: string }> {
    console.log("stopXR called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async getXRDataForFrame(_options: {}): Promise<{ data: XRFrameData }> {
    console.log("getXRDataForFrame called to plugin on web");
    return new Promise((resolve) => {
      resolve({ data: { hasData: false } })
    });
  }

  async startRecording(_options: {}): Promise<{ status: string }> {
    console.log("startRecording called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async stopRecording(_options: {}): Promise<{ status: string }> {
    console.log("stopRecording called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async getRecordingStatus(_options: {}): Promise<{ status: string }> {
    console.log("getRecordingStatus called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async takePhoto(_options: {}): Promise<{ status: string }> {
    console.log("takePhoto called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }


  async saveRecordingToVideo(_options: {}): Promise<{ status: string }> {
    console.log("saveRecordingToVideo called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async shareMedia(_options: {}): Promise<{ status: string }> {
    console.log("shareMedia called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }


  async showVideo(_options: {}): Promise<{ status: string }> {
    console.log("showVideo called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async hideVideo(_options: {}): Promise<{ status: string }> {
    console.log("showVideo called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async scrubTo(_options: {}): Promise<{ status: string }> {
    console.log("scrubTo called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }

  async deleteVideo(_options: {}): Promise<{ status: string }> {
    console.log("deleteVideo called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }


  async saveVideoTo(_options: {}): Promise<{ status: string }> {
    console.log("saveVideoTo called to plugin on web");
    return new Promise((resolve) => {
      resolve({ status: "success" })
    });
  }
}

const XRPlugin = new XRPluginWeb();

export { XRPlugin };

import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(XRPlugin);

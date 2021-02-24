import { Capacitor, Plugins } from '@capacitor/core';
import "@xr3ngine/native-plugin-xr/src/index.ts";
import React, { useEffect, useState } from 'react';


const { isNative } = Capacitor;

enum RecordingStates {
    OFF = "off",
    ON = "on",
    STARTING = "starting",
    ENDING = "ending"
}

const meshFilePath = typeof location !== 'undefined' ? location.origin + "/volumetric/liam.drcs" : "";
const videoFilePath = typeof location !== 'undefined' ? location.origin + "/volumetric/liam.mp4" : "";

export const IndexPage = (): any => {
    const [initializationResponse, setInitializationResponse] = useState("");
    const [cameraStartedState, setCameraStartedState] = useState("");
    const [recordingState, setRecordingState] = useState(RecordingStates.OFF);

    useEffect(() => {
        (async function () {
            const { XRPlugin } = Plugins;

            XRPlugin.initialize({}).then(response => {
                setInitializationResponse(response.status);
            });

            XRPlugin.start({}).then(() => {
                setCameraStartedState(isNative ? "Camera started on native" : "Camera started on web");
            })
        })();
    }, []);

    const toggleRecording = () => {
        if (recordingState === RecordingStates.OFF) {
            setRecordingState(RecordingStates.ON);
            Plugins.XRPlugin.startRecording({
                isAudio: true,
                width: 500,
                height: 500,
                bitRate: 1000,
                dpi: 100,
                filePath: "/test.mp4"
            }).then(({ status }) => {
                    console.log("RECORDING, STATUS IS", status);
                });
        }
        else if (recordingState === RecordingStates.ON) {
            setRecordingState(RecordingStates.OFF);
            Plugins.XRPlugin.stopRecording().
                then(({ status }) => {
                    console.log("END RECORDING, STATUS IS", status);
                });
        }
    }


    // useEffect(() => {
    //     setSecondState("Initialized and effected");
    // }, [initializationResponse]);

    return (<>
        <div className="plugintest">
            <div className="plugintestReadout">
                <p>{initializationResponse}</p>
                <p>{cameraStartedState}</p>
                <button type="button" onClick={() => toggleRecording()}>{recordingState}</button>
            </div>

        </div>
                        {/* <VolumetricPlayer
                        meshFilePath={meshFilePath}
                        videoFilePath={videoFilePath}
                        cameraVerticalOffset={0.5}
                    /> */}
                    </>
    );
};

export default IndexPage;

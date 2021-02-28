import { Capacitor, Plugins } from '@capacitor/core';
import "@xr3ngine/native-plugin-xr/src/index.ts";
import React, { useEffect, useState } from 'react';
import { BoxGeometry, Mesh, MeshBasicMaterial, PerspectiveCamera, Quaternion, Scene, Vector3, WebGLRenderer } from 'three';


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
    const [cameraPoseState, setCameraPoseState] = useState("");
    const [anchorPoseState, setAnchorPoseState] = useState("");
    const [intrinsicsState, setCameraIntrinsicsState] = useState("");
    const [savedFilePath, setSavedFilePath] = useState("");

    const [recordingState, setRecordingState] = useState(RecordingStates.OFF);
    let renderer, scene, camera;
    const raf = () => {
        renderer.render(scene, camera);
        requestAnimationFrame(raf);
    }
    useEffect(() => {
        (async function () {
            scene = new Scene();
            const geometry = new BoxGeometry(.2, .2, .2);
            const material = new MeshBasicMaterial({ color: 0x00ff00 });
            const anchor = new Mesh(geometry, material);
            camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            scene.background = null;
            renderer = new WebGLRenderer({ alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.width = "100%";
            renderer.domElement.style.height = "100%";
            renderer.domElement.style.zIndex = "-1";

            renderer.domElement.style.top = 0;
            renderer.domElement.style.margin = 0;
            renderer.domElement.style.padding = 0;
            scene.add(camera);

            scene.add(anchor);
            anchor.position.set(0, 0, -2);

            requestAnimationFrame(raf);


            const { XRPlugin } = Plugins;

            await XRPlugin.initialize({}).then(response => {
                setInitializationResponse(response.status);
            });

            Plugins.XRPlugin.addListener('poseDataReceived', (data: any) => {
                const {
                    cameraPositionX,
                    cameraPositionY,
                    cameraPositionZ,
                    cameraRotationX,
                    cameraRotationY,
                    cameraRotationZ,
                    cameraRotationW,
                } = data;

                // TODO:
                // Set camera position and rotation
                // Enable cube and move to position/rotation if placed is true
                setCameraPoseState(JSON.stringify({
                    cameraPositionX,
                    cameraPositionY,
                    cameraPositionZ,
                    cameraRotationX,
                    cameraRotationY,
                    cameraRotationZ,
                    cameraRotationW
                }));

                camera.setRotationFromQuaternion(new Quaternion(cameraRotationX, cameraRotationY, cameraRotationZ, cameraRotationW));
                
                camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);

                if (data.placed) {
                    const {
                        anchorPositionX,
                        anchorPositionY,
                        anchorPositionZ,
                        anchorRotationX,
                        anchorRotationY,
                        anchorRotationZ,
                        anchorRotationW
                    } = data;

                    setAnchorPoseState(JSON.stringify({
                        anchorPositionX,
                        anchorPositionY,
                        anchorPositionZ,
                        anchorRotationX,
                        anchorRotationY,
                        anchorRotationZ,
                        anchorRotationW
                    }));

                    anchor.setRotationFromQuaternion(new Quaternion(anchorRotationX, anchorRotationY, anchorRotationZ, anchorRotationW));
                    anchor.position.set(anchorPositionX, anchorPositionY, anchorPositionZ);
                }

            });

            Plugins.XRPlugin.addListener('cameraIntrinsicsReceived', (data: any) => {
                setCameraIntrinsicsState(JSON.stringify({
                    fX: data.fX,
                    fY: data.fy,
                    cX: data.cX,
                    cY: data.cy,
                    x: data.x,
                    y: data.y
                }));

                camera.setFocalLength(data.y);

                // TODO:
                // Set camera position and rotation
                // Enable cube and move to position/rotation if placed is true
            });


            XRPlugin.start({}).then(() => {
                setCameraStartedState(isNative ? "Camera started on native" : "Camera started on web");
            });


        })();
    }, []);

    let video;
    const playVideo = () => {
        if(video == null)
            video = document.createElement("VIDEO");

        console.log("Playing video");
        console.log("*********** PATH IS", savedFilePath);

        video.setAttribute("width", "320");
        video.setAttribute("height", "240");

        video.style.position = "absolute";
        video.style.width = "100%";
        video.style.height = "100%";

        video.setAttribute("src", Capacitor.convertFileSrc(savedFilePath));

        video.play();

    }

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
                then(({ result, filePath }) => {
                    console.log("END RECORDING, result IS", result);
                    console.log("filePath IS", filePath);

                    setSavedFilePath("file://" + filePath);
                });
        }
    }

    const handleTap = () => {
        Plugins.XRPlugin.handleTap();
    }


    const clearAnchors = () => {
        Plugins.XRPlugin.clearAnchors();
    }

    // useEffect(() => {
    //     setSecondState("Initialized and effected");
    // }, [initializationResponse]);

    return (<>
        <div className="plugintest">
            <div className="plugintestReadout">
                <p>{initializationResponse}</p>
                <p>{cameraStartedState}</p>
                <p>{cameraPoseState}</p>
                <p>{anchorPoseState}</p>
                <p>{intrinsicsState}</p>

                <button type="button" style={{ padding: "1em" }} onClick={() => toggleRecording()}>{recordingState === RecordingStates.OFF ? "Record" : "Stop Recording"}</button>
                <button type="button" style={{ padding: "1em" }} onClick={() => handleTap()}>Place AR</button>
                <button type="button" style={{ padding: "1em" }} onClick={() => clearAnchors()}>clearAnchors</button>
                <button type="button" style={{ padding: "1em" }} onClick={() => playVideo()}>playVideo</button>

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

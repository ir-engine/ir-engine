import { Capacitor, Plugins } from '@capacitor/core';
import "@xr3ngine/native-plugin-xr/src/index.ts";
import React, { useEffect, useState } from 'react';
import {
    AxesHelper,
    BoxGeometry, CameraHelper,
    GridHelper, Group,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    Quaternion,
    Scene,
    Vector3,
    WebGLRenderer
} from 'three';



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
    let renderer, scene, camera, camera2;
    const raf = () => {
        renderer.render(scene, camera2);
        requestAnimationFrame(raf);
    };
    useEffect(() => {
        (async function () {
            scene = new Scene();
            //scene.rotation.z = Math.PI / 2;

            const geometry = new BoxGeometry(.1, .1, .1);
            const materialX = new MeshBasicMaterial({ color: 0xff0000 });
            const materialY = new MeshBasicMaterial({ color: 0x00ff00 });
            const materialZ = new MeshBasicMaterial({ color: 0x0000ff });
            const anchor = new Group();
            anchor.add(new AxesHelper(0.25));
            const anchorX = new Mesh(geometry, materialX);
            anchorX.position.x = 1;
            anchor.add(anchorX);
            const anchorY = new Mesh(geometry, materialY);
            anchorY.position.y = 1;
            anchor.add(anchorY);
            const anchorZ = new Mesh(geometry, materialZ);
            anchorZ.position.z = 1;
            anchor.add(anchorZ);

            camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 1);
            camera2 = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.001, 100);
            camera2.position.set(3,3,3);
            camera2.lookAt(new Vector3());
            //scene.background = null;
            renderer = new WebGLRenderer({ alpha: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);
            renderer.domElement.style.position = "absolute";
            renderer.domElement.style.width = "100vw";
            renderer.domElement.style.height = "100vh";
            renderer.domElement.style.zIndex = "-1";

            renderer.domElement.style.top = 0;
            renderer.domElement.style.margin = 0;
            renderer.domElement.style.padding = 0;
            scene.add(camera);

            const ch = new CameraHelper(camera);
            scene.add(ch);

            scene.add(anchor);
            anchor.position.set(0, 0, -2);

            scene.add(new AxesHelper(2));
            const gh = new GridHelper(2);
            scene.add(gh);

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

                camera.quaternion.set(cameraRotationX, cameraRotationY, cameraRotationZ, cameraRotationW);

                camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
                camera.updateProjectionMatrix();

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

                    anchor.quaternion.set(anchorRotationX, anchorRotationY, anchorRotationZ, anchorRotationW);
                    anchor.position.set(anchorPositionX, anchorPositionY, anchorPositionZ);
                }

            });

            Plugins.XRPlugin.addListener('cameraIntrinsicsReceived', (data: any) => {
                setCameraIntrinsicsState(JSON.stringify({
                    fX: data.fX,
                    fY: data.fY,
                    cX: data.cX,
                    cY: data.cy,
                    x: data.x,
                    y: data.y
                }));

                // camera.setFocalLength(data.fY);
                // camera.setFocalLength(50);

                // TODO:
                // Set camera position and rotation
                // Enable cube and move to position/rotation if placed is true
            });


            XRPlugin.start({}).then(() => {
                setCameraStartedState(isNative ? "Camera started on native" : "Camera started on web");
            });
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
                then(({ result, filePath }) => {
                    console.log("END RECORDING, result IS", result);
                    console.log("filePath IS", filePath);

                    setSavedFilePath("file://" + filePath);
                });
        }
    };

    const handleTap = () => {
        Plugins.XRPlugin.handleTap();
    };

    const playVideo = () => {
        Plugins.XRPlugin.playVideo();
    };

    const pauseVideo = () => {
        Plugins.XRPlugin.pauseVideo();
    };


    const clearAnchors = () => {
        Plugins.XRPlugin.clearAnchors();
    };

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
                <button type="button" style={{ padding: "1em" }} onClick={() => pauseVideo()}>pauseVideo</button>


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

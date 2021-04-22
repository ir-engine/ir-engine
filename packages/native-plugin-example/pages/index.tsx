import { Capacitor, Plugins } from '@capacitor/core';
import "@xr3ngine/native-plugin-xr/src/index.ts";
import React, { useEffect, useState } from 'react';
import {
    AxesHelper,
    BoxGeometry, CameraHelper,
    GridHelper, Group, Matrix4,
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
const PI2 = Math.PI * 2;
const testData = {
    cameraIntrinsics: null,
    checkpoints: [],
};
const cameraLink = {
    camera: null
};

export const IndexPage = (): any => {
    const [initializationResponse, setInitializationResponse] = useState("");
    const [cameraStartedState, setCameraStartedState] = useState("");
    const [cameraPoseState, setCameraPoseState] = useState("");
    const [cameraPoseRState, setCameraPoseRState] = useState("");
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
            cameraLink.camera = camera;

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

            const correctionQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1,0,0), Math.PI/2);
            const correctionMatrix = new Matrix4().set(
              1,   0,   0,   0,
              0,   0,   1,   0,
              0, - 1,   0,   0,
              0,   0,   0,   1
            );

            Plugins.XRPlugin.addListener('poseDataReceived', (_data: any) => {
                // TODO: this is temporary to be able to modify axes in one place
                const data = {
                    ..._data,
                    // cameraPositionY: _data.cameraPositionZ * 1,
                    // cameraPositionZ: _data.cameraPositionY,

                    // cameraRotationX: _data.cameraRotationY,
                    // cameraRotationY: _data.cameraRotationZ * -1,
                    // cameraRotationZ: _data.cameraRotationX,

                    // anchorPositionY: _data.anchorPositionZ * 1,
                    // anchorPositionZ: _data.anchorPositionY,
                    // anchorRotationX: _data.anchorRotationX * -1,
                    // anchorRotationY: _data.anchorRotationZ * 1,
                    // anchorRotationZ: _data.anchorRotationY * -1,
                };

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
                camera.updateMatrix();

                // apply coordinates convertion
                {
                    const matrixInverse = correctionMatrix.clone().transpose();
                    camera.matrix.premultiply(correctionMatrix).multiply(matrixInverse);
                    camera.matrix.decompose( camera.position, camera.quaternion, camera.scale );
                    camera.updateMatrixWorld();
                }

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
                testData.cameraIntrinsics = data;

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

    const storeCheckpoint = () => {
      if (!cameraLink.camera) {
        return;
      }
      testData.checkpoints.push({
        position: camera.position.toArray(),
        rotation: camera.quaternion.toArray(),
      })
    }

    const dumpCheckpoints = () => {
      console.log('testData', testData);
    }

    // useEffect(() => {
    //     setSecondState("Initialized and effected");
    // }, [initializationResponse]);

    return (<>
        <div className="plugintest">
            <div className="plugintestReadout">
                <p>IR:{initializationResponse}</p>
                <p>CSS:{cameraStartedState}</p>
                <p>CRS:{cameraPoseRState}</p>
                <p>IS:{intrinsicsState}</p>
                {/*
                    <p>CPS:{cameraPoseState}</p>
                    <p>APS:{anchorPoseState}</p>

                */}
            </div>
        </div>

          <div className="plugintestControls">
              <button type="button" style={{ padding: "1em" }} onClick={() => toggleRecording()}>{recordingState === RecordingStates.OFF ? "Record" : "Stop Recording"}</button>
              <button type="button" style={{ padding: "1em" }} onClick={() => handleTap()}>Place AR</button>
              <button type="button" style={{ padding: "1em" }} onClick={() => clearAnchors()}>clearAnchors</button>
              <button type="button" style={{ padding: "1em" }} onClick={() => playVideo()}>playVideo</button>
              <button type="button" style={{ padding: "1em" }} onClick={() => pauseVideo()}>pauseVideo</button>
              <button type="button" style={{ padding: "1em" }} onClick={() => storeCheckpoint()}>CP</button>
              <button type="button" style={{ padding: "1em" }} onClick={() => dumpCheckpoints()}>DMP</button>
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

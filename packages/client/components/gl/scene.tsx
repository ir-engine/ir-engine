// import { AssetLoader } from '@xr3ngine/engine/src/assets/components/AssetLoader';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
// import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { addComponent, createEntity, /*getComponent,*/ getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { CarController } from "@xr3ngine/engine/src/templates/car/prefabs/CarController";
import { WorldPrefab } from "@xr3ngine/engine/src/templates/world/prefabs/WorldPrefab";
// import { rigidBodyBox } from "@xr3ngine/engine/src/templates/car/prefabs/rigidBodyBox";
// import { rigidBodyBox2 } from "@xr3ngine/engine/src/templates/car/prefabs/rigidBodyBox2";
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AmbientLight, EquirectangularReflectionMapping, Mesh, MeshPhongMaterial, SphereBufferGeometry, sRGBEncoding, TextureLoader,CineonToneMapping, PCFSoftShadowMap, PointLight } from 'three';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import { connectToInstanceServer, provisionInstanceServer } from '../../redux/instanceConnection/service';
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { selectAuthState } from '../../redux/auth/selector';
import { selectPartyState } from '../../redux/party/selector';
import { client } from '../../redux/feathers';

import dynamic from 'next/dynamic';

import { RazerLaptop } from "@xr3ngine/engine/src/templates/interactive/prefabs/RazerLaptop";
// import { InfoBox } from "../infoBox";
// import { HintBox } from "../hintBox";
// import { BeginnerBox } from '../beginnerBox';
import './style.scss';
import { resetEngine } from "../../../engine/src/ecs/functions/EngineFunctions";
import LinearProgressComponent from '../ui/LinearProgress';
import UIDialog from '../ui/Dialog/Dialog'


const MobileGamepad = dynamic(() => import("../mobileGampad").then((mod) => mod.MobileGamepad),  { ssr: false });

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state),
    authState: selectAuthState(state),
    partyState: selectPartyState(state)
  };
};

enum generalStateList {START_STATE, SCENE_LOADING, SCENE_LOADED, AVATAR_SELECTION, AVATAR_SELECTED, DEVICE_SETUP,
    TUTOR_LOOKAROUND, TUTOR_MOVE, ALL_DONE};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  provisionInstanceServer: bindActionCreators(
    provisionInstanceServer,
    dispatch
  ),
  connectToInstanceServer: bindActionCreators(
    connectToInstanceServer,
    dispatch
  ),
});

export const EnginePage: FunctionComponent = (props: any) => {
  const {
    authState,
    instanceConnectionState,
    partyState,
    connectToInstanceServer,
    provisionInstanceServer
  } = props;
  const [enabled, setEnabled] = useState(false);
  const [generalState, setGeneralState] = useState(generalStateList.START_STATE);
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [hintBoxData, setHintBoxData] = useState('default');
  const [showControllHint, setShowControllHint] = useState(true);
  const [progressEntity, setProgressEntity] = useState('');
  const defaultDialogData = {isOpened: false, dialogText:'', submitButtonText: '', submitButtonAction:null}
  const [dialogData, setDialogData] = useState(defaultDialogData);

  useEffect(() => {
    console.log('initializeEngine!');

    const onObjectHover = (event: CustomEvent): void => {
      if (event.detail.focused) {
        setHoveredLabel(String(event.detail.interactionText ? event.detail.interactionText :'Activate' ));
      } else {
        setHoveredLabel('');
      }
    };

    const onObjectActivation = (event: CustomEvent): void => {
      console.log('OBJECT ACTIVATION!', event.detail?.action, event.detail);
      switch (event.detail.action) {
        case "link":
          window.open(event.detail.url, "_blank");
          break;
        case "infoBox":
          // TODO: show info box
          setInfoBoxData(event.detail.payload);
          break;
      }
    };

    const onCarActivation = (event: CustomEvent): void => {
      if (event.detail.inCar) {
        setHintBoxData('car');
        setHoveredLabel('');
      } else {
        setHintBoxData('default');
      }
      setShowControllHint(true);
    };

    //all scene entities is loaded 
    const onSceneLoaded= (event: CustomEvent): void => {
      if (event.detail.loaded) {
        console.log('onSceneLoaded generalState', generalState);
        setGeneralState(generalStateList.SCENE_LOADED);
      }
    };

    //started loading scene intities
    const onSceneLoadedEntity= (event: CustomEvent): void => {
      setProgressEntity(' left '+event.detail.left);
    };

    document.addEventListener('object-hover', onObjectHover);
    document.addEventListener('object-activation', onObjectActivation);
    document.addEventListener('player-in-car', onCarActivation);
    document.addEventListener('scene-loaded', onSceneLoaded);
    document.addEventListener('scene-loaded-entity', onSceneLoadedEntity);


    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport,
    };

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        enabled: true,
        supportsMediaStreams: true,
        schema: networkSchema,
      },
      physics: {
        enabled: true,
      },
      audio: {
        src: '/audio/djMagda.m4a',
      },
      input: {
        mobile: isMobileOrTablet(),
      },
    };
    
    initializeEngine(InitializationOptions);

    // Load glb here
    // createPrefab(rigidBodyBox);

    Engine.renderer.shadowMap.enabled = true;
    Engine.renderer.shadowMap.type = PCFSoftShadowMap;

    const light = new PointLight(0xffffff, 1.8);
    light.position.set(0, 4, 4);
    light.castShadow = true;
    light.shadow.bias = -0.0006; // Prevents graphical issues
    light.shadow.mapSize.set(2048, 2048);
    light.shadow.camera.position.set(0, 4, 4);
    light.shadow.camera.updateMatrixWorld();
    Engine.scene.add(light);

    addObject3DComponent(createEntity(), {
      obj3d: AmbientLight,
      ob3dArgs: {
        intensity: 0.3,
      },
    });

    const cameraTransform = getMutableComponent<TransformComponent>(
      CameraComponent.instance.entity,
      TransformComponent
    );
    cameraTransform.position.set(0, 1.2, 3);

    const envMapURL = './hdr/city.jpg';

    const loader = new TextureLoader()

    ;(loader as any).load(
      envMapURL,
      (data) => {
        const map = loader.load(envMapURL);
        map.mapping = EquirectangularReflectionMapping;
        map.encoding = sRGBEncoding;
        Engine.scene.environment = map;
        Engine.scene.background = map;
      },
      null
    );

    const { sound } = Engine as any;
    if (sound) {
      const audioMesh = new Mesh(
        new SphereBufferGeometry(0.3),
        new MeshPhongMaterial({ color: 0xff2200 })
      );
      const audioEntity = createEntity();
      addObject3DComponent(audioEntity, {
        obj3d: audioMesh,
      });
      audioMesh.add(sound);
      const transform = addComponent(
        audioEntity,
        TransformComponent
      ) as TransformComponent;
      transform.position.set(0, 1, 0);
      // const audioComponent = addComponent(audioEntity,
      //   class extends Component {static scema = {}}
      // )
    }
    Engine.renderer.toneMapping = CineonToneMapping;
    Engine.renderer.toneMappingExposure = 0.1;


    Engine.renderer.toneMapping = CineonToneMapping;
    Engine.renderer.toneMappingExposure = 1;

    createPrefab(WorldPrefab);
    createPrefab(staticWorldColliders);
//  setTimeout(() => {
    // createPrefab(rigidBodyBox);
    // createPrefab(rigidBodyBox2);
    createPrefab(RazerLaptop);
    createPrefab(CarController);
    // setSceneLoaded(1);

    //createPrefab(interactiveBox);
  //}, 5000);


    return (): void => {
      document.removeEventListener('object-hover', onObjectHover);
      document.removeEventListener('object-activation', onObjectActivation);
      document.removeEventListener('player-in-car', onCarActivation);
      document.removeEventListener('scene-loaded', onSceneLoaded);
      document.removeEventListener('scene-loaded-entity', onSceneLoadedEntity);    

      // cleanup
      console.log('cleanup?!');
      // TODO: use resetEngine when it will be completed. for now just reload
      //document.location.reload();
      resetEngine();
    };
  }, []);

  const renderLinearProgress = () =>{
    if(generalState === generalStateList.START_STATE){
      document.querySelector('.overlayTemporary') && document.querySelector('.overlayTemporary').remove();
      return <div className="overlay">
        <LinearProgressComponent label={`Please wait while the World is loading ...${progressEntity}`} />
      </div> 
    }
  }

  const defineDialog = () =>{
    console.log ('defineDialog generalStateList[generalState]', generalStateList[generalState])
    switch(generalState){
      case  generalStateList.SCENE_LOADED : { 
            setDialogData({isOpened: true,
                    dialogText:'Virtual retail experience', 
                    submitButtonText: 'Enter The World', 
                    submitButtonAction:()=>setGeneralState(generalStateList.AVATAR_SELECTION)})
            break;
          }
      case generalStateList.AVATAR_SELECTION: {
             setDialogData({isOpened: true, 
                    dialogText:'Select Your Avatar', 
                    submitButtonText: 'Accept', 
                    submitButtonAction:()=>setGeneralState(generalStateList.AVATAR_SELECTED)});
            break;
          }  
      case generalStateList.AVATAR_SELECTED: {
            createPrefab(PlayerCharacter);
            setGeneralState(generalStateList.ALL_DONE);
            setDialogData(defaultDialogData);
           break;
         }          
      default : {setDialogData(defaultDialogData); break;}
    }
  }

  useEffect(() => {
    console.log('generalState useEffect', generalState)
    renderLinearProgress();  
    defineDialog();
  },[generalState]);


  useEffect(() => {
    const f = (event: KeyboardEvent): void => {
      //hide controlls hint when move/do smth
      // setShowControllHint(false);
      if (event.keyCode === 192) {
        event.preventDefault();
        toggleEnabled();
      }
    };
    document.addEventListener("keydown", f);
    return (): void => {
      document.removeEventListener('keydown', f);
    };
  });

  useEffect(() => {
    if (
      instanceConnectionState.get('instanceProvisioned') === true &&
      instanceConnectionState.get('updateNeeded') === true
    ) {
      console.log('Calling connectToInstanceServer');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);

  useEffect(() => {
    if (instanceConnectionState.get('instanceProvisioned') == false) {
      const user = authState.get('user');
      const party = partyState.get('party');
      const instanceId = user.instanceId != null ? user.instanceId : party.instanceId != null ? party.instanceId: null;
      if (instanceId != null) {
        client.service('instance').get(instanceId)
            .then((instance) => {
              console.log(`Connecting to location ${instance.locationId}`);
              provisionInstanceServer(instance.locationId);
            });
      }
    }
    else {
      connectToInstanceServer();
    }
  }, []);

  const toggleEnabled = (): void => {
    console.log('enabled ', enabled);
    if (enabled === true) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  };


  const terminal = enabled? (
      <Terminal
        color='green'
        backgroundColor='black'
        // allowTabs={false}
        allowTabs={true}
        startState='maximised'
        showCommands={true}
        style={{
          fontWeight: "bold",
          fontSize: "1em",
          position: "fixed",
          bottom: "0",
          width: "100%",
          // Height is set in termimal itself depending is it expanded.
          // height: "30%",
          zIndex: 4000 }}
        commands={commands}
        description={description}
        msg='Interactive terminal. Please consult the manual for commands.'
      />
    ) : null;

  //   //mobile gamepad
  // const mobileGamepadProps = {hovered:hoveredLabel.length > 0, layout: hintBoxData };
  // const mobileGamepad = isMobileOrTablet()? <MobileGamepad {...mobileGamepadProps} /> : null;

  //info box with button
  // const infoBox = !isMobileOrTablet() && infoBoxData ? <InfoBox onClose={() => { setInfoBoxData(null); }} data={infoBoxData} /> : null;
  // const hintBox = !isMobileOrTablet() && showControllHint && hintBoxData ? <HintBox layout={hintBoxData} /> : null;

  // const progressBar = 
  //       progress < 1 ? 
  //         <div className="overlay">
  //           <LinearProgressComponent label={`Please wait while the World is loading ...${progressEntity}`} />
  //         </div> 
        // : null;
  //hide default overlay


  // const hoveredLabelElement = !!!isMobileOrTablet() && hoveredLabel.length > 0 ?
  // <div className="hintContainer">Press <span className="keyItem" >E</span> to {hoveredLabel}</div> : null;
 
  return (
    <>
    <div className="overlay overlayTemporary"></div>
    {renderLinearProgress()}
    <UIDialog {...{values:dialogData}}>{dialogData.dialogText}</UIDialog>
    {/* {infoBox} */}
    {/* {hintBox} */}
    {/* {hoveredLabelElement} */}
    {terminal}
    {/* {mobileGamepad} */}
    {/* <BeginnerBox /> */}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);

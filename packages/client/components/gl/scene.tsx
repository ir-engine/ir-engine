import { AssetLoader } from '@xr3ngine/engine/src/assets/components/AssetLoader';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { addComponent, createEntity, getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { CarController } from "@xr3ngine/engine/src/templates/car/prefabs/CarController";
import { WorldPrefab } from "@xr3ngine/engine/src/templates/world/prefabs/WorldPrefab";
import { rigidBodyBox } from "@xr3ngine/engine/src/templates/car/prefabs/rigidBodyBox";
import { rigidBodyBox2 } from "@xr3ngine/engine/src/templates/car/prefabs/rigidBodyBox2";
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import {
  AmbientLight,
  EquirectangularReflectionMapping,
  Mesh,
  MeshPhongMaterial,
  SphereBufferGeometry,
  sRGBEncoding,
  TextureLoader,
  CineonToneMapping
} from 'three';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import { connectToInstanceServer, provisionInstanceServer } from '../../redux/instanceConnection/service';
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";

import dynamic from 'next/dynamic';
import { RazerLaptop } from "@xr3ngine/engine/src/templates/interactive/prefabs/RazerLaptop";
import { InfoBox } from "../infoBox";
import { HintBox } from "../hintBox";
const MobileGamepad = dynamic(() => import("../mobileGampad").then((mod) => mod.MobileGamepad),  { ssr: false });

const locationId = 'e3523270-ddb7-11ea-9251-75ab611a30da';
const locationId2 = '489ec2b1-f6b2-46b5-af84-92d094927dd7';
const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state)
  };
};


const mapDispatchToProps = (dispatch: Dispatch): any => ({
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch)
});

export const EnginePage: FunctionComponent = (props: any) => {
  const {
    instanceConnectionState,
    connectToInstanceServer,
    provisionInstanceServer
  } = props;
  const [enabled, setEnabled] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [hintBoxData, setHintBoxData] = useState('default');

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
      console.log('event.detail',event.detail)
      if (event.detail.inCar) {
        setHintBoxData('car');
      } else {
        setHintBoxData('default');
      }  
    };

    document.addEventListener('object-hover', onObjectHover);
    document.addEventListener('object-activation', onObjectActivation);
    document.addEventListener('player-in-car', onCarActivation);


    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport
    };

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        enabled: true,
        supportsMediaStreams: true,
        schema: networkSchema
      },
      physics: {
        enabled: true
      },
      audio: {
        src: '/audio/djMagda.m4a'
      },
      input: {
        mobile: isMobileOrTablet()
      }
    };
    initializeEngine(InitializationOptions);

    // Load glb here
    // createPrefab(rigidBodyBox);

    addObject3DComponent(createEntity(), { obj3d: AmbientLight, ob3dArgs: {
      intensity: 0.3
    }});

    const cameraTransform = getMutableComponent<TransformComponent>(CameraComponent.instance.entity, TransformComponent);
    cameraTransform.position.set(0, 1.2, 3);

    const envMapURL =
      "./hdr/city.jpg";

      const loader = new TextureLoader();

       (loader as any).load(envMapURL, data => {
       const map = loader.load(envMapURL);
       map.mapping = EquirectangularReflectionMapping;
       map.encoding = sRGBEncoding;
        Engine.scene.environment = map;
        Engine.scene.background = map;
        }, null);

    const { sound } = Engine as any;
    if (sound) {
      const audioMesh = new Mesh(
        new SphereBufferGeometry(0.3),
        new MeshPhongMaterial({color: 0xff2200})
      );
      const audioEntity = createEntity();
      addObject3DComponent(audioEntity, {
        obj3d: audioMesh
      });
      audioMesh.add(sound);
      const transform = addComponent(audioEntity, TransformComponent) as TransformComponent;
      transform.position.set(0, 1, 0);
      // const audioComponent = addComponent(audioEntity,
      //   class extends Component {static scema = {}}
      // )
    }



    Engine.renderer.toneMapping = CineonToneMapping;
    Engine.renderer.toneMappingExposure = 0.1;

    createPrefab(WorldPrefab);
    createPrefab(PlayerCharacter);
    createPrefab(staticWorldColliders);
  setTimeout(() => {
    // createPrefab(rigidBodyBox);
    // createPrefab(rigidBodyBox2);
     createPrefab(CarController);
    //createPrefab(interactiveBox);
    createPrefab(RazerLaptop);


//    Engine.scene.traverse((c: unknown) => { if (c instanceof Mesh && c.isMesh && c.material) { c.material.needsUpdate=true; }  });
  }, 5000);

  console.log('scene---', Engine.scene);


    return (): void => {
      document.removeEventListener('object-hover', onObjectHover);
      document.removeEventListener('object-activation', onObjectActivation);
      document.addEventListener('player-in-car', onCarActivation);

      // cleanup
      console.log('cleanup?!');
      // TODO: use resetEngine when it will be completed. for now just reload
      document.location.reload();
      // resetEngine();
    };
  }, []);

  useEffect(() => {
    const f = (event: KeyboardEvent): void => {
      const P_PLAY_PAUSE = 112;
      if (event.keyCode === 27)
        toggleEnabled();
      else if(event.keyCode == P_PLAY_PAUSE){

      }
    };
    document.addEventListener("keydown", f);
    return (): void => {
      document.removeEventListener("keydown", f);
    };
  });

  useEffect(() => {
    if (instanceConnectionState.get('instanceProvisioned') === true && instanceConnectionState.get('updateNeeded') === true) {
      console.log('Calling connectToInstanceServer');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);

  useEffect(() => {
    if (instanceConnectionState.get('instanceProvisioned') == false) {
      provisionInstanceServer(locationId);
    }
    else {
      connectToInstanceServer();
    }
  }, []);

  const toggleEnabled = (): void => {
    console.log("enabled ", enabled);
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

  const mobileGamepad = isMobileOrTablet()? <MobileGamepad /> : null;

  const infoBox = infoBoxData? <InfoBox onClose={() => { setInfoBoxData(null) }} data={infoBoxData} /> : null;
  const hintBox = hintBoxData? <HintBox layout={hintBoxData} /> : null;

  const hoveredLabelElement = hoveredLabel.length > 0 ? 
  <div style={{ position: "fixed", top:"60%", left:"48%", color:"#FFFFFF", fontWeight:'bold' }}>Press 
  <span className="keyItem" style={{backgroundColor: "rgba(0,0,0,0.6)", borderRadius: '4px', boxShadow: '0 0 10px rgba(102,185,51,0.5)', boxSizing: 'border-box',
    display: 'inline-block',
    height: '2em', 
    lineHeight: '2em',
    margin: '3px',
    minWidth: '2em',
    padding: '0px 5px',
    textAlign: 'center',
    textTransform: 'capitalize'
  }}>E</span> to {hoveredLabel}</div> : null;

  return (
    <>
    {infoBox}
    {hintBox}
    {hoveredLabelElement}
    {terminal}
    {mobileGamepad}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);

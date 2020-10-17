import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { isMobileOrTablet } from "@xr3ngine/engine/src/common/functions/isMobile";
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { addComponent, createEntity, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { CarController } from "@xr3ngine/engine/src/templates/car/prefabs/CarController";
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter';
import { JoystickPrefab } from "@xr3ngine/engine/src/templates/devices/prefabs/JoystickPrefab";
import { RazerLaptop } from "@xr3ngine/engine/src/templates/devices/prefabs/RazerLaptop";
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { WorldPrefab } from "@xr3ngine/engine/src/templates/world/prefabs/WorldPrefab";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import dynamic from 'next/dynamic';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AmbientLight, CineonToneMapping, EquirectangularReflectionMapping, Mesh, MeshPhongMaterial, PCFSoftShadowMap, PointLight, RGBEEncoding, SphereBufferGeometry } from 'three';
import { RGBELoader } from "@xr3ngine/engine/src/assets/loaders/HDR/RGBELoader";
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { selectAuthState } from '../../redux/auth/selector';
import { client } from '../../redux/feathers';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import { connectToInstanceServer, provisionInstanceServer } from '../../redux/instanceConnection/service';
import { selectPartyState } from '../../redux/party/selector';
import { BeginnerBox } from '../ui/beginnerBox';
import { HintBox } from "../ui/hintBox";
import { InfoBox } from "../ui/InfoBox";
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';
import './style.module.css';
RazerLaptop

const MobileGamepad = dynamic(() => import("../ui/MobileGampad").then((mod) => mod.MobileGamepad),  { ssr: false });

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state),
    authState: selectAuthState(state),
    partyState: selectPartyState(state)
  };
};


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
  const [hoveredLabel, setHoveredLabel] = useState('');
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [hintBoxData, setHintBoxData] = useState('default');
  const [showControllHint, setShowControllHint] = useState(true);

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

    document.addEventListener('object-hover', onObjectHover);
    document.addEventListener('object-activation', onObjectActivation);
    document.addEventListener('player-in-car', onCarActivation);


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

    const loader = new RGBELoader() as any;

    loader.load(
      envMapURL,
      (data) => {
        const map = loader.load(envMapURL);
        map.mapping = EquirectangularReflectionMapping;
        map.encoding = RGBEEncoding;
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
    Engine.renderer.toneMappingExposure = 1;

    createPrefab(WorldPrefab);
    createPrefab(staticWorldColliders);
    createPrefab(JoystickPrefab);
//  setTimeout(() => {
    // createPrefab(rigidBodyBox);
    // createPrefab(rigidBodyBox2);
    createPrefab(RazerLaptop);
    createPrefab(PlayerCharacter);
     createPrefab(CarController);
    //createPrefab(interactiveBox);
  //}, 5000);


    return (): void => {
      document.removeEventListener('object-hover', onObjectHover);
      document.removeEventListener('object-activation', onObjectActivation);
      document.removeEventListener('player-in-car', onCarActivation);

      // cleanup
      console.log('cleanup?!');
      // TODO: use resetEngine when it will be completed. for now just reload
      //document.location.reload();
      resetEngine();
    };
  }, []);

  useEffect(() => {
    const f = (event: KeyboardEvent): void => {
      //hide controlls hint when move/do smth
      setShowControllHint(false);
      // const P_PLAY_PAUSE = 112;
      // if (event.keyCode === 27)
      if (event.keyCode === 192) {
        event.preventDefault();
        toggleEnabled();
      }
      // else if(event.keyCode == P_PLAY_PAUSE)
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

  const mobileGamepadProps = {hovered:hoveredLabel.length > 0, layout: hintBoxData };

  const mobileGamepad = isMobileOrTablet()? <MobileGamepad {...mobileGamepadProps} /> : null;

  const infoBox = !isMobileOrTablet() && infoBoxData ? <InfoBox onClose={() => { setInfoBoxData(null); }} data={infoBoxData} /> : null;
  const hintBox = !isMobileOrTablet() && showControllHint && hintBoxData ? <HintBox layout={hintBoxData} /> : null;


  const hoveredLabelElement = !!!isMobileOrTablet() && hoveredLabel.length > 0 ?
  <div className="hintContainer">Press <span className="keyItem" >E</span> to {hoveredLabel}</div> : null;


  return (
    <>
    {/* <Dialog {...{props:{isOpened:true, content:beginnerHintMessage}}}>{beginnerHintMessage}</Dialog> */}
    {infoBox}
    {hintBox}
    {hoveredLabelElement}
    {terminal}
    {mobileGamepad}
    <BeginnerBox />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);

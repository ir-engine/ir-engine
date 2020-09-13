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
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { AmbientLight, EquirectangularReflectionMapping, Mesh, MeshPhongMaterial, SphereBufferGeometry, sRGBEncoding, TextureLoader } from 'three';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import { connectToInstanceServer, provisionInstanceServer } from '../../redux/instanceConnection/service';
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';



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

  useEffect(() => {
    console.log('initializeEngine!');

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

    console.log("Creating a scene entity to test");
    const levelEntity = createEntity();
    addComponent(levelEntity, AssetLoader, {
      url: "models/City_nocolliders.glb",
      receiveShadow: true,
      castShadow: true,
      onLoaded: () => {
        console.log('level is loaded');
        // TODO: parse Floor_plan
        // TODO: parse Spawn point

        // TODO: this is temporary, to make level floor mach zero
        const level3d = getComponent<Object3DComponent>(levelEntity, Object3DComponent);
        //level3d.value.position.y -= 0.17;
        level3d.value.position.y -= 0;

      }
    });


    createPrefab(PlayerCharacter);

    createPrefab(staticWorldColliders);
    // createPrefab(rigidBodyBox);
    // createPrefab(rigidBodyBox2);
    createPrefab(CarController);
    // createPrefab(interactiveBox);



    // addComponent(createEntity(), AssetLoader, {
    //   url: "models/OldCar.fbx",
    //   receiveShadow: true,
    //   castShadow: true
    // })

    return (): void => {
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
    console.log('instanceConnectionState useEffect')
    console.log(instanceConnectionState)
    if (instanceConnectionState.get('instanceProvisioned') === true && instanceConnectionState.get('updateNeeded') === true) {
      console.log('Calling connectToInstanceServer');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);

  // useEffect(() => {
  //   if (instanceConnectionState.get('instanceProvisioned') == false) {
  //     provisionInstanceServer(locationId);
  //   }
  //   else {
  //     connectToInstanceServer();
  //   }
  // }, []);

  const toggleEnabled = (): void => {
    console.log("enabled ", enabled);
    if (enabled === true) {
      setEnabled(false);
    } else {
      setEnabled(true);
    }
  };

  return (
    enabled && (
      <Terminal
        color='green'
        backgroundColor='black'
        allowTabs={false}
        startState='maximised'
        showCommands={true}
        style={{
          fontWeight: "bold",
          fontSize: "1em",
          position: "fixed",
          bottom: "0",
          width: "100%", 
          // Height is set in termimal itself depending is it expanded.
          /* height: "30%", */
          zIndex: 4000 }}
        commands={commands}
        description={description}
        msg='Interactive terminal. Please consult the manual for commands.'
      />
    )
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);

import { AssetLoader } from '@xr3ngine/engine/src/assets/components/AssetLoader';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { Object3DComponent } from '@xr3ngine/engine/src/common/components/Object3DComponent';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import {
  addComponent,
  createEntity,
  getComponent,
  getMutableComponent,
} from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import {
  DefaultInitializationOptions,
  initializeEngine,
} from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { CarController } from '@xr3ngine/engine/src/templates/car/prefabs/CarController';
import { WorldPrefab } from '@xr3ngine/engine/src/templates/world/prefabs/WorldPrefab';
import { rigidBodyBox } from '@xr3ngine/engine/src/templates/car/prefabs/rigidBodyBox';
import { rigidBodyBox2 } from '@xr3ngine/engine/src/templates/car/prefabs/rigidBodyBox2';
import { staticWorldColliders } from '@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders';
import { CreatorCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/CreatorCharacter';
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
  DirectionalLight,
  TextureLoader,
  PCFSoftShadowMap,
  PointLight,
} from 'three';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { selectInstanceConnectionState } from '../../redux/instanceConnection/selector';
import {
  connectToInstanceServer,
  provisionInstanceServer,
} from '../../redux/instanceConnection/service';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { LocalInputReceiver } from '@xr3ngine/engine/src/input/components/LocalInputReceiver';

import dynamic from 'next/dynamic';
const MobileGamepad = dynamic(
  () => import('../ui/MobileGampad').then((mod) => mod.MobileGamepad),
  { ssr: false }
);

const locationId = 'e3523270-ddb7-11ea-9251-75ab611a30da';
const locationId2 = '489ec2b1-f6b2-46b5-af84-92d094927dd7';
const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state),
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

export const CharacterCreatorPage: FunctionComponent = (props: any) => {
  const {
    instanceConnectionState,
    connectToInstanceServer,
    provisionInstanceServer,
  } = props;
  const [enabled, setEnabled] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState('');

  useEffect(() => {
    console.log('initializeEngine!');

    const onObjectHover = (event: CustomEvent): void => {
      if (event.detail.focused) {
        setHoveredLabel(String(event.detail.label));
      } else {
        setHoveredLabel('');
      }
    };
    const onObjectActivation = (event: CustomEvent): void => {
      window.open(event.detail.url, '_blank');
    };
    document.addEventListener('object-hover', onObjectHover);
    document.addEventListener('object-activation', onObjectActivation);

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

    // Enable shadows
    Engine.renderer.shadowMap.enabled = true;
    Engine.renderer.shadowMap.type = PCFSoftShadowMap;

    const light = new PointLight(0xffffff, 0.8);
    light.position.set(0, 16, 16);
    light.castShadow = true;
    light.shadow.bias = -0.0006;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.camera.position.set(0, 16, 16);
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

    createPrefab(WorldPrefab);
    createPrefab(CreatorCharacter);
    createPrefab(staticWorldColliders);
    /*setTimeout(() => {
      // createPrefab(rigidBodyBox);
      // createPrefab(rigidBodyBox2);
      // createPrefab(CarController)
      // createPrefab(interactiveBox);
    }, 5000)*/

    return (): void => {
      document.removeEventListener('object-hover', onObjectHover);
      document.removeEventListener('object-activation', onObjectActivation);

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
      if (event.keyCode === 27) toggleEnabled();
      else if (event.keyCode == P_PLAY_PAUSE) {
      }
    };
    document.addEventListener('keydown', f);
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
      provisionInstanceServer(locationId);
    } else {
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

  const mobileGamepad = isMobileOrTablet() ? <MobileGamepad /> : null;

  const hoveredLabelElement = hoveredLabel.length ? (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        backgroundColor: 'white',
      }}
    >
      {hoveredLabel}
    </div>
  ) : null;

  return (
    <>
      {hoveredLabelElement}
      {mobileGamepad}
    </>
  );
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterCreatorPage);

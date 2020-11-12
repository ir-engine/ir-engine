import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import { resetEngine } from "@xr3ngine/engine/src/ecs/functions/EngineFunctions";
import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { loadScene } from "@xr3ngine/engine/src/scene/functions/SceneLoading";
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Network } from "../../../engine/src/networking/components/Network";
import { loadActorAvatar } from "../../../engine/src/templates/character/behaviors/loadActorAvatar";
import { setActorAvatar } from "../../../engine/src/templates/character/behaviors/setActorAvatar";
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { generalStateList, setAppLoaded, setAppOnBoardingStep } from '../../redux/app/actions';
import { selectAppOnBoardingStep } from '../../redux/app/selector';
import { client } from '../../redux/feathers';
import store from '../../redux/store';
import { InfoBox } from '../ui/InfoBox';
import LinearProgressComponent from '../ui/LinearProgress';
import MediaIconsBox from "../ui/MediaIconsBox";
import NetworkDebug from '../ui/NetworkDebug/NetworkDebug';
import OnBoardingBox from '../ui/OnBoardingBox';
import OnBoardingDialog from '../ui/OnBoardingDialog';
import TooltipContainer from '../ui/TooltipContainer';

const MobileGamepad = dynamic(() => import("../ui/MobileGampad").then((mod) => mod.MobileGamepad),  { ssr: false });

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;

interface Props {
  setAppLoaded?: any
  sceneId?: string
  onBoardingStep?:number
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  setAppLoaded: bindActionCreators(setAppLoaded, dispatch)
});

export const EnginePage = (props: Props) => {
  const {
    sceneId,
    setAppLoaded,
    onBoardingStep
  } = props;

  const [hoveredLabel, setHoveredLabel] = useState('');
  const [actorEntity, setActorEntity] = useState(null);
  const [actorAvatarId, setActorAvatarId] = useState('Rose');
  const [infoBoxData, setInfoBoxData] = useState(null);
  const [progressEntity, setProgressEntity] = useState('');

  //all scene entities are loaded
  const onSceneLoaded = (event: CustomEvent): void => {
    if (event.detail.loaded) {
      store.dispatch(setAppOnBoardingStep(generalStateList.ALL_DONE));
      setAppLoaded(true);
    }
  };

  //started loading scene entities
  const onSceneLoadedEntity = (event: CustomEvent): void => {
    setProgressEntity(' left ' + event.detail.left);
  };

  const addEventListeners = () => {
    document.addEventListener('scene-loaded', onSceneLoaded);
    document.addEventListener('scene-loaded-entity', onSceneLoadedEntity);
  };

  useEffect(() => {
    addEventListeners();

    init(sceneId).catch((e) => { console.log(e); });

    return (): void => {
      resetEngine();
    };
  }, []);

  useEffect(() => {
    if (actorEntity) {
      setActorAvatar(actorEntity, {avatarId: actorAvatarId});
      loadActorAvatar(actorEntity);
    }
  }, [ actorEntity, actorAvatarId ]);


  async function init(sceneId: string): Promise<any> { // auth: any,
    let service, serviceId;
    console.log("Loading scene with scene ", sceneId);
    const projectResult = await client.service('project').get(sceneId);
    const projectUrl = projectResult.project_url;
    const regexResult = projectUrl.match(projectRegex);
    if (regexResult) {
      service = regexResult[1];
      serviceId = regexResult[2];
    }
    const result = await client.service(service).get(serviceId);
    console.log("Result is ");
    console.log(result);
    loadScene(result);
    const cameraTransform = getMutableComponent<TransformComponent>(
      CameraComponent.instance.entity,
      TransformComponent
    );
    cameraTransform.position.set(0, 1.2, 10);


    const actorEntityWaitInterval = setInterval(() => {
      if (Network.instance?.localClientEntity) {
        console.log('setActorEntity');
        setActorEntity(Network.instance.localClientEntity);
        clearInterval(actorEntityWaitInterval);
      }
    }, 300);

  }


  //mobile gamepad
  const mobileGamepadProps = {hovered:hoveredLabel.length > 0, layout: 'default' };
  const mobileGamepad = isMobileOrTablet() && onBoardingStep >= generalStateList.TUTOR_MOVE ? <MobileGamepad {...mobileGamepadProps} /> : null;



  return (
    <>
      <NetworkDebug />
      <LinearProgressComponent label={`Please wait while the World is loading ...${progressEntity}`} />
      <OnBoardingDialog actorEntity={actorEntity} avatarsList={CharacterAvatars} actorAvatarId={actorAvatarId} onAvatarChange={(avatarId) => {setActorAvatarId(avatarId); }} />
      <OnBoardingBox actorEntity={actorEntity} />
      <MediaIconsBox />
      <TooltipContainer message={hoveredLabel.length > 0 ? hoveredLabel : ''} />
      <InfoBox onClose={() => { setInfoBoxData(null); }} data={infoBoxData} />
      {mobileGamepad}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EnginePage);

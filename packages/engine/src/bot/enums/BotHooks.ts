export enum BotHooks {
  InitializeBot = 'BotHooks_InitializeBot',
  LocationLoaded = 'BotHooks_LocationLoaded',
  SceneLoaded = 'BotHooks_SceneLoaded',
  GetPlayerPosition = 'BotHooks_GetPlayerPosition',
  GetSceneMetadata = 'BotHooks_GetSceneMetadata',
  RotatePlayer = 'BotHooks_RotatePlayer',
  GetClients = 'BotHooks_GetClients'
}

export enum XRBotHooks {
  OverrideXR = 'XRBotHooks_OverrideXR',
  XRSupported = 'XRBotHooks_XRSupported',
  XRInitialized = 'XRBotHooks_XRInitialized',
  StartXR = 'XRBotHooks_StartXR',
  UpdateHead = 'XRBotHooks_UpdateHead',
  UpdateController = 'XRBotHooks_UpdateController',
  PressControllerButton = 'XRBotHooks_PressControllerButton',
  MoveControllerStick = 'XRBotHooks_MoveControllerStick',
  GetXRInputPosition = 'XRBotHooks_GetXRInputPosition',
  TweenXRInputSource = 'XRBotHooks_TweenXRInputSource'
}

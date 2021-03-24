type CommonInteractiveAction = "link" | "infoBox" | "mediaSource";
export interface CommonInteractiveData {
  action: CommonInteractiveAction;
  payload: CommonInteractiveDataPayload;
  interactionText?: string;
}

export interface CommonInteractiveDataPayload {
  name: string;
  url: string;
  buyUrl?: string;
  learnMoreUrl?: string;
  modelUrl?: string;
  iosModelUrl?: string;
  htmlContent?: string;
}

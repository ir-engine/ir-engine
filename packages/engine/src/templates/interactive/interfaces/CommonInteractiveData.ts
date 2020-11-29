import { CommonInteractiveAction } from "../types/CommonInteractiveAction";

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

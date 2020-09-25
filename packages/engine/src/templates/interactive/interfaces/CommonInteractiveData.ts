import { CommonInteractiveAction } from "../types/CommonInteractiveAction";

export interface CommonInteractiveData {
  action: CommonInteractiveAction;
  payload: CommonInteractiveDataPayload;
}

export interface CommonInteractiveDataPayload {
  name: string;
  url: string;
  buyUrl?: string;
  learnMoreUrl?: string;
  modelUrl?: string;
}

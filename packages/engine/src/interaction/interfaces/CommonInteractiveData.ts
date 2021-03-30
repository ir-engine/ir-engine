export interface CommonInteractiveData {
  action: string;
  payload: CommonInteractiveDataPayload;
  interactionText?: string;
}

export interface CommonInteractiveDataPayload {
  payloadUrl: string;
  payloadBuyUrl?: string;
  payloadLearnMoreUrl?: string;
  payloadModelUrl?: string;
  payloadHtmlContent?: string;
}

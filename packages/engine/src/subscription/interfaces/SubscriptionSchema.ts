export interface SubscriptionSchema {
  onAdded?: Array<{
    behavior: any;
    args?: any;
  }>;
  onChanged?: Array<{
    behavior: any;
    args?: any;
  }>;
  onRemoved?: Array<{
    behavior: any;
    args?: any;
  }>;
  onUpdate?: Array<{
    behavior: any;
    args?: any;
  }>;
  onLateUpdate?: Array<{
    behavior: any;
    args?: any;
  }>;
}

export interface SubscriptionSchema {
    onAdded?: {
        behavior: any;
        args?: any;
    }[];
    onChanged?: {
        behavior: any;
        args?: any;
    }[];
    onRemoved?: {
        behavior: any;
        args?: any;
    }[];
    onUpdate?: {
        behavior: any;
        args?: any;
    }[];
    onLateUpdate?: {
        behavior: any;
        args?: any;
    }[];
}

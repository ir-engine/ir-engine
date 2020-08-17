export interface LoadingSchema {
    [key: string]: {
        components?: {
            type: any;
            values?: any;
        }[];
        behaviors?: {
            behavior: any;
            args?: any;
            values?: any;
        }[];
    };
}

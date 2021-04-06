import StaticResourceTypeSeed from './static-resource-type/static-resource-type.seed';
import StaticResourceSeed from './static-resource/static-resource.seed';

type SeedCallback = (ServicesSeedConfig) => Promise<any>;
type ServicesSeedCallback = (obj: any, seed: SeedCallback) => Promise<any>;

interface ServicesSeedConfig {
    count?: number;
    disabled: boolean;
    delete: boolean;
    path: string;
    randomize?: boolean;
    templates?: any[];
    callback?: ServicesSeedCallback;
}

export const services: Array<ServicesSeedConfig> = [
    StaticResourceTypeSeed,
    StaticResourceSeed
  ];

export default services;

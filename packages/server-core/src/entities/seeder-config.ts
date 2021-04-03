import CollectionTypeSeed from './collection-type/collection-type.seed';
import CollectionSeed from './collection/collection.seed';
import ComponentTypeSeed from './component-type/component-type.seed';
import ComponentSeed from './component/component.seed';
import EntitySeed from './entity/entity.seed';

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
    CollectionTypeSeed,
    CollectionSeed,
    EntitySeed,
    ComponentTypeSeed,
    ComponentSeed,
  ];

export default services;

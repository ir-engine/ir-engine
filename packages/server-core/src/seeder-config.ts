
import EntitySeeds from './entities/seeder-config';
import MediaSeeds from './media/seeder-config';
import NetworkingSeeds from './networking/seeder-config';
import PaymentSeeds from './payments/seeder-config';
import SocialSeeds from './social/seeder-config';
import SocialMediaSeeds from './socialmedia/seeder-config';
import UserSeeds from './user/seeder-config';
import WorldSeeds from './world/seeder-config';
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

export const seeds: Array<ServicesSeedConfig> = [
    ...EntitySeeds,
    ...MediaSeeds,
    ...NetworkingSeeds,
    ...PaymentSeeds,
    ...SocialSeeds,
    ...SocialMediaSeeds,
    ...UserSeeds,
    ...WorldSeeds
  ];

export default seeds;
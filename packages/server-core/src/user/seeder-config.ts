import UserRoleSeed from './user-role/user-role.seed';
import User  from './user/user.seed';
import UserRelationshipTypeSeed from './user-relationship-type/user-relationship-type.seed';

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
    UserRelationshipTypeSeed,
    User,
    UserRoleSeed
  ];

export default services;

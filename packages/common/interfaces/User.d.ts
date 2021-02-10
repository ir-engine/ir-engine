import { IdentityProvider } from './IdentityProvider';
import { LocationAdmin } from './LocationAdmin';
import { LocationBan } from './LocationBan';
export declare type RelationshipType = 'friend' | 'requested' | 'blocked' | 'blocking';
export interface User {
    id: string;
    name: string;
    userRole: string;
    identityProviders: IdentityProvider[];
    locationAdmins: LocationAdmin[];
    relationType?: RelationshipType;
    inverseRelationType?: RelationshipType;
    avatarUrl?: string;
    instanceId?: string;
    partyId?: string;
    locationBans?: LocationBan[];
}
export declare const UserSeed: {
    id: string;
    name: string;
    identityProviders: any[];
};
export declare function resolveUser(user: any): User;

import config from '../../config';
import { DEFAULT_AVATAR_ID } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';

export const seed = {
    count: 3,
    disabled: !config.db.forceRefresh,
    delete: config.db.forceRefresh,
    // randomize: false,
    path: 'user',
    templates:
        [
            {
                name: '{{name.firstName}} {{name.lastName}}',
                avatarId: DEFAULT_AVATAR_ID,
                // instanceId: '67890uihi0u98yuijo',
                // userRole: type === 'guest' ? 'guest' : type === 'admin' ? 'admin' : 'user',
                // partyId: '5678uhy789uijk',
                createdAt: "2021-02-26 12:00:00",
                updatedAt: "2021-02-26 12:00:00",
            }
        ]
};

export default seed;

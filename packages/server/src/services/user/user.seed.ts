import config from '../../config';
// import UserSettingsSeed from '../user-settings/user-settings.seed';
import { v1 } from 'uuid';
import { DEFAULT_AVATAR_ID } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';


export const seed = {
    disabled: !config.db.forceRefresh,
    delete: config.db.forceRefresh,
    // randomize: false,
    path: 'user',
    templates:
        [
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'Orange_1',
                name: 'Orange',
                avatarId: DEFAULT_AVATAR_ID,
                // instanceId: '67890uihi0u98yuijo',
                // userRole: type === 'guest' ? 'guest' : type === 'admin' ? 'admin' : 'user',
                // partyId: '5678uhy789uijk',
                createdAt: "2021-02-26 12:00:00",
                updatedAt: "2021-02-26 12:00:00",
                // userSettingsId: UserSettingsSeed.templates.find(template => template.id === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61').id
            },
            {
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'Yellow_1',
                name: 'Yellow',
                avatarId: DEFAULT_AVATAR_ID,
                // instanceId: '67890uihi0u98yuijo',
                // userRole: type === 'guest' ? 'guest' : type === 'admin' ? 'admin' : 'user',
                // partyId: '5678uhy789uijk',
                createdAt: "2021-02-26 12:00:00",
                updatedAt: "2021-02-26 12:00:00",
                // userSettingsId: UserSettingsSeed.templates.find(template => template.id === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61').id
            },{
                // id: '37ce32f0-208d-11eb-b02f-37cfdadfe58c',
                id: 'Green_1',
                name: 'Green',
                avatarId: DEFAULT_AVATAR_ID,
                // instanceId: '67890uihi0u98yuijo',
                // userRole: type === 'guest' ? 'guest' : type === 'admin' ? 'admin' : 'user',
                // partyId: '5678uhy789uijk',
                createdAt: "2021-02-26 12:00:00",
                updatedAt: "2021-02-26 12:00:00",
                // userSettingsId: UserSettingsSeed.templates.find(template => template.id === '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61').id
            }
        ]
};

export default seed;
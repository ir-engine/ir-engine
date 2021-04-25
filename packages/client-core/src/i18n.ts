import editor from '../i18n/en/editor.json';
import user from '../i18n/en/user.json';
import admin from '../i18n/en/admin.json';

export const getI18nConfigs = () => {
    return {
        resources : {
            en: {
                editor,
                user,
                admin,
            },
        },
        namespace: [ 'editor', 'user', 'admin' ],
    };
};

import editor from './i18n/en/editor.json';
import user from './i18n/en/user.json';

export const getI18nConfigs = () => {
    return {
        resources : {
            en: {
                editor,
                user,
            },
        },
        namespace: [ 'editor' ],
    };
};

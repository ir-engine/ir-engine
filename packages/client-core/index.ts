import editor from './i18n/en/editor.json';

export const getI18nConfigs = () => {
    return {
        resources : {
            en: {
                editor,
            },
        },
        namespace: [ 'editor' ],
    };
};

export function validateEmail (email: string): boolean { return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(email); }

export function validatePhoneNumber (phone: string): boolean { return (/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test(phone); }

export class Config {
    static publicRuntimeConfig = {
        title: "The Overlay",
        dev: false,
        loginDisabled: false,
        logo: "./logo.svg",
        apiServer: "https://127.0.0.1:3030",
        gameserver: "https://127.0.0.1:3030",
        siteTitle: "The Overlay",
        siteDescription: "Connected Worlds for Everyone",
        feathersStoreKey: "TheOverlay-Auth-Store",
        localStorageKey: "theoverlay-client-store-key-v1",
        auth: {
            enableSmsMagicLink: true,
            enableEmailMagicLink: true,
            enableUserPassword: true,
            enableGithubSocial: true,
            enableFacebookSocial: true,
            enableGoogleSocial: true,
            enableLinkedInSocial: true,
            enableTwitterSocial: true
        },
        alert: {
            timeout: 10000
        },
        offlineMode: false,
        staticPages: {
            termsOfService: ''
        },
        xr: {
            vrRoomGrid: {
                scenes: []
            }
        }
    };
    static apiUrl = '';
}

export const setRuntime = (runtime: any): void => {
    const newConfig = typeof runtime === 'string' ? JSON.parse(runtime) : runtime;
    Config.publicRuntimeConfig = Object.assign({}, Config.publicRuntimeConfig, newConfig);
    Config.apiUrl = process.env.NODE_ENV === 'production' ? Config.publicRuntimeConfig.apiServer : 'https://127.0.0.1:3030';
};

export function validateEmail (email: string): boolean { return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(email); }

export function validatePhoneNumber (phone: string): boolean { return (/^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/).test(phone); }

export class Config {
    static publicRuntimeConfig = null;
    static apiUrl = '';
}

export const setRuntime = (runtime) => {
    Config.publicRuntimeConfig = runtime;
    Config.apiUrl = process.env.NODE_ENV === 'production' ? Config.publicRuntimeConfig.apiServer : 'https://127.0.0.1:3030';
};

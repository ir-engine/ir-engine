export function validateEmail (email: string): boolean { return (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(email); }

export function validatePhoneNumber (phone: string): boolean { return (/^[0-9]{10}$/).test(phone); }

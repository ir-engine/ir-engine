export const validateEmail = (email: string): boolean => (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/).test(email)

export const validatePhoneNumber = (phone: string): boolean => (/^\+[0-9]+$/).test(phone)

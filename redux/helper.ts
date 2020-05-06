export function validateEmail(email: string): boolean {
    // return (/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email)
    return (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/).test(email)
}
export function validatePhoneNumber(phone: string): boolean {
    return (/^\+[0-9]+$/).test(phone);
}
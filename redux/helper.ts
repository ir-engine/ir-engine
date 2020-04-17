export function validateEmail(email: string): boolean {
    return (/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/).test(email)
}

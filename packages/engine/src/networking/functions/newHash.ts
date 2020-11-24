export const newHash = (name: string, _struct: any) => {
    const strToHash = (s: string) => {
        let hash = 0;

        for (let i = 0; i < s.length; i++) {
            const chr = s.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        hash *= 254785; // times a random number
        return Math.abs(hash).toString(32).slice(2, 6);
    };

    const hash = strToHash(JSON.stringify(_struct) + name);
    if (hash.length !== 4)
        throw new Error('Hash has not length of 4');
    return `#${hash}`;
};

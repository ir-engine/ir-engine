export interface Assemblage {
    components: {
        type: any;
        data?: any;
    }[];
    children?: Assemblage[];
}

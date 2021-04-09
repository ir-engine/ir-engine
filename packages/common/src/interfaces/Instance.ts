export interface Instance {
    id: number
    currentUsers: number
    ipAddress: string
    locationId: string
}

export const InstanceSeed: Instance = {
    id: 0,
    ipAddress: '',
    currentUsers: 0,
    locationId: ''
}
import { Application } from '../declarations'


export default async function (context: any): Promise<void> {
    let results = context.result
    let app = context.app
    let data = context.data

    if (!Array.isArray(results)) {
        results = [results]
    }

    results.map(async function (result: any, index: number) {
        return await addAttribution(result, app, data[index])
    })
}

async function addAttribution (result: any, app: Application, data: any): Promise<any> {
    data.resourceId = result.id
    return app.services.attribution.create(data)
}
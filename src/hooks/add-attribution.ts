import { Application } from '../declarations'

export default async (context: any): Promise<void> => {
  let results = context.result
  const app = context.app
  const data = context.data

  if (!Array.isArray(results)) {
    results = [results]
  }

  results.map(async (result: any, index: number) => {
    return await addAttribution(result, app, data[index])
  })
}

async function addAttribution (result: any, app: Application, data: any): Promise<any> {
  data.resourceId = result.id
  return await app.services.attribution.create(data)
}

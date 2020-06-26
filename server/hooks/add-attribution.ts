export default async function (context: any): Promise<void> {
  const { result, app, data } = context

  if (Array.isArray(result)) {
    return
  }

  if (data.creator) {
    try {
      const response = await app.service('attribution').create(data, context.params)
      await app.service('static-resource').patch(result.id, {
        attributionId: response.id
      })
      return context
    } catch (err) {
      console.log('add-attribution error')
      console.log(err)
    }
  } else {
    return context
  }
}

import logger from "../app/logger";

export default async function (context: any): Promise<void> {
  const { result, app, data } = context;

  if (Array.isArray(result)) {
    return;
  }

  if (data.creator) {
    try {
      data.staticResourceId = result.id;
      await app.service('attribution').create(data, context.params);
      return context;
    } catch (err) {
      console.log('add-attribution error');
      logger.error(err);
    }
  } else {
    return context;
  }
}

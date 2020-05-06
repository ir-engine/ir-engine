export default function (options = {}) {
  return async (context: any): Promise<void> => {
    const sequelize = context.params.sequelize || {}
    const include = sequelize.include || []
    sequelize.include = include.concat((options as any).models.map((model: any) => {
      const newModel = { ...model }
      newModel.model = context.app.services[model.model].Model
      return newModel
    }))

    sequelize.raw = false
    context.params.sequelize = sequelize
    return context
  }
}

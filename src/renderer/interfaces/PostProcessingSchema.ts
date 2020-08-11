export interface PostProcessingSchema {
  passes: {
    effect: any
    options: {
      [key: string]: any
    }
  }[]
}

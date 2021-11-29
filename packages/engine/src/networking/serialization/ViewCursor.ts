export type ViewCursor = { cursor: number } & DataView

export const createViewCursor = (buffer = new ArrayBuffer(100000)): ViewCursor => {
  const view = new DataView(buffer) as ViewCursor
  view.cursor = 0
  return view
}

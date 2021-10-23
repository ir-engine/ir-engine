export const ErrorAction = {
  setReadScopeError: (message: string, statusCode: number) => {
    return { type: 'SET_SCOPE_READ_ERROR' as const, message, statusCode }
  },
  setWriteScopeError: (message: string, statusCode: number) => {
    return { type: 'SET_SCOPE_WRITE_ERROR' as const, message, statusCode }
  }
}
export type ErrorActionType = ReturnType<typeof ErrorAction[keyof typeof ErrorAction]>

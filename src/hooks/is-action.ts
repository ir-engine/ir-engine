export default function (...params: any): any {
  const args = Array.from(params)
  return (hook: any): boolean => {
    return hook.data && args.includes(hook.data.action)
  }
}

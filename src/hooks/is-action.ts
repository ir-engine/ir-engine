export default function (...params: any) {
  const args = Array.from(params)
  return (hook: any) => {
    return hook.data && args.includes(hook.data.action)
  }
}

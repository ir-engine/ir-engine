import { ValueTypeMap, makeInNOutFunctionDesc, toCamelCase } from '../VisualScriptModule'

export function getStringConversionsForValueType({
  values,
  valueTypeName
}: {
  values: ValueTypeMap
  valueTypeName: string
}) {
  const camelCaseValueTypeName = toCamelCase(valueTypeName)

  return [
    makeInNOutFunctionDesc({
      name: `logic/string/convert/to${camelCaseValueTypeName}`,
      label: `To ${camelCaseValueTypeName}`,
      in: ['string'],
      out: valueTypeName,
      exec: (a: string) => values[valueTypeName]?.deserialize(a)
    }),
    makeInNOutFunctionDesc({
      name: `math/${valueTypeName}/convert/toString`,
      label: 'To String',
      in: [valueTypeName],
      out: 'string',
      exec: (a: any) => `${values[valueTypeName]?.serialize(a)}`
    })
  ]
}

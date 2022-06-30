const fs = require("fs")

let result = ""

const constMaterials = fs.readdirSync("./constants").filter((matFile) => !/DefaultArgs/.test(matFile)).map((matFile) => {
    const matID = matFile.split('.')[0]
    result += `import ${matID}, { DefaultArgs as ${matID}DefaultArgs } from './constants/${matFile.replace(/\.ts$/, '')}'\n`
    return matID
})

result += "\nexport const MaterialLibrary = {\n"

constMaterials.forEach((matID, i, arr) => {
    result += `\t${matID}: ${matID}${i + 1<arr.length ? ',' : ''}\n`
})

result += "}\n\n"

result += "export const DefaultArguments = {\n"

constMaterials.forEach((matID, i, arr) => {
    result += `\t${matID}: ${matID}DefaultArgs${i + 1<arr.length ? ',' : ''}\n`
})

result += "}\n"

console.log(constMaterials)

fs.writeFileSync('./MaterialLibrary.ts', result)
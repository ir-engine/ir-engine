const fs = require("fs")

let result = ""

const constMaterials = fs.readdirSync("./constants").map((matFile) => {
    const matID = matFile.split('.')[0]
    result += `import ${matID} from './constants/${matFile.replace(/\.ts$/, '')}'\n`
    return matID
})

result += "export const MaterialLibrary = {\n"

constMaterials.forEach((matID, i, arr) => {
    result += `\t${matID}: ${matID}${i + 1<arr.length ? ',' : ''}\n`
})

result += "}"

console.log(constMaterials)

fs.writeFileSync('./MaterialLibrary.ts', result)
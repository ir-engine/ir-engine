const fs = require("fs")

let result = ""

const constParticles = fs.readdirSync("./library").filter((matFile) => !/DefaultArgs/.test(matFile)).map((matFile) => {
    const matID = matFile.split('.')[0]
    result += `import ${matID}, { DefaultArgs as ${matID}DefaultArgs } from './library/${matFile.replace(/\.ts$/, '')}'\n`
    return matID
})

result += "\nexport const ParticleLibrary = {\n"

constParticles.forEach((matID, i, arr) => {
    result += `\t${matID}: ${matID}${i + 1<arr.length ? ',' : ''}\n`
})

result += "}\n\n"

result += "export const DefaultArguments = {\n"

constParticles.forEach((matID, i, arr) => {
    result += `\t${matID}: ${matID}DefaultArgs${i + 1<arr.length ? ',' : ''}\n`
})

result += "}\n"

console.log(constParticles)

fs.writeFileSync('./ParticleLibrary.ts', result)
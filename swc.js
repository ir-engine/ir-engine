const fs = require ('fs')
const path = require('path')

const newVersion = '1.3.96'

// Find package.json in every dir
function findPackageJsons(dir){
  let packages = []
  fs.readdirSync(dir).forEach(file=>{
    const absolutePath = path.join(dir, file);
    if(fs.statSync(absolutePath).isDirectory()){
      packages = packages.concat(findPackageJsons(absolutePath))
    } else if ( file === 'package.json') {
      packages.push(absolutePath)
    }
  })
  return packages
}

// Update @SWC version package.json
function updateVersion (file) {
  const packageJson = JSON.parse(fs.readFileSync(file, 'utf-8'))

  if(packageJson.dependencies && packageJson.dependencies['@swc/core']){
    packageJson.dependencies['@swc/core'] = newVersion
  }
  fs.writeFileSync(file,JSON.stringify(packageJson, null, 2))
}

const packageJsonFiles = findPackageJsons('./')

packageJsonFiles.forEach(file=> updateVersion(file,newVersion))


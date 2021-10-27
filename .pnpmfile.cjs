function readPackage(pkg) {
    // Workaround to resolve pnpm workspace interdependecies
    const internalDeps = {};
    const externalDeps = {};
    
    Object.entries(pkg.peerDependencies).forEach(([key, value]) => {
        if(key.startsWith('@xrengine')){
            internalDeps[key] = value;
        }else{
            externalDeps[key] = value;
        }
    });

    //External dependencies
    pkg.peerDependencies = externalDeps

    pkg.dependencies = {
      ...internalDeps,
      ...pkg.dependencies,
    }
    
    return pkg;
  }
  
  module.exports = {
    hooks: {
      readPackage,
    },
  };
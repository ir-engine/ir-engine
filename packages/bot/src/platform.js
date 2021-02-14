function getOS() {
    const platform = process.platform;
    console.log(platform);
  
    if (platform.includes('darwin')) {
      os = 'Mac OS';
    } else if (platform.includes('win32')) {
      os = 'Windows';
    } else if (platform.includes('linux')) {
      os = 'Linux';
    }
  
    return os;
}

module.exports = getOS;
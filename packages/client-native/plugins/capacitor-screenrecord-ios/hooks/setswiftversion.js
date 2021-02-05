var fs = require('fs');
var path = require('path');

module.exports = function (context) {
    var plugins = context.opts.plugins;
    if (plugins && plugins.length) {
        if (plugins[0].indexOf('cordova-replay') < 0) {
            return;
        }
    }
    if (context.opts.cordova.platforms.indexOf('ios') <= -1) {
            return;
    }

    var xcode = context.requireCordovaModule('xcode');
    var iosFolder = context.opts.cordova.project ? context.opts.cordova.project.root : path.join(context.opts.projectRoot, 'platforms', 'ios');
    var dir;
    var projectPath;
    var pbxProject;

    if (context.opts.cordova.platforms.indexOf('ios') < 0) {
        throw new Error('This plugin expects the ios platform to exist.');
    }

    // find the project folder by looking for *.xcodeproj
    dir = fs.readdirSync(iosFolder);
    if (dir && dir.length) {
        dir.forEach(function (folder) {
            if (folder.match(/\.xcodeproj$/)) {
                projectPath = path.join(iosFolder, folder, 'project.pbxproj');
            }
        });
    }

    if (!projectPath) {
        throw new Error("Could not find an .xcodeproj folder in: " + iosFolder);
    }

    if (context.opts.cordova.project) {
        pbxProject = context.opts.cordova.project.parseProjectFile(context.opts.projectRoot).xcode;
    } else {
        pbxProject = xcode.project(projectPath);
        pbxProject.parseSync();
    }

    // set swift to 3.0
    pbxProject.addBuildProperty('SWIFT_VERSION', '3.0');

    // write the updated project file
    fs.writeFileSync(projectPath, pbxProject.writeSync());

};
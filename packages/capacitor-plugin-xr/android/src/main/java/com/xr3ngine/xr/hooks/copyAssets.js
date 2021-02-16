module.exports = function(ctx) {

  // make sure android platform is part of build
  if (ctx.opts.platforms.indexOf('android') < 0) {
    return;
  }

  console.error("Copy assets: Started");

  var fs = ctx.requireCordovaModule('fs');
  var path = ctx.requireCordovaModule('path');

  var project_root_dir = path.join(ctx.opts.projectRoot);
  var plugin_assets_dir = path.join(ctx.opts.plugin.dir, "assets");
  
  var assets_files = fs.readdirSync(plugin_assets_dir);
  
  for(var i = 0; i < assets_files.length; i++) {
	  var src_asset = path.join(plugin_assets_dir, assets_files[i]);
	  var dest_asset = path.join(project_root_dir, "platforms/android/assets", assets_files[i]);
	  
    fs.createReadStream(src_asset).pipe(fs.createWriteStream(dest_asset));
  }

  console.error("Copy assets: Finished with success");
}
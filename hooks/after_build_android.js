var fs = require("fs");
  path = require('path'),
  rootdir = process.cwd(),
  android_dir = rootdir + "/platforms/android";
  apk_base_dir = android_dir + "/build/outputs/apk";
//
function findFiles(base,ext,files,result)
{
  files = files || fs.readdirSync(base);
  result = result || [];
  files.forEach(
    function (file) {
      var newbase = path.join(base,file);
      if (fs.statSync(newbase).isDirectory()) {
        result = findFiles(newbase,ext,fs.readdirSync(newbase),result);
      }
      else {
        if (file.substr(-1 * (ext.length+1)) === '.' + ext)
          result.push(newbase);
      }
    }
  );
  return result;
}
//
let subFolders = ["release", "debug"];
for (let f = 0; f < subFolders.length; f++) {
  if (fs.existsSync(apk_base_dir + "/" + subFolders[f])) {
    ext_file_list = findFiles(apk_base_dir + "/" + subFolders[f], 'apk');
    for (let i = 0; i < ext_file_list.length; i++) {
      fs.copyFileSync(ext_file_list[i], ext_file_list[i].replace("/" + subFolders[f] + "/", "/"));
      fs.unlinkSync(ext_file_list[i]);
    }
  }
}
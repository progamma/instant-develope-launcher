var fs = require("fs");
  rootdir = process.cwd(),
  android_dir = rootdir + "/platforms/android";
  gradle_file = rootdir + "/build-extras.gradle";
  dest_gradle_file = android_dir + "/build-extras.gradle";
//
if (fs.existsSync(android_dir) && fs.existsSync(gradle_file)) {
  console.log("Copy " + gradle_file + " to " + android_dir);
  fs.createReadStream(gradle_file).pipe(fs.createWriteStream(dest_gradle_file));
} 
else {
  console.log(gradle_file + " not found. Skipping");
}
//
googleServices_file = rootdir + "/google-services.json";
dest_googleServices_file = android_dir + "/google-services.json";
if (fs.existsSync(android_dir) && fs.existsSync(googleServices_file)) {
  console.log("Copy " + googleServices_file + " to " + android_dir);
  fs.createReadStream(googleServices_file).pipe(fs.createWriteStream(dest_googleServices_file));
} 
else {
  console.log(googleServices_file + " not found. Skipping");
}
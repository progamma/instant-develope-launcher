var fs = require("fs");
  rootdir = process.cwd(),
  android_dir = rootdir + "/platforms/android";
  project_properties_file = android_dir + "/project.properties";
//
if (fs.existsSync(project_properties_file)) {
  console.log("Handling project.properties");
  let properties = fs.readFileSync(project_properties_file).toString("utf-8");
  console.log("properties", properties, typeof properties);
  properties = properties.replace(/com.android.support:support-v4\:\+/g, "com.android.support:support-v4:11.6.2");
  properties = properties.replace(/com.google.android.gms:play-services-location\:\+/g, "com.google.android.gms:play-services-location:11.6.2");
  fs.writeFileSync(project_properties_file, properties);
}
else {
  console.log(project_properties_file + " not found. Skipping");
}
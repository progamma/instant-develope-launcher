const fs = require('fs');
const path = require('path');

module.exports = (context) => {
  // Make sure android platform is part of build
  let isAndroid = false;
  for (var i = 0; i < context.opts.platforms.length; i++) {
    if (context.opts.platforms[i].indexOf("android") !== -1)
      isAndroid = true;
  }
  //
  if (!isAndroid)
    return;
  //
  // Replace target sdk 29 references with target sdk 30
  const platformRoot = path.join(context.opts.projectRoot, 'platforms/android');
  const buildGradleFile = path.join(platformRoot, 'build.gradle');
  const projectPropertiesFile = path.join(platformRoot, 'project.properties');
  const cordovaProjectPropertiesFile = path.join(platformRoot, 'CordovaLib/project.properties');
  //
  let buildGradleFileContent = fs.readFileSync(buildGradleFile).toString('utf8');
  buildGradleFileContent = buildGradleFileContent.replace(/defaultBuildToolsVersion="29.0.2"/g, 'defaultBuildToolsVersion="30.0.3"')
          .replace(/defaultTargetSdkVersion=29/g, 'defaultTargetSdkVersion=30')
          .replace(/defaultCompileSdkVersion=29/g, 'defaultCompileSdkVersion=30');
  fs.writeFileSync(buildGradleFile, buildGradleFileContent);
  //
  let projectPropertiesFileContent = fs.readFileSync(projectPropertiesFile).toString('utf8');
  projectPropertiesFileContent = projectPropertiesFileContent.replace(/target=android-29/g, 'target=android-30');
  fs.writeFileSync(projectPropertiesFile, projectPropertiesFileContent);
  //
  let cordovaProjectPropertiesFileContent = fs.readFileSync(cordovaProjectPropertiesFile).toString('utf8');
  cordovaProjectPropertiesFileContent = cordovaProjectPropertiesFileContent.replace(/target=android-29/g, 'target=android-30');
  fs.writeFileSync(cordovaProjectPropertiesFile, cordovaProjectPropertiesFileContent);
  //
  return Promise.resolve().then(() => console.log('Modifying build.gradle and project.properties is done to target SDK 30'));
};


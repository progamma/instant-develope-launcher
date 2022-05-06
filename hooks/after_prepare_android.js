var fs = require("fs");
rootdir = process.cwd(),
        android_dir = rootdir + "/platforms/android";
gradle_file = rootdir + "/build-extras.gradle";
dest_gradle_file = android_dir + "/build-extras.gradle";
//
module.exports = function (context) {
  if (fs.existsSync(android_dir) && fs.existsSync(gradle_file)) {
    console.log("Copy " + gradle_file + " to " + android_dir);
    fs.createReadStream(gradle_file).pipe(fs.createWriteStream(dest_gradle_file));
  }
  else {
    console.log(gradle_file + " not found. Skipping");
  }
//
  googleServices_file = rootdir + "/google-services.json";
  dest_googleServices_file = android_dir + "/app/google-services.json";
  if (fs.existsSync(android_dir) && fs.existsSync(googleServices_file)) {
    console.log("Copy " + googleServices_file + " to " + android_dir);
    fs.createReadStream(googleServices_file).pipe(fs.createWriteStream(dest_googleServices_file));
  }
  else {
    console.log(googleServices_file + " not found. Skipping");
  }
  //
  let appendTagToQueries = function (tag, name) {
    // Get manifest path
    let manifestPath = android_dir + "/app/src/main/AndroidManifest.xml";
    //
    // If it exists, write tag inside it
    if (fs.existsSync(manifestPath)) {
      let manifestContent = fs.readFileSync(manifestPath).toString("utf-8");
      //
      // If tag already exists, do nothing
      if (manifestContent.indexOf(name) !== -1)
        return;
      //
      // If "queries" tag does not exist, I have to wrap given tag into <queries></queries> and append the whole string under </application>
      if (manifestContent.indexOf("</queries>") === -1)
        manifestContent = manifestContent.replace("</application>", "</application>\n\t" + "<queries>\n" + tag + "\n\t</queries>");
      else // Otherwise simply append given tag to "queries" tag
        manifestContent = manifestContent.replace("</queries>", "\n" + tag + "\n\t</queries>");
      //
      fs.writeFileSync(manifestPath, manifestContent);
    }
  };
  //
  let tag;
  //
  // If speech recognition plugin exists, add "android.speech.RecognitionService" to manifest
  let speechRecognitionPath = rootdir + "/plugins/cordova-plugin-speechrecognition";
  if (fs.existsSync(speechRecognitionPath)) {
    tag = "\t\t<intent>\n\t\t\t<action android:name=\"android.speech.RecognitionService\"/>\n\t\t</intent>";
    appendTagToQueries(tag, "android.speech.RecognitionService");
  }
  //
  // If tts plugin exists, add "android.intent.action.TTS_SERVICE" to manifest
  let ttsPath = rootdir + "/plugins/cordova-plugin-tts";
  if (fs.existsSync(ttsPath)) {
    tag = "\t\t<intent>\n\t\t\t<action android:name=\"android.intent.action.TTS_SERVICE\"/>\n\t\t</intent>";
    appendTagToQueries(tag, "android.intent.action.TTS_SERVICE");
  }
  //
  // If camera plugin exists, add "android.media.action.IMAGE_CAPTURE" and "android.media.action.GET_CONTENT" to manifest (https://github.com/progamma/IndeRT/issues/6777)
  let cameraPath = rootdir + "/plugins/cordova-plugin-camera";
  if (fs.existsSync(cameraPath)) {
    tag = "\t\t<intent>\n\t\t\t<action android:name=\"android.media.action.IMAGE_CAPTURE\"/>\n\t\t</intent>";
    appendTagToQueries(tag, "android.media.action.IMAGE_CAPTURE");
    //
    tag = "\t\t<intent>\n\t\t\t<action android:name=\"android.media.action.GET_CONTENT\"/>\n\t\t</intent>";
    appendTagToQueries(tag, "android.media.action.GET_CONTENT");
  }
};
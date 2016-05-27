/*! Copyright (c) 2015 Little Genius Education Ltd.  All Rights Reserved. */
App.info({
  //id: 'com.gosmartix.smartix', for android
  id: 'com.gosmartix.carmel', //for ios because the app is registered with this id and the APN certificate
  name: 'Carmel',
  description: 'Instant, safe, simple communication for teachers, students and parents',
  author: 'Little Genius Education',
  email: 'contact@gosmartix.com',
  website: 'https://app.gosmartix.com',
  version: '1.2.1',
  buildNumber: '205'
});

//generated with meteor-assets
//see https://github.com/lpender/meteor-assets
App.icons({
  //http://docs.meteor.com/#/full/App-icons
  "iphone_2x":       "resources/carmel/icons/iphone_2x.png", // 120x120
  "iphone_3x":       "resources/carmel/icons/iphone_3x.png", // 180x180
  "ipad":            "resources/carmel/icons/ipad.png", // 76x76
  "ipad_2x":         "resources/carmel/icons/ipad_2x.png", // 152x152
  "ipad_pro":        "resources/carmel/icons/ipad_pro.png", // 167x167
  "ios_settings":    "resources/carmel/icons/ios_settings.png", // 29x29
  "ios_settings_2x": "resources/carmel/icons/ios_settings_2x.png", // 58x58
  "ios_settings_3x": "resources/carmel/icons/ios_settings_3x.png", // 87x87
  "ios_spotlight":   "resources/carmel/icons/ios_spotlight.png", // 40x40
  "ios_spotlight_2x":"resources/carmel/icons/ios_spotlight_2x.png", // 80x80
  "android_mdpi":    "resources/carmel/icons/android_mdpi.png", // 48x48
  "android_hdpi":    "resources/carmel/icons/android_hdpi.png", // 72x72
  "android_xhdpi":   "resources/carmel/icons/android_xhdpi.png", // 96x96
  "android_xxhdpi":  "resources/carmel/icons/android_xxhdpi.png", // 144x144
  "android_xxxhdpi": "resources/carmel/icons/android_xxxhdpi.png" // 192x192
});

App.launchScreens({
  "iphone_2x":                "resources/smartix/splashes/iphone_2x.png", // 640x490
  "iphone5":                  "resources/smartix/splashes/iphone5.png", // 640x1136
  "iphone6":                  "resources/smartix/splashes/iphone6.png", // 750x1334
  "iphone6p_portrait":        "resources/smartix/splashes/iphone6p_portrait.png", // 2208x1242
  "iphone6p_landscape":       "resources/smartix/splashes/iphone6p_landscape.png", // 2208x1242
  "ipad_portrait":            "resources/smartix/splashes/ipad_portrait.png", // 768x1024
  "ipad_portrait_2x":         "resources/smartix/splashes/ipad_portrait_2x.png", // 1536x2048
  "ipad_landscape":           "resources/smartix/splashes/ipad_landscape.png", // 1024x768
  "ipad_landscape_2x":        "resources/smartix/splashes/ipad_landscape_2x.png", // 2048x1536
  "android_mdpi_portrait":    "resources/smartix/splashes/android_mdpi_portrait.png", // 320x480
  "android_mdpi_landscape":   "resources/smartix/splashes/android_mdpi_landscape.png", // 480x320
  "android_hdpi_portrait":    "resources/smartix/splashes/android_hdpi_portrait.png", // 480x800
  "android_hdpi_landscape":   "resources/smartix/splashes/android_hdpi_landscape.png", // 800x480
  "android_xhdpi_portrait":   "resources/smartix/splashes/android_xhdpi_portrait.png", // 720x1280
  "android_xhdpi_landscape":  "resources/smartix/splashes/android_xhdpi_landscape.png", // 1280x720
  "android_xxhdpi_portrait":  "resources/smartix/splashes/android_xxhdpi_portrait.png", // 1080x1440
  "android_xxhdpi_landscape": "resources/smartix/splashes/android_xxhdpi_landscape.png" // 1440x1080
});
//see https://github.com/apache/cordova-plugin-statusbar
//Preferences see https://cordova.apache.org/docs/en/latest/config_ref/index.html

//IOS
App.setPreference('StatusBarOverlaysWebView', 'true');
App.setPreference('StatusBarStyle', 'lightcontent');
//App.setPreference('StatusBarBackgroundColor', '#000000');//If this value is not set, the background color will be transparent.
App.setPreference('ios-orientation-iphone', 'portrait');
App.setPreference('deployment-target', '8.4');
App.setPreference('BackupWebStorage', 'none');
//target-device(string)//Allowed values: handset, tablet, universal//Default: universal

//ANDROID
App.setPreference('android-minSdkVersion', '19'); //19 === android 4.4.2 webview is required
App.setPreference('android-targetSdkVersion', '23');//should be the latest version

//BOTH
App.setPreference('Orientation', 'portrait');
App.setPreference('AutoHideSplashScreen', 'true');
App.setPreference('SplashScreen', 'screen');
App.setPreference('SplashScreenDelay', '3000');
App.setPreference('DisallowOverscroll', 'false');//was webviewbounce

//For Youtube iframe
App.accessRule('https://*.youtube.com/*', { type: 'navigation' } );
App.accessRule('https://*.youtu.be/*', { type: 'navigation' } );

//For Google Docs iframe
App.accessRule('*.google.com/*', { type: 'navigation' } ); 
App.accessRule('*.googleapis.com/*', { type: 'navigation' } );
App.accessRule('*.gstatic.com/*', { type: 'navigation' } );

//as ssl is used, https://localhost:* needs to be allowed
App.accessRule('http://localhost:*');
App.accessRule('https://localhost:*');

//to have hot code push
App.setPreference('WebAppStartupTimeout', '60000');

App.accessRule('*://*.gosmartix.com:*/*');
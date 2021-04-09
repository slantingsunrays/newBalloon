
ZIM Zapps - PWA Tool Instructions 
See https://zimjs.com/zapps 


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
GENERAL 
ZIM at https://zimjs.com is a JavaScript Canvas Framework to code creativity!
ZIM can be used for desktop or mobile apps.
Progressive Web Apps (PWA) can be run like native apps.
PWA replaces 70 steps using GitHub, Cordova, PhoneGap Build, signing keys, etc.
The system is better now and the ZIM Zapps tool makes it even easier.
Please consider a donation to https://zimjs.com/donate - on Patreon.

WARNING - you cannot just run the provided zapp.html as the mobile app.
You need to copy the code from the zapp.html to your app file (such as index.html)
as your app file will be listed in the service worker not the zapp.html file.
Once the code is copied you no longer need the zapp.html file.


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
USING THE FORM TOOL 
Most likely you have already used the form tool to get this readme.
Note that if you leave the fields blank then you will get 
a ZIP file with default values to build from.
The tool will add a PWA() call to the code if the HTML app page 
has a ZIM Frame call with the traditional template format.
If your main app script is in a remote js file then manually add the PWA() 
See https://zimjs.com/docs.html?item=PWA for options.

NOTE: the PWA() code requires ZIM Cat 04 or later. 
The PWA() code just makes a message for user to Add to Home Screen (A2HS).
Custom message code could be used instead with older versions of ZIM.
See https://zimjs.com/pwa for such custom message code.


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
USING THE ZIP 
1. The ZIM Zapps ZIP includes a zapp.html page
REPLACE your app HTML page with the CONTENTS of zapp.html file 
At this point, you will no longer need the zapp.html file.

2. Add the rest of the files to your app directory.
These will include:

    manifest.json - holds app information
    serviceworker.js - holds links to cache local assets
    libraries/ - with local versions of CreateJS and ZIM
    icons/ - various size icons called in manifest 
    readme.txt - this file

3. Make sure that all your assets and scripts use local URLS
and that the relative path to the files is correct in the serviceworker.js
The tool will convert CDN links to local libraries/ links.
Local paths ensure that the app can be used without Internet
and that it will load quickly as files will be loaded from cache.

// For example - if you import a script called scripts/custom.js 
// and the ZIM code has:

    const assets = ["pic.png", "sound.mp3", {font:"FFF", src:"FFF.ttf"}];
    const path = ["assets/"];
    const frame = new Frame({assets, path});

// Then you should have added:
// "assets/" to the PATH field of the ASSETS section of the Tool form
// and "pic.png", "sound.mp3", "FFF.ttf" under FILE NAMES

// The serviceworker.js file would then have the following:
// Keep the ./ and then the name of your app HTML file
// Note the libraries/ folder with the CDN scripts 
// and the call to the local custom script

    var filesToCache = [
      './',
      'index.html',
      'libraries/1.3.3/createjs.js',
      'libraries/cat/04/zim.js',
      'scripts/custom.js',
      'assets/pic.png',
      'assets/sound.mp3',
      'assets/FFF.ttf'
    ];

// These can be manually added or adjusted afterwards

4. To test the PWA() message ** in your app start page on Desktop,
you can adjust the PWA call to:
new PWA(init).show(); 

// show() will show the message for mobile browser
// remember to remove the .show() for your final app!

NOTE: ** the new PWA() message works with ZIM Cat 04 and beyond
if you have an earlier version of ZIM either update ZIM
or use the manual example part-way down at https://zimjs.com/mobile


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CONCLUSION 
Please join us at https://zimjs.com/slack or https://zimjs.com/discord 
to report any issues, get involved in solutions and community!
Share some examples as well!  You will get free user testing ;-).

All the best,

Dr Abstract, Pragma, OwMe and the ZIM Team


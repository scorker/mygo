# Styler Business App

 ![version](https://img.shields.io/badge/version-1.1.7-blue.svg)

### CONFIGURATION

* Replace app key and business identifier in the api/services.js file.

* Replace the icon.png and splash.png files in the assets/images directory with the appropriate images.

* Replace the BusinessLogo and BusinessCover image URLs in the constants/Images.js file

* Configure the app.json file:
    - Name
    - Description
    - Slug
    - Version
    - Ios:
        - Build Number
        - config -> googleSignIn -> reservedClientId
        - bundleIdentifier
    - Android:
        - Version Code
        - Package
    - Extra:
        - DO NOT replace any of the Apple, Facebook or Firebase keys
        - IOS_STANDALONE_CLIENT_ID
        - ANDROID_STANDALONE_CLIENT_ID

### GALIO CONFIGURATION

Please ensure that the following constants in the Galio package are set as follows:

INPUT_TEXT: 18 * 0.875 in the galio-framework/src/theme/sizes.js file (line 42).

# Create a ForgeJS demo with Electron

Electron is a platform that allows to create a native application on any system (Windows, Linux, macOS). It relies on Javascript and HTML/CSS, so it can act as a simple browser. It is composed of two part, a frontend (the "browser") and a backend (the "server"), so it is really convenient to have it without having to install and configure a HTTP server like Apache or nginx, and be able to show a project to someone. The instructions below will help you package your project into a single standalone application.

## How to do it

You will need [nodejs](https://nodejs.org/) installed as a requirement (that's the only one !). Then, open a terminal and run :

````
npm install -g electron-packager
````

Then you need to get two files necessary to the launch of the application, located in `tools/electron`:

+ `main.js` instantiates the application and the window: nothing should be changed in it
+ `package.json` provides information about the application: only the name and descriptions fields should be changed

Copy those files into the root folder of your project.

**Note**: before going further, *ALL* the files of your project must be in this root folder or below, but they cannot be outside of it.

Type in a terminal :

````bash
cd /path/to/project

# for all plateform
electron-packager . --all

# for Windows only
electron packager . --platform=win32 --arch=all

# for macOS only
electron packager . --platform=darwin --arch=all

# for Linux only
electron packager . --platform=linux --arch=all
````

You can also specify the targeted architecture with the flag `--arch` and the values `ia32` or `x86`. The output folder can also be set with the flag `--out`, by default it is the project directory.

## Enjoy !

You now have a standalone application that can be launched without installing or configuring anything on the device that runs it.

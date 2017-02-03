
![](https://cdn.forgejs.org/grav/images/ForgeJS-logo-650x200.png)

## Overview

ForgeJS is modern web-based engine built on standard technologies (HTML5, Javascript and WebGL) that runs on every modern browser to unleash immersive VR content experiences.
It's not only an VR engine, it's a framework for authoring VR content. You can use ForgeJS even if you do not have advance programming skills, ForgeJS is able to read a configuration file and create the experience from it.

## Ressources

Many documentation ressources are available online:
- [API Documentation ](https://releases.forgejs.org/latest/doc/jsdoc) describing all public methods, interfaces, properties and events.
- [JSON reference](https://releases.forgejs.org/latest/doc/json) that explain how to describe your project in the json configuration file.
- [Samples](https://forgejs.org/samples) that demonstrates how to build your experience in the config.json file.
- [Tutorials](https://forgejs.org/tutorials) series that explain how to use some of the ForgeJS features in your project.
- [Known issues and limitations](https://forgejs.org/known-issues-and-limitations).
- [Frequently asqued questions](https://forgejs.org/faq).

## Get the build

The latest build is avaliable online on our [ForgeJS download page](https://forgejs.org/download)

## Licenses

ForgeJS is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.

ForgeJS has the following dependencies:

- [three.js](https://threejs.org/) r83 ([MIT license](https://github.com/mrdoob/three.js/blob/dev/LICENSE))
- [hammer.js](http://hammerjs.github.io/) 2.0.8 ([MIT license](https://github.com/hammerjs/hammer.js/blob/master/LICENSE.md))
- [omnitone](http://googlechrome.github.io/omnitone/#home) 0.1.8 ([Apache 2.0 license](https://github.com/GoogleChrome/omnitone/blob/master/LICENSE))
- [dash.js](https://github.com/Dash-Industry-Forum/dash.js) 2.3.0 ([BSD license](https://github.com/Dash-Industry-Forum/dash.js/blob/development/LICENSE.md))

!!! We made a custom build of three.js with some classes concatenated to it. Theses classes are included in the original three.js repository but not concatenated in the main build. We add EffectComposer, RenderPass, ClearPass, MaskPass, ShaderPass, TexturePass and CopyShader in our three.custom.min.js.

## Quick Start for users

The easiest way to learn how to build a project with ForgeJS is to learn with our [tutorials](https://forgejs.org/tutorials) and get inspired by our [samples](https://forgejs.org/samples) that are available online.

## Quick Start for Developers

### Requirements

Here are a quick resume of differents steps you need to achieve to get ready to code! We will detail these points later.

1. Clone the project from [GitHub](https://github.com/gopro/forgejs).
2. Nodejs and npm installed on your machine.
3. Having the grunt-cli npm package installed globaly.
4. Install the node dev dependencies of the project.

#### Install nodejs

Depending on your platform there are different way to install nodejs. You can find more info on the [nodejs website](http://nodejs.org/).
Generally npm comes with nodejs installation. [npm website](https://www.npmjs.com/)

#### Install grunt-cli

Run this command to install grunt-cli globally on your machine:
````
npm install -g grunt-cli
````

### Install dev dependencies

cd to the project repo folder and run the following command to install dependencies:
````
npm install
````

### Build ForgeJS

With all previous requirements completed, you can now run grunt tasks from the project repo folder. Here are a short list of usefull grunt tasks.

Build a non minified build of ForgeJS:
````
grunt build
````

Build a minified build of ForgeJS:
````
grunt min
````

Generate the documentation and the json reference:
````
grunt doc
````

Auto watch any changes you made in sources to auto build a non minified build of ForgeJS:
````
grunt watch:build
````
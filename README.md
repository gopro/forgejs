
![](https://cdn.forgejs.org/grav/images/ForgeJS-logo-650x200.png)

## Overview

ForgeJS is a modern web-based engine built on standard technologies (HTML5, Javascript and WebGL) that runs on every modern browser to unleash immersive VR content experiences.
It's not only a VR engine, it's a framework for authoring VR content. You can use ForgeJS even if you do not have advanced programming skills: ForgeJS is able to read a configuration file and create the experience from it.

## Ressources

Many documentation ressources are available online:
- [API Documentation ](https://releases.forgejs.org/latest/doc/jsdoc) describes all public methods, interfaces, properties and events.
- [JSON reference](https://releases.forgejs.org/latest/doc/json) explains how to describe your project in the json configuration file.
- [Samples](https://forgejs.org/samples) demonstrates how to build your experience in the config.json file.
- [Tutorials series](https://forgejs.org/tutorials) explains how to use some of the ForgeJS features in your project.
- [Known issues and limitations](https://forgejs.org/known-issues-and-limitations).
- [Frequently asked questions](https://forgejs.org/faq).

## Repositories

Linked project repositories for the ForgeJS javascript framework.
- [Plugins](https://github.com/gopro/forgejs-plugins)
- [Samples](https://github.com/gopro/forgejs-samples)

## Get the build

The latest build is available online on our [ForgeJS download page](https://forgejs.org/download).

## Licenses

ForgeJS is licensed under [Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0) license.

ForgeJS has the following dependencies:

- [three.js](https://threejs.org/) r86 ([MIT license](https://github.com/mrdoob/three.js/blob/dev/LICENSE))
- [hammer.js](http://hammerjs.github.io/) 2.0.8 ([MIT license](https://github.com/hammerjs/hammer.js/blob/master/LICENSE.md))
- [omnitone](http://googlechrome.github.io/omnitone/#home) 0.2.2 ([Apache 2.0 license](https://github.com/GoogleChrome/omnitone/blob/master/LICENSE))
- [dash.js](https://github.com/Dash-Industry-Forum/dash.js) 2.5.0 ([BSD license](https://github.com/Dash-Industry-Forum/dash.js/blob/development/LICENSE.md))

> NOTE: We made a custom build of three.js with some classes concatenated to it. These classes are included in the original three.js repository but not concatenated in the main build. We added EffectComposer, RenderPass, ClearPass, MaskPass, ShaderPass, TexturePass and CopyShader in our three.custom.min.js.

## Quick Start for users

The easiest way to learn how to build a project with ForgeJS is to practice with our [tutorials](https://forgejs.org/tutorials) and get inspiration from our [samples](https://forgejs.org/samples) that are available online.

## Quick Start for Developers

### Setup

1. Clone the project from [GitHub](https://github.com/gopro/forgejs) (`git clone https://github.com/gopro/forgejs`).
2. Install nodejs and npm on your machine (download [here](http://nodejs.org)).
3. Install the grunt-cli npm package (`npm install -g grunt grunt-cli` will install grunt globally on your machine).
4. Install the node dev dependencies of the project (`cd forgejs && npm install`).

### Build ForgeJS

You can now run grunt tasks from the project repo folder. Here is a short list of useful grunt tasks:

Build a non minified build of ForgeJS:
```
grunt build
```

Build a minified build of ForgeJS:
```
grunt min // without logs on FORGE.DEBUG = true
grunt min:debug // with logs
```

Generate the documentation and the json reference:
```
grunt doc
```

Auto watch any changes you made in sources to auto build a non minified build of ForgeJS:
```
grunt watch:build
```

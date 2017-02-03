// ----------------------------------------------------------------------------
// ----------------------------------- Plugin ---------------------------------
// ----------------------------------------------------------------------------

/**
 * @typedef {{boot:function(), update:function(), reset:function(), destroy:function(), viewer:$_Viewer, plugin:$_Plugin}}
 * @name PluginStructure
 * @property {function} boot
 * @property {function} update
 * @property {function} reset
 * @property {function} destroy
 * @property {FORGE.Viewer} viewer
 * @property {FORGE.Plugin} plugin
 */
var PluginStructure;

/**
 * @typedef {{uid:string, name:string, slug:string, version:string, versionName:string, description:string, author:Object, icons:Object, license:string, viewer:Object, device:Object, options:Object, data:Object, events:Object, actions:Object, sources:Array<string>, constructor:string}}
 * @name PluginManifest
 * @property {string} uid - the UID of the plugin
 * @property {string} name - the name of the plugin
 * @property {string} slug - the slug name of the plugin
 * @property {string} version - the version of the plugin
 * @property {string} versionName - the name of the version
 * @property {string} description - the description of the plugin
 * @property {Object} author - the author of the plugin
 * @property {Object} icons - icons associated to the plugin
 * @property {string} license - the license of the plugin
 * @property {Object} viewer - TO DEFINE
 * @property {Object} device - TO DEFINE
 * @property {Object} options - the configuration of the plugin, specific to each plugin
 * @property {Object} data - TO DEFINE
 * @property {Object} events - TO DEFINE
 * @property {Array<string>} actions - TO DEFINE
 * @property {Array<string>} sources - the sources of the plugin
 * @property {string} constructor - the name of the constructor of the plugin
 */
var PluginManifest;

/**
 * @typedef {{data:Object, options:Object, actions:Array<Object>, events:Object}}
 * @name PluginConfiguration
 * @property {Object} data - the eventual data associated to the plugin
 * @property {Object} options - the options of this plugin
 * @property {Array<Object>} actions - the actions attached to this plugin
 * @property {Object} events - TO DEFINE
 */
var PluginConfiguration;
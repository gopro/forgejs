module.exports = function(grunt)
{
    require("google-closure-compiler").grunt(grunt);

    var outputWrapperSimple = "(function() {\n" +
        "  var root = this;\n" +
        "  %output%\n" +
        "  root.FORGE = window.FORGE;\n" +
        "}).call(this);\n";

    var sourceFiles =
    [
        "src/FORGE.js",

        "src/core/BaseObject.js",
        "src/core/Viewer.js",
        "src/core/Tags.js",
        "src/core/Uid.js",

        "src/event/EventDispatcher.js",
        "src/event/Event.js",
        "src/event/Listener.js",

        "src/story/Story.js",
        "src/story/Group.js",
        "src/story/Scene.js",
        "src/story/SceneParser.js",

        "src/math/Math.js",
        "src/math/Quaternion.js",

        "src/geom/Rectangle.js",
        "src/geom/Size.js",

        "src/media/MediaType.js",
        "src/media/MediaFormat.js",
        "src/media/Media.js",

        "src/render/RenderManager.js",
        "src/render/RenderScene.js",
        "src/render/RenderPipeline.js",
        "src/render/RenderDisplay.js",
        "src/render/RenderParams.js",

        "src/render/background/BackgroundRenderer.js",
        "src/render/background/BackgroundType.js",
        "src/render/background/BackgroundMeshRenderer.js",
        "src/render/background/BackgroundShaderRenderer.js",

        "src/render/postProcessing/PostProcessing.js",
        "src/render/postProcessing/EffectComposerType.js",
        "src/render/postProcessing/EffectComposer.js",
        "src/render/postProcessing/PassPosition.js",
        "src/render/postProcessing/TexturePass.js",
        "src/render/postProcessing/ShaderPass.js",
        "src/render/postProcessing/AdditionPass.js",
        "src/render/postProcessing/RenderPass.js",

        "src/render/shader/ShaderChunk.js",
        "build/tmp/forge.glsl.js",
        "src/render/shader/ShaderLib.js",

        "src/render/view/ViewManager.js",
        "src/render/view/ViewType.js",
        "src/render/view/ViewBase.js",
        "src/render/view/ViewFlat.js",
        "src/render/view/ViewGoPro.js",
        "src/render/view/ViewRectilinear.js",

        "src/timeline/Timeline.js",
        "src/timeline/Keyframe.js",
        "src/timeline/Animation.js",
        "src/timeline/MetaAnimation.js",
        "src/timeline/Track.js",

        "src/3d/Object3D.js",
        "src/3d/ObjectRenderer.js",
        "src/3d/Raycaster.js",
        "src/3d/PickingDrawPass.js",
        "src/3d/PickingManager.js",

        "src/hotspots/HotspotManager.js",
        "src/hotspots/Hotspot3D.js",
        "src/hotspots/HotspotSound.js",
        "src/hotspots/HotspotMaterial.js",
        "src/hotspots/HotspotGeometry.js",
        "src/hotspots/HotspotGeometryType.js",
        "src/hotspots/HotspotTransform.js",
        "src/hotspots/HotspotTransformValues.js",
        "src/hotspots/HotspotAnimation.js",
        "src/hotspots/HotspotAnimationTrack.js",
        "src/hotspots/HotspotStates.js",
        "src/hotspots/HotspotType.js",

        "src/camera/Camera.js",
        "src/camera/CameraAnimation.js",
        "src/camera/CameraGaze.js",

        "src/controllers/ControllerType.js",
        "src/controllers/ControllerManager.js",
        "src/controllers/ControllerBase.js",
        "src/controllers/ControllerPointer.js",
        "src/controllers/ControllerKeyboard.js",
        "src/controllers/ControllerGyroscope.js",

        "src/audio/SoundManager.js",
        "src/audio/SoundType.js",
        "src/audio/Sound.js",
        "src/audio/Playlist.js",
        "src/audio/PlaylistManager.js",
        "src/audio/PlaylistTrack.js",

        "src/director/Director.js",
        "src/director/DirectorTrack.js",

        "src/actions/ActionSet.js",
        "src/actions/ActionEventDispatcher.js",
        "src/actions/Action.js",
        "src/actions/ActionManager.js",

        "src/plugin/Plugin.js",
        "src/plugin/PluginEngine.js",
        "src/plugin/PluginManager.js",
        "src/plugin/PluginObjectFactory.js",

        "src/system/Device.js",
        "src/system/System.js",
        "src/system/RequestAnimationFrame.js",
        "src/system/History.js",

        "src/i18n/LocaleManager.js",
        "src/i18n/LocaleString.js",
        "src/i18n/Locale.js",

        "src/input/Keyboard.js",
        "src/input/KeyBinding.js",
        "src/input/Drag.js",
        "src/input/Pointer.js",
        "src/input/Gyroscope.js",

        "src/display/DisplayList.js",
        "src/display/DisplayObject.js",
        "src/display/DisplayObjectContainer.js",

        "src/display/components/Iframe.js",
        "src/display/components/TextField.js",
        "src/display/components/Button.js",
        "src/display/components/ButtonSkin.js",
        "src/display/components/Canvas.js",

        "src/display/image/Image.js",

        "src/display/sprite/Sprite.js",
        "src/display/sprite/SpriteAnimationManager.js",
        "src/display/sprite/SpriteAnimation.js",

        "src/display/video/VideoBase.js",
        "src/display/video/VideoHTML5.js",
        "src/display/video/VideoDash.js",
        "src/display/video/VideoTimeRanges.js",
        "src/display/video/VideoQuality.js",
        "src/display/video/VideoQualityMode.js",
        "src/display/video/VideoFormat.js",

        "src/loader/Cache.js",
        "src/loader/File.js",
        "src/loader/Loader.js",
        "src/loader/DependencyManager.js",

        "src/time/Clock.js",
        "src/time/Timer.js",
        "src/time/TimerEvent.js",

        "src/tween/TweenManager.js",
        "src/tween/Tween.js",
        "src/tween/Easing.js",
        "src/tween/EasingType.js",

        "src/utils/Utils.js",
        "src/utils/Dom.js",
        "src/utils/Map.js",
        "src/utils/Collection.js",
        "src/utils/URL.js",
        "src/utils/Color.js",
        "src/utils/ColorRGBA.js"
    ];

    //The same array excluding FORGE.js for jshint
    var sourceFilesForJSHint = sourceFiles.slice(1);

    var threeVersion = "83";

    var customThree =
    [
        "lib/three.js/three.r"+threeVersion+".js",
        "lib/three.js/postprocessing/EffectComposer.js",
        "lib/three.js/postprocessing/ClearPass.js",
        "lib/three.js/postprocessing/MaskPass.js",
        "lib/three.js/postprocessing/RenderPass.js",
        "lib/three.js/postprocessing/ShaderPass.js",
        "lib/three.js/postprocessing/TexturePass.js",
        "lib/three.js/shaders/CopyShader.js"
    ];

    var customThreeMin =
    [
        "lib/three.js/three.r"+threeVersion+".min.js",
        "lib/three.js/postprocessing/EffectComposer.js",
        "lib/three.js/postprocessing/ClearPass.js",
        "lib/three.js/postprocessing/MaskPass.js",
        "lib/three.js/postprocessing/RenderPass.js",
        "lib/three.js/postprocessing/ShaderPass.js",
        "lib/three.js/postprocessing/TexturePass.js",
        "lib/three.js/shaders/CopyShader.js"
    ];

    // Project tasks configuration ====================================
    grunt.initConfig(
    {
        pkg: grunt.file.readJSON("package.json"),

        clean:
        {
            build: ["build/forge.js", "build/forge.dev.js", "build/log", "build/LICENSE.md"],
            glsl: ["build/tmp/forge.glsl.js"],
            closureStart: ["build/tmp/", "build/forge.min.js", "build/forge.min.js.map"],
            buildTmp: ["build/tmp/"],
            karma: ["tools/karma/fixtures/json/min/*"],
            docCurrent: ["doc/<%= pkg.version %>/"],
            docTmp: ["doc/tmp/"]
        },

        gitinfo:
        {
            options:
            {
                cwd: "./"
            }
        },

        replace:
        {
            log:
            {
                src: ["tools/build/log"],
                dest: "build/",

                replacements: [
                {
                    from: "gitinfo.local.branch.current.SHA",
                    to: "<%= gitinfo.local.branch.current.SHA %>"
                },
                {
                    from: "build-timestamp",
                    to: "<%= grunt.template.today() %>"
                }]
            },

            build:
            {
                src: ["build/forge.js"],
                overwrite: true,

                replacements: [
                {
                    from: "{{pkg.version}}",
                    to: "<%= pkg.version %>"
                }]
            },

            doc:
            {
                src: [ "doc/<%= pkg.version %>/jsdoc/*.html", "doc/<%= pkg.version %>/json/index.html", "doc/<%= pkg.version %>/json/base.html" ],
                overwrite: true,

                replacements: [
                {
                    from: "{{pkg.version}}",
                    to: "<%= pkg.version %>"
                }]
            }
        },

        jsdoc:
        {
            build:
            {
                src: sourceFiles,

                options:
                {
                    destination: "doc/tmp",
                    encoding: "utf8",
                    readme: "README.md",
                    package: "package.json",
                    template: "tools/jsdoc/template/gopro",
                    configure: "tools/jsdoc/jsdoc.conf.json"
                }

            }
        },

        copy:
        {
            license:
            {
                files:
                [
                    {
                        src: ["LICENSE.md"],
                        dest: "build/"
                    }
                ]
            },

            karma:
            {
                files:
                [
                    {
                        expand: true,
                        flatten: false,
                        cwd: "tools/karma/fixtures/json/",
                        src: "*.json",
                        dest: "tools/karma/fixtures/json/min/"
                    }
                ]
            },

            doc:
            {
                files:
                [
                    {
                        expand: true,
                        flatten: false,
                        cwd: "doc/tmp/<%= pkg.name %>/<%= pkg.version %>/",
                        src: "**",
                        dest: "doc/<%= pkg.version %>/jsdoc/"
                    },

                    {
                        expand: true,
                        flatten: false,
                        cwd: "tools/jsdoc/images/",
                        src: "*",
                        dest: "doc/<%= pkg.version %>/jsdoc/images/"
                    },

                    {
                        expand: true,
                        flatten: false,
                        cwd: "tools/reference/static/",
                        src: "**",
                        dest: "doc/<%= pkg.version %>/json/static/"
                    },

                    {
                        expand: true,
                        flatten: false,
                        cwd: "tools/jsdoc/template/gopro/static/fonts",
                        src: "**",
                        dest: "doc/<%= pkg.version %>/json/static/fonts"
                    }
                ]
            },

            closure:
            {
                files:
                [
                    {
                        expand: true,
                        flatten: false,
                        cwd: "build/",
                        src: "forge.js",
                        dest: "build/tmp/"
                    }
                ]
            }
        },

        concat:
        {
            options: {},

            glsl:
            {
                src: "src/render/shader/ShaderChunk/**/*.glsl",
                dest: "build/tmp/forge.glsl.js",
                options: {
                    process: function(src, filepath) {
                        var pathComponents = filepath.split("/");
                        var filename = pathComponents[pathComponents.length - 1].split(".")[0];
                        var out = "var " + filename + " = " + JSON.stringify(
                                src .replace( /[ \t]*\/\/.*\n/g, "" )
                                    .replace( /[ \t]*\/\*[\s\S]*?\*\//g, "" )
                                    .replace( /\n{2,}/g, "\n" )
                        ) + ";\n\n";
                        return out + "FORGE.ShaderChunk[\"" + filename + "\"] = " + filename + ";\n";
                    }
                }
            },

            build:
            {
                src: sourceFiles,
                dest: "build/forge.js"
            },

            customThree:
            {
                src: customThree,
                dest: "lib/three.js/three.r"+threeVersion+".custom.js"
            },

            customThreeMin:
            {
                src: customThreeMin,
                dest: "lib/three.js/three.r"+threeVersion+".custom.min.js"
            },

            customThreeMinWithoutVersion:
            {
                src: customThreeMin,
                dest: "lib/three.js/three.custom.min.js"
            },

            closure:
            {
                src: ["build/tmp/forge.js", "build/tmp/forge.export.js"],
                dest: "build/tmp/forge.js"
            },

            externs:
            {
                src: ["build/tmp/forge.ext.js", "externs/**/*.ext.js"],
                dest: "build/tmp/forge.ext.js"
            }
        },

        "json-minify":
        {
            karma:
            {
                files: "tools/karma/fixtures/json/min/*.json"
            }
        },

        jshint:
        {
            beforeconcat: sourceFilesForJSHint,

            options:
            {
                reporter: require("jshint-stylish"),
                futurehostile: true,
                noarg: true,
                // esversion: 5,
                strict: false,
                expr: true,
                curly: true,
                eqeqeq: true,
                latedef: true,
                nonbsp: true,
                nonew: true,
                unused: false,
                undef: true,
                browser: true,
                devel: false,
                sub: true, //deprecated. Better use JSCS
                predef: [
                    "FORGE", "THREE", "Hammer", "dashjs", "Omnitone"
                ]
            }
        },

        jscs:
        {
            src: sourceFilesForJSHint,

            //@see http://jscs.info/rules
            options:
            {
                fix: false,

                "disallowMultipleSpaces": true,
                "disallowSpaceBeforeComma": true,
                "requireSpaceAfterComma": true,
                "disallowTabs": true,
                "disallowTrailingComma": true,
                "disallowUnusedParams": true,
                "requireCamelCaseOrUpperCaseIdentifiers": false,
                "requireCapitalizedConstructors": true,
                "requireNewlineBeforeBlockStatements": ["if", "else", "try", "finally", "do", "while", "for", "function"],
                "requireSemicolons": true,
                "requireSpaceBetweenArguments": true,
                "requireSpacesInForStatement": true,
                "validateIndentation":
                {
                    "value": 4,
                    "allExcept": ["comments"]
                },
                "validateQuoteMarks":
                {
                    "mark": "\"",
                    "escape": true
                }

                // "jsDoc":
                // {
                //      "checkAnnotations": "closurecompiler",
                //      "checkTypes": "strictNativeCase",
                //      "enforceExistence": "exceptExports"
                //  }
            }
        },

        karma:
        {
            watch:
            {
                configFile: "tools/karma/karma.conf.js",
                autoWatch: false,
                background: true
            },

            standalone:
            {
                configFile: "tools/karma/karma.conf.js",
                autoWatch: true,
                background: false
            }
        },

        watch:
        {
            karma:
            {
                files:
                [
                    "src/**/*.js",
                    "tools/karma/tests/*.js",
                    "tools/karma/fixtures/html/*.html",
                    "tools/karma/fixtures/json/*.json"
                ],

                tasks: ["clear", "clean:karma", "copy:karma", "json-minify:karma", "karma:watch:run"],
            },

            build:
            {
                files:
                [
                    "src/**/*.js",
                    "src/**/*.glsl",
                    "Gruntfile.js"
                ],

                tasks: ["build"]
            },

            closure:
            {
                files: [
                    "src/**/*.js",
                    "Gruntfile.js",
                    "tools/reference/ref/*.json"
                ],

                tasks: ["min"]
            }
        },

        "closure-compiler":
        {
            build:
            {
                files:
                {
                    "build/forge.min.js": ["build/tmp/forge.js"]
                },

                options:
                {
                    externs: ["build/tmp/forge.ext.js"],
                    compilation_level: "ADVANCED_OPTIMIZATIONS",
                    warning_level: "VERBOSE",
                    language_in: "ECMASCRIPT5",
                    language_out: "ECMASCRIPT5",
                    create_source_map: "build/forge.min.js.map",
                    output_wrapper: outputWrapperSimple,
                    // List of warnings can be found here https://github.com/google/closure-compiler/wiki/Warnings
                    // Those with default ok for us are not rewritten here
                    jscomp_off: ["misplacedTypeAnnotation"],
                    jscomp_warning: ["accessControls", "checkEventfulObjectDisposal", "const", "deprecated", "missingProperties", "missingReturn", "undefinedNames"],
                    jscomp_error: ["externsValidation"]
                }
            }
        },

        // Create a file containing each variable to export
        closureExport:
        {
            build:
            {
                options:
                {
                    namespace: "FORGE",

                    // Regex to get each class of src/
                    clazz: /\nvar \$_([A-Z][0-z]+)\s*=\s*\(?function/g,

                    // Regex to get each method of a class of src/
                    method: /\$_([0-z]+)\.prototype\.(?!constructor)([a-z][0-z]+)/g,

                    // Regex to get each object (read namespace) of src/
                    object: /\nvar \$_([0-z]+)\s*=\s*{};/g,

                    // Regex to get each static method (often from namespace) of src/
                    static: /\$_([0-z]+)\.(?!prototype)([a-z][0-z]+)\s*=\s*function/g,

                    // Regex to get each constant of src/
                    constant: /(?:\nvar\s|@const[\s*\/]+)\$_(?!URL|UID|VRV)([A-Z_]{2,}|(?:[A-Z]\w+)\.(?!prototype|call)[A-z.]*\b[0-Z_]{2,})\b/g,

                    singleton: ["src/system/Device.js", "src/core/Uid.js", "src/core/Tags.js"]
                },
                files:
                {
                    "build/tmp/forge.export.js": ["build/tmp/forge.js"]
                }
            }
        },

        referenceConcat:
        {
            build:
            {
                files:
                {
                    "build/reference.json": ["reference/**/*.json"]
                }
            }
        },

        referenceGeneration:
        {
            build:
            {
                options:
                {
                    // The configuration of the generated doc is in pages.json
                    pages: "tools/reference/pages.json",
                    schemas: ["reference/**/*.json"],
                    templates: ["tools/reference/templates/*.handlebars"],
                    dest: "doc/<%= pkg.version %>/json"
                }
            }
        },

        externsGeneration:
        {
            build:
            {
                files:
                {
                    "build/tmp/forge.ext.js": ["build/reference.json"]
                }
            }
        }
    });

    // Load external tasks
    grunt.loadTasks("tools/gruntTasks");

    // Load npm tasks modules
    grunt.loadNpmTasks("grunt-gitinfo");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-text-replace");
    grunt.loadNpmTasks("grunt-json-minify");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-jscs");
    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-clear");
    // grunt.loadNpmTasks("grunt-karma");

    // Only build the documentation
    grunt.registerTask("doc", ["clean:docCurrent", "clean:docTmp", "referenceConcat", "referenceGeneration", "jsdoc", "copy:doc", "replace:doc", "clean:docTmp"]);

    // Run JSHint and JSCS checks
    grunt.registerTask("lint", ["jshint:beforeconcat", "jscs"]);

    // Run a watcher for karma testing
    // grunt.registerTask("test", ["karma:watch:start", "watch"]);

    // Main build task
    grunt.registerTask("build",
    [
        "gitinfo",
        "clean:glsl",
        "clean:build",
        "concat:glsl",
        "concat:build",
        "replace:build",
        "replace:log",
        "copy:license",
        "concat:customThree",
        "clean:glsl",
        "clean:buildTmp"
    ]);

    // Build with closure compiler
    grunt.registerTask("min", "Compile the source with closure compiler", function(arg1)
    {
        var debug = (arg1 === "debug");

        var tasks =
        [
            "gitinfo",
            "clean:glsl",
            "clean:build",
            "clean:closureStart",
            "concat:glsl",
            "concat:build",
            "replace:build",
            "replace:log",
            "copy:license",
            "copy:closure",
            "closureExport:build:" + debug,
            "referenceConcat:build",
            "externsGeneration:build",
            "concat:closure",
            "concat:externs",
            "closure-compiler:build",
            "concat:customThree",
            "concat:customThreeMin",
            "concat:customThreeMinWithoutVersion",
            "clean:glsl",
            "clean:buildTmp"
        ];

        //grunt.option("force", true);

        grunt.task.run(tasks);
    });

};

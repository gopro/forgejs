/**
 * grunt-reference
 *
 * Copyright (c) 2016-2017 GoPro, Inc.
 */

'use strict';

module.exports = function(grunt)
{
    grunt.registerMultiTask('referenceConcat', 'Auto concat and format the JSON reference file for the tour.json.', function()
    {

        // Recursive function, add to every $ref property the #/definition/ suffix
        function refReplacement(obj)
        {
            for (var prop in obj)
            {
                if (prop === '$ref')
                {
                    obj[prop] = '#/definitions/' + obj[prop];
                }
                else if (prop === 'anyOf')
                {
                    for (var i = 0, ii = obj[prop].length; i < ii; i++)
                    {
                        refReplacement(obj[prop][i]);
                    }
                }
                else if (typeof obj[prop] === 'object' && !Array.isArray(obj[prop]))
                {
                    refReplacement(obj[prop]);
                }
            }
        }

        this.files.forEach(function(file)
        {
            // Filter files that does not exist!
            var src = file.src.filter(function(filepath)
            {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath))
                {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                }
                else
                {
                    return true;
                }
            });

            var output = [],
                root, buffer, json;

            // For each file, change the reference and search for the root
            for (var i = 0, filename; i < src.length; i++)
            {
                buffer = grunt.file.read(src[i]);
                json = buffer.toString('utf-8');
                json = JSON.parse(json);

                filename = src[i].split('/');
                // Last one is the name we want
                filename = filename[filename.length - 1];

                refReplacement(json);

                // If it is the root, don't push it into the output array
                if (filename.split('.').shift() === 'root')
                {
                    root = json;
                    root.definitions = {};
                }
                else
                {
                    output.push(json);
                }
            }

            // Add all others objects to the root as definitions
            for (var i = 0; i < output.length; i++)
            {
                root.definitions[output[i].id] = output[i];
            }

            // Stringify it
            root = JSON.stringify(root);

            // And write it
            grunt.file.write(file.dest, root);
        });
    });


    grunt.registerMultiTask('referenceGeneration', 'Generate a reference web page for the tour.json.', function()
    {
        var self = this;

        var done = this.async()

        var Docs = require('json-schema-docs-generator');

        var schemaDriver = new Docs.SchemaDriver(self.data.options.schemas);

        var templateDriver = new Docs.TemplateDriver(self.data.options.templates);

        var pagesJSONbuffer = grunt.file.read(self.data.options.pages);
        var pagesJSON = pagesJSONbuffer.toString('utf-8');
        pagesJSON = JSON.parse(pagesJSON);

        pagesJSON.destination = self.data.options.dest;

        var composer = new Docs.Composer(schemaDriver, templateDriver, pagesJSON);

        composer.addTransform(Docs.SchemaTransformer);

        composer.build()
            .bind(composer)
            .then(composer.write)
            .then(done)
            .catch(function(err)
            {
                grunt.log.errorlns(err.message);
                grunt.log.errorlns(err.stack);
            });
    });
};
/**
 * grunt-reference
 *
 * Copyright (c) 2016-2017 GoPro, Inc.
 */

'use strict';

module.exports = function(grunt)
{
    grunt.registerMultiTask('externsGeneration', 'Generate externs for the tour json, using its reference', function()
    {

        // The big reference array
        var reference = {};

        function getType(prop, notRequired)
        {
            var result = "";

            if (notRequired)
            {
                result += '('
            }

            if (prop.type)
            {
                switch (prop.type)
                {
                    case 'array':
                        result += 'Array<';
                        result += getType(prop.items);
                        result += '>';
                        break;
                    case 'object':
                        result += 'Object';
                        break;
                    default:
                        result += prop.type;
                        break;
                }
            }
            else if (prop.anyOf)
            {
                result += '(';

                for (var i = 0, ii = prop.anyOf.length; i < ii; i++)
                {
                    result += getType(prop.anyOf[i]) + '|';
                }

                result = result.slice(0, -1);
                result += ')';
            }
            else if (prop.$ref)
            {
                result += reference[prop.$ref.slice(14)];
            }
            else
            {
                result += '*';
            }

            if (notRequired)
            {
                result += '|undefined)';
            }

            return result;
        }

        function createTypedef(obj)
        {
            var result = "",
                definitions = obj.definitions,
                currentDef, properties, currentProp;

            // Set reference for all
            for (var key in definitions)
            {
                reference[definitions[key].id] = definitions[key].title;
            }

            // Begin by the root of the reference
            definitions[obj.id] = obj;

            // Then let's go in all the children
            for (var key in definitions)
            {
                currentDef = definitions[key];

                result += '\n/**\n * '
                result += '@typedef {{';

                properties = currentDef.properties;

                for (var k in properties)
                {
                    currentProp = properties[k];

                    result += k + ':';
                    result += getType(currentProp, (!currentDef.required || currentDef.required.indexOf(k) === -1));
                    result += ', ';
                }

                result = result.slice(0, -2);

                result += '}}\n */\n'
                result += 'var ' + currentDef.title + ';\n';
            }

            return result;
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

            var output = "",
                buffer, json;

            // For each file, change the reference and search for the root
            for (var i = 0, filename; i < src.length; i++)
            {
                buffer = grunt.file.read(src[i]);
                json = buffer.toString('utf-8');
                json = JSON.parse(json);

                output += createTypedef(json);
            }

            // And write it
            grunt.file.write(file.dest, output);
        });
    });
};
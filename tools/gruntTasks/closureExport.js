/**
 * grunt-closure-export
 *
 * Copyright (c) 2016-2017 GoPro, Inc.
 */

'use strict';

module.exports = function(grunt)
{
    grunt.registerMultiTask('closureExport', 'Auto extract keywords for Closure compilation and generate file according to those.', function()
    {
        var self = this;

        var output = [];

        var prepareNamespace = function(file)
        {
            var buffer = grunt.file.read(file);
            var content = buffer.toString('utf-8');

            // Prefix every class with $_
            var re = /\bFORGE\.(\w+)\b/g;
            content = content.replace(re, '$$_$1');

            // Add keyword var before each constructor
            re = /\n(\$_[A-Z][0-z]+\s*=\s*)/g;
            content = content.replace(re, '\nvar $1');

            grunt.file.write(file, content);
        };

        /**
         * Remove duplicates from an array
         * @param  {Array} inn
         * @return {Array}
         */
        var removeDuplicates = function(inn)
        {
            var seen = {};
            var out = [];
            var item = null;

            for (var i = 0, j = 0, ii = inn.length; i < ii; i++)
            {
                item = inn[i];

                if (seen[item] !== 1)
                {
                    seen[item] = 1;
                    out[j++] = item;
                }
            }
            return out;
        }

        /**
         * Look accross a file the class, method and other constant that need to be
         * exported during compilation. Those are found using regex defined in the
         * Gruntfile.js. It generates an object that is then read to write a file
         * (see writeFile()).
         */
        var extractFromJS = function(file)
        {
            // var containing the regex at each step
            var re;

            // var containing the result of the regex at each execution
            var rr;

            // namespace
            var ns = self.data.options.namespace;

            // resulting object of this function
            var result = {
                clazz: [],
                methods:
                {},
                object: [],
                static:
                {},
                constant: ['VIEWERS']
            };

            var buffer = grunt.file.read(file);
            var string = buffer.toString('utf-8');

            // Get all the class first
            re = self.data.options.clazz;
            rr = re.exec(string);
            while (rr !== null)
            {
                result.clazz.push(rr[1]);
                rr = re.exec(string);
            }

            // Get all the methods then
            re = self.data.options.method;
            rr = re.exec(string);
            while (rr !== null)
            {
                if (result.methods[rr[1]] == null)
                {
                    result.methods[rr[1]] = [];
                }

                result.methods[rr[1]].push(rr[2]);
                rr = re.exec(string);
            }

            // Search for Object
            re = self.data.options.object;
            rr = re.exec(string);
            while (rr != null)
            {
                result.object.push([rr[1]]);
                rr = re.exec(string);
            }

            // Search for static methods
            re = self.data.options.static;
            rr = re.exec(string);
            while (rr !== null)
            {
                if (result.static[rr[1]] == null)
                {
                    result.static[rr[1]] = [];
                }

                result.static[rr[1]].push([rr[2]]);
                rr = re.exec(string);
            }

            // Search for constant
            re = self.data.options.constant;
            rr = re.exec(string);
            while (rr != null)
            {
                result.constant.push(rr[1]);
                rr = re.exec(string);
            }

            // Remove duplicates
            for (var r in result.methods)
            {
                result.methods[r] = removeDuplicates(result.methods[r]);
            }

            result.constant = removeDuplicates(result.constant);

            return result;
        };

        /**
         * As the Closure Compiler doesn't support very well the method
         * Object.defineProperty-ies, a line before each of this call is inserted,
         * thus suppressing (but in a good way !) warnings about undeclared variable
         * while they're existing.
         */
        var createPropertiesRef = function(file)
        {
            var buffer = grunt.file.read(file);
            var string = buffer.toString('utf-8');
            var content = "";

            var re = /\*\/\s*(Object\.defineProperty\((\$_[\w.]+\.prototype), "(\w+)",)/g;

            content = string.replace(re, '*/\n$2.$3;\n$1');

            var rr = re.exec(string);

            var rew;
            var exceptions = ['length', 'uniforms', 'story', 'opacity'];
            var subexceptions = ['prototype', 'Quaternion', 'thetaphi', 'Pointer', 'Video', 'Hotspot3D'];
            var regexception = /^"[\S ]+(?!\w+)[\S ]+"/gm;

            while (rr != null)
            {
                if (exceptions.indexOf(rr[3]) === -1 && rr[3].length > 1)
                {
                    rew = new RegExp('^[ \\S]*\\b' + rr[3] + '\\b[ \\S]*$', 'gm');
                    content = content.replace(rew, function(m1)
                    {
                        if (regexception.test(m1.trim()) || m1.trim().startsWith('throw'))
                        {
                            return m1;
                        }

                        var rel = new RegExp('\\b([\\w"\\[\\]]+)\\.+(' + rr[3] + '\\b)(?!"|\\(|[\\w.]*"\\])', 'g');

                        return m1.replace(rel, function(m2, p1, p2)
                        {
                            if (subexceptions.indexOf(p1) === -1)
                            {
                                return p1 + '["' + p2 + '"]';
                            }

                            return m2;
                        });
                    });
                }

                rr = re.exec(string);
            }

            re = /ShaderChunk\.(wts|stw)(\w+)/g;
            content = content.replace(re, function(m, m1, m2)
            {
                return 'ShaderChunk["' + m1 + m2 + '"]';
            });

            grunt.file.write('./build/tmp/forge.js', content);
        };

        /**
         * Same task as extractFromJS(), but for singletons that have a specific syntax.
         * Note that regex are not declared in the Gruntfile.js but here.
         */
        var readSingletons = function()
        {
            var buffer, string, clazz;
            var result = {};

            var rec = /FORGE\.([0-z]+)\s*=\s*\(?function/g;
            var rem = /[tT]mp\.prototype\.(?!constructor)([a-z]\w+)/g;
            var rev = /this\.([a-z]\w+)\s?=/g;
            var rr = null;

            for (var i = 0, ii = self.data.options.singleton.length; i < ii; i++)
            {
                buffer = grunt.file.read(self.data.options.singleton[i]);
                string = buffer.toString('utf-8');

                // Name of the singleton
                rr = rec.exec(string);
                while (rr != null)
                {
                    clazz = rr[1];
                    rr = rec.exec(string);
                }

                // Public methods
                rr = rem.exec(string);
                while (rr != null)
                {
                    if (result[clazz] == null)
                    {
                        result[clazz] = [];
                    }
                    result[clazz].push(rr[1]);
                    rr = rem.exec(string);
                }

                // Public properties
                rr = rev.exec(string);
                while (rr != null)
                {
                    if (result[clazz] == null)
                    {
                        result[clazz] = [];
                    }
                    result[clazz].push(rr[1]);
                    rr = rev.exec(string);
                }

                if (result) output[0].static[clazz] = removeDuplicates(result[clazz]);
            }

            return result;
        };

        /**
         * Write the file containing all the exports to do.
         */
        var writeFile = function(file)
        {
            var ns = self.data.options.namespace,
                clazz, methods;
            var addedClazz = [];
            var content = '\/\/ Export values for the Closure Compiler.\n';
            content += '\n\/\/ Namespace\n';
            content += 'window["' + ns + '"] = window["' + ns + '"] || {};\n';

            for (var o in output)
            {
                // Class first, will be :
                // window['FORGE']['Clazz'] = FORGE.Clazz;
                content += '\n\/\/ Class\n';
                clazz = output[o].clazz;
                for (var c in clazz)
                {
                    content += 'window["' + ns + '"]["' + clazz[c] + '"] = $_' + clazz[c] + ';\n';
                    addedClazz.push(clazz[c]);
                }

                // Methods, will be :
                // FORGE.Clazz.prototype['method'] = FORGE.Clazz.prototype.method;
                content += '\n\/\/ Methods\n';
                clazz = output[o].methods;
                for (var c in clazz)
                {
                    methods = clazz[c];
                    for (var m in methods)
                    {
                        content += '$_' + c + '.prototype["' + methods[m] + '"] = $_' + c + '.prototype.' + methods[m] + ';\n';
                    }
                }

                // Static, will be :
                // FORGE.Clazz['method'] = FORGE.Clazz.method;
                content += '\n\/\/ Static Methods\n';
                clazz = output[o].static;
                for (var c in clazz)
                {
                    if (addedClazz.indexOf(c) === -1 && output[o].object.find(function(e, i, a)
                        {
                            return e[0] === c;
                        }))
                    {
                        content += 'window["' + ns + '"]["' + c + '"] = $_' + c + ';\n';
                        addedClazz.push(clazz[c]);
                    }

                    methods = clazz[c];
                    for (var s in methods)
                    {
                        content += '$_' + c + '["' + methods[s] + '"] = $_' + c + '.' + methods[s] + ';\n';
                    }
                }

                // Constant, will be :
                // FORGE.Clazz['CONSTANT'] = FORGE.Clazz.CONSTANT
                content += '\n\/\/ Constants\n';
                clazz = output[o].constant;
                for (var c in clazz)
                {
                    var split = clazz[c].split('.');
                    if (split.length > 1 && split[split.length - 1].search(/^[A-Z][A-Z0-9_]*$/) !== -1)
                    {
                        if (addedClazz.indexOf(split[0]) === -1 && output[o].object.find(function(e)
                            {
                                return e[0] === split[0];
                            }))
                        {
                            content += 'window["' + ns + '"]["' + split[0] + '"] = $_' + split[0] + ';\n';
                            addedClazz.push(split[0]);
                        }

                        // Second level if any
                        if (split.length > 2 && addedClazz.indexOf(split[1]) === -1)
                        {
                            content += 'window["' + ns + '"]["' + split[0] + '"]["' + split[1] + '"] = $_' + split[0] + '.' + split[1] + ';\n';
                            addedClazz.push(split[1]);
                        }

                        content += '$_';

                        for (var i = 0, ii = split.length - 1; i < ii; i++)
                        {
                            content += split[i] + '.';
                        }

                        content = content.slice(0, -1);

                        content += '["' + split[split.length - 1] + '"]';

                        content += ' = $_';

                        for (var i = 0, ii = split.length; i < ii; i++)
                        {
                            content += split[i] + '.';
                        }

                        content = content.slice(0, -1);

                        content += ';\n';
                    }
                    else
                    {
                        content += 'window["' + ns + '"]["' + split[0] + '"] = $_' + split[0] + ';\n';
                    }
                }
            }

            // Write in the file
            grunt.file.write(file.dest, content);
            grunt.log.writeln('File "' + file.dest + '" created.');
        };

        this.files.forEach(function(file)
        {
            //Filter files that does not exist!
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

            for (var i = 0; i < src.length; i++)
            {
                prepareNamespace(src[i]);
                output.push(extractFromJS(src[i]));
                createPropertiesRef(src[i]);
            }

            readSingletons();

            writeFile(file);
        });
    });
};
/**
 * grunt-closure-export
 *
 * Copyright (c) 2016-2017 GoPro, Inc.
 */

'use strict';

module.exports = function(grunt)
{
    var path = require('path');
    var fs = require('fs');

    grunt.registerMultiTask('duplicateForMinification', 'Duplicate files and add min extension.', function() {

        var options = this.options({

        });

        var count = 0;

        this.files.forEach(function(filePair)
        {

            filePair.src.forEach(function(src)
            {
                src = unixifyPath(src);
                var extension = src.substring(src.lastIndexOf(".")+1, src.length);
                var dest = unixifyPath(src.replace(extension, "min."+extension));

                if (grunt.file.isFile(src))
                {
                    grunt.verbose.writeln('Copying ' + src + ' -> ' + dest);
                    grunt.file.copy(src, dest);
                    count++;
                }
            });
        });

        if (count > 0)
        {
            grunt.log.write((count ? 'Complete: copied ' : 'Copied ') + count.toString() + (count === 1 ? ' file' : ' files'));
        }

        grunt.log.writeln();
    });


    var unixifyPath = function(filepath)
    {
        if (process.platform === 'win32')
        {
            return filepath.replace(/\\/g, '/');
        }
        else
        {
            return filepath;
        }
    };

};
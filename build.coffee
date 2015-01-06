#!/usr/bin/env coffee

path = require 'path'
fs   = require 'fs'
__dir  = path.dirname fs.realpathSync(__filename)
srcDir = path.join(__dir, 'src')
{CoffeeScript} = require path.join(__dir, 'lib/coffee-script')

visitDir = (directory) ->
    result = []
    for name in fs.readdirSync directory
        fullname = path.join directory, name
        stat = fs.statSync fullname
        if stat.isDirectory()
            for child in visitDir fullname
                result.push child
        else
            result.push fullname
    return result

walk = (root) ->
    for name in visitDir root
        name[root.length...]

preprocess = (relname, source) ->
    lines = ["sys.defModule '#{relname}', (exports, require, fs) ->"]
    for line in source.split '\n'
        lines.push '    ' + line
    lines.push '    return exports'
    return lines.join '\n'

if require.main is module
    code = ['(function(){']

    code.push CoffeeScript.compile(
        fs.readFileSync(path.join(__dir, 'lib/require.coffee'), encoding:'utf-8')
        header:false, bare:true
    ).trim()

    for name in walk srcDir
        fullname = path.join srcDir, name
        extension = name.split('.').pop()

        switch extension
            when 'coffee'
                name = name[...name.length - '.coffee'.length]
                console.log 'compiling', name
                source = fs.readFileSync fullname, encoding:'utf-8'
                source = preprocess name, source
                js = CoffeeScript.compile(source, header:false, bare:true).trim()
                code.push js
            when 'jpg', 'jpeg', 'png', 'webp', 'gif'
                console.log 'including', name
                code.push "sys.defFile('#{name}');"
            when 'shader', 'glsl', 'fragment', 'vertex'
                console.log 'including', name
                text = fs.readFileSync fullname, 'utf-8'
                text = "#file #{name}\n#{text}"
                js = CoffeeScript.compile('sys.defFile "' + name + '", """' + text + '"""', header:false, bare:true).trim()
                code.push js
            else
                console.log 'including', name
                text = fs.readFileSync fullname, 'utf-8'
                js = CoffeeScript.compile('sys.defFile "' + name + '", """' + text + '"""', header:false, bare:true).trim()
                code.push js

    code.push 'sys.main();'
    code.push '})();'

    code = code.join('\n')
    fs.writeFileSync(path.join(__dir, 'code.js'), code)

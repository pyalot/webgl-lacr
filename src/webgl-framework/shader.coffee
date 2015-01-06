matrix = require 'matrix'

exports.ShaderObj = class ShaderObj

boilerplate = '''
    precision highp int;
    precision highp float;
    #define PI 3.141592653589793
    #define TAU 6.283185307179586
    #define PIH 1.5707963267948966
    #define E 2.7182818284590451
    float angleBetween(vec3 a, vec3 b){return acos(dot(a,b));}

    vec3 gamma(vec3 color){
        return pow(color, vec3(1.0/2.4)); 
    }

    vec3 degamma(vec3 color){
        return pow(color, vec3(2.4));
    }

    vec3 gammasRGB(vec3 color){
        return mix(
            color*12.92,
            pow(color, vec3(1.0/2.4))*1.055-0.055,
            step((0.04045/12.92), color)
        );
    }

    vec3 degammasRGB(vec3 color){
        return mix(
            color/12.92,
            pow((color+0.055)/1.055, vec3(2.4)),
            step(0.04045, color)
        );
    }
    
    float linstep(float edge0, float edge1, float value){
        return clamp((value-edge0)/(edge1-edge0), 0.0, 1.0);
    }
'''

exports.Shader = class Shader extends ShaderObj
    constructor: (@gf, params) ->
        @gl = @gf.gl

        if typeof params is 'string'
            [common, vertex, fragment] = @splitSource params
        else if params instanceof Array
            common = []
            vertex = []
            fragment = []
            for source in params
                [c, v, f] = @splitSource source
                if c.length > 0 then common.push c
                if v.length > 0 then vertex.push v
                if f.length > 0 then fragment.push f

            common = common.join('\n')
            vertex = vertex.join('\n')
            fragment = fragment.join('\n')
        
        @program    = @gl.createProgram()
        @vs         = @gl.createShader @gl.VERTEX_SHADER
        @fs         = @gl.createShader @gl.FRAGMENT_SHADER
        @gl.attachShader @program, @vs
        @gl.attachShader @program, @fs
        
        @setSource common:common, vertex:vertex, fragment:fragment
    
    destroy: ->
        @gl.deleteShader @vs
        @gl.deleteShader @fs
        @gl.deleteProgram @program

    splitSource: (source) ->
        common = []
        vertex = []
        fragment = []
        current = common

        lines = source.trim().split('\n')
        filename = lines.shift().split(' ')[1]

        for line, linenum in lines
            if line.match /vertex:$/
                current = vertex
            else if line.match /fragment:$/
                current = fragment
            else
                current.push "#line #{linenum} #{filename}"
                current.push line

        return [common.join('\n').trim(), vertex.join('\n').trim(), fragment.join('\n').trim()]

    preprocess: (source) ->
        lines = []
        result = []
        filename = 'no file'
        lineno = 1
        for line in source.trim().split('\n')
            match = line.match /#line (\d+) (.*)/
            if match
                lineno = parseInt(match[1], 10)+1
                filename = match[2]
            else
                lines.push
                    source: line
                    lineno: lineno
                    filename: filename
                result.push line
                lineno += 1
        return [result.join('\n'), lines]
    
    setSource: ({common, vertex, fragment}) ->
        @uniformCache = {}
        @attributeCache = {}

        common ?= ''
        @compileShader @vs, [common, vertex].join('\n')
        @compileShader @fs, [common, fragment].join('\n')
        @link()
    
    compileShader: (shader, source) ->
        source = [boilerplate, source].join('\n')
        [source, lines] = @preprocess source

        @gl.shaderSource shader, source
        @gl.compileShader shader

        if not @gl.getShaderParameter shader, @gl.COMPILE_STATUS
            error = @gl.getShaderInfoLog(shader)
            throw @translateError error, lines
    
    link: ->
        @gl.linkProgram @program

        if not @gl.getProgramParameter @program, @gl.LINK_STATUS
            throw new Error("Shader Link Error: #{@gl.getProgramInfoLog(@program)}")
    
    translateError: (error, lines) ->
        result = ['Shader Compile Error']
        for line, i in error.split('\n')
            match = line.match /ERROR: \d+:(\d+): (.*)/
            if match
                lineno = parseFloat(match[1])-1
                message = match[2]
                sourceline = lines[lineno]
                result.push "File \"#{sourceline.filename}\", Line #{sourceline.lineno}, #{message}"
                result.push "   #{sourceline.source}"
            else
                result.push line

        return result.join('\n')
    
    attributeLocation: (name) ->
        location = @attributeCache[name]
        if location is undefined
            location = @gl.getAttribLocation @program, name
            if location >= 0
                @attributeCache[name] = location
                return location
            else
                @attributeCache[name] = null
                return null
        else
            return location
    
    uniformLocation: (name) ->
        location = @uniformCache[name]
        if location is undefined
            location = @gl.getUniformLocation @program, name
            if location?
                @uniformCache[name] = location
                return location
            else
                @uniformCache[name] = null
                return null
        else
            return location
    
    use: ->
        if @gf.currentShader isnt @
            @gf.currentShader = @
            @gl.useProgram @program

    mat4: (name, value) ->
        if value instanceof matrix.Mat4
            value = value.data

        location = @uniformLocation name
        if location?
            @use()
            @gl.uniformMatrix4fv location, false, value
        
        return @
    
    vec2: (name, a, b) ->
        location = @uniformLocation name

        if location?
            @use()
            if a instanceof Array
                @gl.uniform2fv location, a
            else
                @gl.uniform2f location, a, b
        return @

    vec3: (name, a, b, c) ->
        location = @uniformLocation name

        if location?
            @use()
            if a instanceof Array
                @gl.uniform3fv location, a
            else
                @gl.uniform3f location, a, b, c
        return @

    int: (name, value) ->
        location = @uniformLocation name
        if location?
            @use()
            @gl.uniform1i location, value
        return @

    uniformSetter: (obj) ->
        obj.setUniformsOn(@)
        return @

    float: (name, value) ->
        location = @uniformLocation name
        if location?
            @use()
            @gl.uniform1f location, value
        return @

exports.ShaderProxy = class ShaderProxy extends ShaderObj
    constructor: (@shader=null) ->
    
    attributeLocation: (name) ->
        @shader.attributeLocation(name)

    uniformLocation: (name) ->
        @shader.uniformLocation(name)

    use: ->
        @shader.use()
        return @

    mat4: (name, value) ->
        @shader.mat4 name, value
        return @

    vec2: (name, a, b) ->
        @shader.vec2 name, a, b
        return @

    vec3: (name, a, b, c) ->
        @shader.vec3 name, a, b, c
        return @

    int: (name, value) ->
        @shader.int name, value
        return @

    uniformSetter: (obj) ->
        @shader.uniformSetter obj
        return @

    float: (name, value) ->
        @shader.float name, value
        return @

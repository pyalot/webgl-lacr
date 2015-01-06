require 'shims'
texture = require 'texture'
matrix = require 'matrix'
vector = require 'vector'

State = require 'state'
VertexBuffer = require 'vertexbuffer'
{Shader, ShaderProxy} = require 'shader'
FrameBuffer = require 'framebuffer'

exports = class WebGLFramework
    constructor: (params={}) ->
        debug = params.debug ? false
        delete params.debug
        
        perf = params.perf ? false
        delete params.perf

        @canvas = params.canvas ? document.createElement('canvas')
        delete params.canvas

        @gl = @getContext 'webgl', params

        @gl.getExtension('OES_standard_derivatives')
        @gl.getExtension('OES_texture_float')
        @gl.getExtension('OES_texture_half_float')
        @gl.getExtension('OES_texture_float_linear')
        @gl.getExtension('OES_texture_half_float_linear')
        @gl.getExtension('WEBGL_color_buffer_float')
        @gl.getExtension('EXT_color_buffer_half_float')

        # might be slower than manual pointer handling
        #if @haveExtension('OES_vertex_array_object')
        #    @vao = @gl.getExtension('OES_vertex_array_object')
        #else
        #    @vao = null
        
        @vao = null

        if not @gl?
            @gl = @getContext 'experimental-webgl'

        if not @gl?
            throw new Error 'WebGL is not supported'

        if window.WebGLPerfContext? and perf
            console.log 'webgl perf context enabled'
            @gl = new WebGLPerfContext.create @gl
        else if window.WebGLDebugUtils? and debug
            console.log 'webgl debug enabled'
            @gl = WebGLDebugUtils.makeDebugContext @gl, (err, funcName, args) ->
                throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName

        @currentVertexBuffer = null
        @currentShader = null
        @currentFramebuffer = null
        @currentState = null

        @maxAttribs = @gl.getParameter @gl.MAX_VERTEX_ATTRIBS
        @vertexUnits = for i in [0...@maxAttribs]
            {enabled:false, pointer:null, location:i}

        @lineWidth = 1

        @quadVertices = @vertexbuffer
            pointers: [
                {name:'position', size:2}
            ]
            vertices: [
                -1, -1,  1, -1,  1,  1,
                -1,  1, -1, -1,  1,  1,
            ]

    haveExtension: (search) ->
        for name in @gl.getSupportedExtensions()
            if name.indexOf(search) >= 0
                return true
        return false

    getContext: (name, params) ->
        try
            return @canvas.getContext(name, params)
        catch error
            return null

    state: (params) -> new State(@, params)
    vertexbuffer: (params) -> new VertexBuffer(@, params)
    framebuffer: (params) -> new FrameBuffer(@, params)
    shader: (params) -> new Shader(@, params)
    shaderProxy: (shader) -> new ShaderProxy(shader)

    mat4: (view) -> new matrix.Mat4(view)
    vec3: (x, y, z) -> new vector.Vec3(x,y,z)

    frameStart: ->
        if @canvas.offsetWidth != @canvas.width
            @canvas.width = @canvas.offsetWidth
        
        if @canvas.offsetHeight != @canvas.height
            @canvas.height = @canvas.offsetHeight

        if @gl.performance?
            @gl.performance.start()

    frameEnd: ->
        if @gl.performance?
            @gl.performance.stop()
    
    texture2D: (params) ->
        return new texture.Texture2D @, params

    getExtension: (name) ->
        @gl.getExtension name

    htmlColor2Vec: (value) ->
        r = parseInt(value[...2], 16)/255
        g = parseInt(value[2...4], 16)/255
        b = parseInt(value[4...], 16)/255
        return {r:r, g:g, b:b}

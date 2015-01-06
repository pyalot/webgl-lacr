util = require 'util'

VertexBuffer = require 'vertexbuffer'
{ShaderObj} = require 'shader'
FrameBuffer = require 'framebuffer'

exports = class State
    constructor: (@gf, params) ->
        @gl = @gf.gl

        if params.shader instanceof ShaderObj
            @shader = params.shader
            @ownShader = false
        else
            @shader = @gf.shader params.shader
            @ownShader = true

        if params.framebuffer?
            if params.framebuffer instanceof FrameBuffer
                @framebuffer = @params.framebuffer
                @ownFramebuffer = false
            else
                @framebuffer = @gf.framebuffer params.framebuffer
                @ownFramebuffer = true
        else
            @framebuffer = null
            @ownFramebuffer = false

        if params.vertexbuffer?
            if params.vertexbuffer instanceof VertexBuffer
                @vertexbuffer = params.vertexbuffer
                @ownVertexbuffer = false
            else
                @vertexbuffer = @gf.vertexbuffer params.vertexbuffer
                @ownVertexbuffer = true
        else
            @vertexbuffer = @gf.quadVertices
            @ownVertexBuffer = false

        @pointers = for location in [0...@gf.maxAttribs]
            null

        for pointer in @vertexbuffer.pointers
            location = @shader.attributeLocation pointer.name
            if location?
                pointer = util.clone pointer
                pointer.location = location
                @pointers[location] = pointer

        @texturesByName = {}
        @textures = []

        @depthTest = params.depthTest ? false
        @depthWrite = params.depthWrite ? true

        if params.cull?
            @cullFace = @gl[params.cull.toUpperCase()] ? @gl.BACK
        else
            @cullFace = false

        @lineWidth = params.lineWidth ? 1

        if params.blend?
            switch params.blend
                when 'alpha'
                    @blend = @blendAlpha
                else
                    throw new Error('blend mode is not implemented: ' + params.blend)
        else
            @blend = null

        if params.uniforms?
            for uniform in params.uniforms
                @[uniform.type](uniform.name, uniform.value)

        if @gf.vao?
            @vao = @gf.vao.createVertexArrayOES()
            @gf.vao.bindVertexArrayOES @vao
            @setPointers()
            @gf.vao.bindVertexArrayOES null
        else
            @vao = null

    destroy: ->
        if @ownShader
            @shader.destroy()
        if @ownBuffer
            @vertexbuffer.destroy()

        if @vao?
            @gf.vao.deleteVertexArrayOES @vao
        
    blendAlpha: =>
        @gl.blendFunc @gl.SRC_ALPHA, @gl.ONE_MINUS_SRC_ALPHA
        @gl.enable @gl.BLEND

    clearColor: (r=0, g=0, b=0, a=1) ->
        @gl.clearColor r, g, b, a
        @gl.clear @gl.COLOR_BUFFER_BIT
        return @

    setViewport: (width, height) ->
        width ?= @gl.canvas.width
        height ?= @gl.canvas.height

        @gl.viewport 0, 0, width, height

    setPointers: ->
        @vertexbuffer.bind()
        for pointer, location in @pointers
            if pointer?
                if not @gf.vertexUnits[location].enabled
                    @gl.enableVertexAttribArray pointer.location

                @gl.vertexAttribPointer(
                    pointer.location,
                    pointer.size,
                    pointer.type,
                    false,
                    @vertexbuffer.stride,
                    pointer.offset
                )
            else
                if @gf.vertexUnits[location].enabled
                    @gl.disableVertexAttribArray location

    setupVertexBuffer: ->
        if @vao?
            @gf.vao.bindVertexArrayOES @vao
        else
            @setPointers()

    setupState: ->
        if @depthTest then @gl.enable @gl.DEPTH_TEST
        else @gl.disable @gl.DEPTH_TEST

        @gl.depthMask @depthWrite

        if @cullFace
            @gl.enable @gl.CULL_FACE
            @gl.cullFace @cullFace
        else
            @gl.disable @gl.CULL_FACE

        if @blend?
            @blend()
        else
            @gl.disable @gl.BLEND

        if @vertexbuffer.mode is @gl.LINES or @vertexbuffer.mode is @gl.LINE_STRIP
            if @gf.lineWidth isnt @lineWidth
                @gf.lineWidth = @lineWidth
                @gl.lineWidth @lineWidth
        
        @shader.use()

        for texture, unit in @textures
            texture.texture.bind(unit)
            @int texture.name, unit
        
        if @framebuffer?
            @framebuffer.use()
        else
            if @gf.currentFramebuffer?
                @gf.currentFramebuffer.unuse()
       
        @setupVertexBuffer()

        @gf.currentState = @

    draw: (first, count) ->
        if @framebuffer?
            @framebuffer.viewport()
        else
            @setViewport()
        
        if @gf.currentState isnt @
            @setupState()
        @vertexbuffer.draw(first, count)

        return @

    mat4: (name, value) ->
        @shader.mat4 name, value
        return @

    int: (name, value) ->
        @shader.int name, value
        return @
    
    vec2: (name, a, b) ->
        @shader.vec2 name, a, b
        return @

    vec3: (name, a, b, c) ->
        @shader.vec3 name, a, b, c
        return @

    uniformSetter: (obj) ->
        @shader.uniformSetter obj
        return @

    float: (name, value) ->
        @shader.float name, value
        return @

    sampler: (name, texture) ->
        stored = @texturesByName[name]
        if not stored?
            stored = name:name, texture:texture
            @texturesByName[name] = stored
            @textures.push stored

        if stored.texture isnt texture
            stored.texture = texture

        return @

    bind: (unit=0) ->
        if @framebuffer?
            @framebuffer.bind unit
        else
            throw new Error('State has no attached framebuffer')

        return @

    generateMipmap: ->
        if @framebuffer?
            @framebuffer.generateMipmap()
        else
            throw new Error('State has no attached framebuffer')

        return @

    vertices: (data) ->
        @vertexbuffer.vertices data
        return @

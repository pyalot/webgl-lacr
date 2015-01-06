exports.Texture2D = class Texture2D
    constructor: (@gf, params) ->
        @gl = @gf.gl
        @target = @gl.TEXTURE_2D
        @handle = @gl.createTexture()
        @channels = @gl[(params.channels ? 'rgba').toUpperCase()]
        @type = @gl[(params.type ? 'unsigned_byte').toUpperCase()]
        
        if params.data?
            @data params.data
        else
            @size params.width, params.height

        filter = params.filter ? 'nearest'
        if typeof filter == 'string'
            @[filter]()
        else
            minify = @gl[filter.minify.toUpperCase()] ? @gl.LINEAR
            magnify = @gl[filter.magnify.toUpperCase()] ? @gl.LINEAR
            @gl.texParameteri @target, @gl.TEXTURE_MAG_FILTER, magnify
            @gl.texParameteri @target, @gl.TEXTURE_MIN_FILTER, minify

            if minify in [@gl.NEAREST_MIPMAP_NEAREST, @gl.LINEAR_MIPMAP_NEAREST, @gl.NEAREST_MIPMAP_LINEAR, @gl.LINEAR_MIPMAP_LINEAR]
                @generateMipmap()

            if filter.anisotropy
                @anisotropy()

        clamp = params.clamp ? 'edge'
        @[clamp]()

        if params.anisotropy
            @anisotropy()

    destroy: ->
        @gl.deleteTexture @handle

    generateMipmap: ->
        @mipmapped = true
        @bind()
        @gl.generateMipmap(@target)

    anisotropy: ->
        @anisotropic = true
        ext = (
            @gl.getExtension 'EXT_texture_filter_anisotropic' ?
            @gl.getExtension 'WEBKIT_EXT_texture_filter_anisotropic' ?
            @gl.getExtension 'MOZ_EXT_texture_filter_anisotropic' ?
            @gl.getExtension 'O_EXT_texture_filter_anisotropic' ?
            @gl.getExtension 'MS_EXT_texture_filter_anisotropic'
        )
        if ext
            max = @gl.getParameter ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT
            @gl.texParameterf @target, ext.TEXTURE_MAX_ANISOTROPY_EXT, max
        
    data: (data) ->
        @bind()

        @width = data.width
        @height = data.height
        @gl.texImage2D @target, 0, @channels, @channels, @type, data
        return @

    size: (@width, @height) ->
        @bind()
        @gl.texImage2D @target, 0, @channels, @width, @height, 0, @channels, @type, null
        return @
    
    linear: ->
        @bind()

        @gl.texParameteri @target, @gl.TEXTURE_MAG_FILTER, @gl.LINEAR
        @gl.texParameteri @target, @gl.TEXTURE_MIN_FILTER, @gl.LINEAR
        return @
    
    nearest: ->
        @bind()

        @gl.texParameteri @target, @gl.TEXTURE_MAG_FILTER, @gl.NEAREST
        @gl.texParameteri @target, @gl.TEXTURE_MIN_FILTER, @gl.NEAREST
        return @
    
    repeat: ->
        @bind()

        @gl.texParameteri @target, @gl.TEXTURE_WRAP_S, @gl.REPEAT
        @gl.texParameteri @target, @gl.TEXTURE_WRAP_T, @gl.REPEAT
        return @
    
    edge: ->
        @bind()

        @gl.texParameteri @target, @gl.TEXTURE_WRAP_S, @gl.CLAMP_TO_EDGE
        @gl.texParameteri @target, @gl.TEXTURE_WRAP_T, @gl.CLAMP_TO_EDGE
        return @
    
    bind: (unit=0) ->
        @gl.activeTexture @gl.TEXTURE0+unit
        @gl.bindTexture @target, @handle
        return @

texture = require 'texture'

exports = class Framebuffer
    constructor: (@gf, params) ->
        @gl = @gf.gl

        @buffer = @gl.createFramebuffer()

        if params.color instanceof texture.Texture2D
            @color params.color
            @ownColor = false
        else
            @color @gf.texture2D params.color
            @ownColor = true

    use: ->
        if @gf.currentFramebuffer isnt @
            @gf.currentFramebuffer = @
            @gl.bindFramebuffer @gl.FRAMEBUFFER, @buffer
        return @

    unuse: ->
        if @gf.currentFramebuffer?
            @gf.currentFramebuffer = null
            @gl.bindFramebuffer @gl.FRAMEBUFFER, null
        return @

    check: ->
        result = @gl.checkFramebufferStatus @gl.FRAMEBUFFER
        switch result
            when @gl.FRAMEBUFFER_UNSUPPORTED
                throw 'Framebuffer is unsupported'
            when @gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT
                throw 'Framebuffer incomplete attachment'
            when @gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS
                throw 'Framebuffer incomplete dimensions'
            when @gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT
                throw 'Framebuffer incomplete missing attachment'
        return @

    color: (@colorTexture) ->
        @use()
        @gl.framebufferTexture2D @gl.FRAMEBUFFER, @gl.COLOR_ATTACHMENT0, @colorTexture.target, @colorTexture.handle, 0
        @check()
        @unuse()
        return @
    
    destroy: ->
        @gl.deleteFramebuffer @buffer
        if @ownColor
            @color.destroy()

        return @

    viewport: (width, height) ->
        width ?= @colorTexture.width
        height ?= @colorTexture.height
        @gl.viewport 0, 0, width, height

    bind: (unit=0) ->
        @colorTexture.bind unit

    generateMipmap: ->
        @colorTexture.generateMipmap()

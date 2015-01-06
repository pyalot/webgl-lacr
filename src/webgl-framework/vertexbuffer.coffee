util = require 'util'

exports = class VertexBuffer
    constructor: (@gf, {pointers, vertices, mode, stride}) ->
        @gl = @gf.gl
        @buffer = @gl.createBuffer()
        
        if mode?
            @mode = @gl[mode.toUpperCase()]
        else
            @mode = @gl.TRIANGLES

        offset = 0
        
        @pointers = for pointer in pointers
            pointer = util.clone pointer

            pointer.size ?= 4

            pointer.type = @gl.FLOAT
            pointer.typeSize = 4
            pointer.byteSize = pointer.typeSize * pointer.size
            pointer.offset = offset
            offset += pointer.byteSize
            pointer

        @stride = offset
        @vertices vertices

    destroy: ->
        @gl.deleteBuffer @buffer
        return @

    vertices: (data) ->
        if data instanceof Array
            data = new Float32Array data

        @count = data.buffer.byteLength/@stride

        @gl.bindBuffer @gl.ARRAY_BUFFER, @buffer
        @gl.bufferData @gl.ARRAY_BUFFER, data, @gl.STATIC_DRAW
        @gl.bindBuffer @gl.ARRAY_BUFFER, null
        return @
    
    bind: ->
        if @gf.currentVertexbuffer isnt @
            @gf.currentVertexbuffer = @
            @gl.bindBuffer @gl.ARRAY_BUFFER, @buffer
        return @

    unbind: ->
        if @gf.currentVertexbuffer?
            @gf.currentVertexbuffer = null
            @gl.bindBuffer @gl.ARRAY_BUFFER, null
    
    draw: (first, count) ->
        first ?= 0
        count ?= @count
        @gl.drawArrays @mode, first, count
        return @

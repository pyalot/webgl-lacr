exports = class Pointer
    constructor: (element, onMove) ->
        @onMove = onMove ? -> null

        @pressed = false
        @x = null
        @y = null

        element.addEventListener 'mousedown', (event) =>
            @pressed = true

        element.addEventListener 'mouseup', (event) =>
            @pressed = false

        element.addEventListener 'mousemove', (event) =>
            rect = element.getBoundingClientRect()
            x = event.clientX - rect.left
            y = event.clientY - rect.top

            if @x?
                dx = @x - x
                dy = @y - y
            else
                dx = 0
                dy = 0

            @x = x
            @y = y
            @onMove @x, @y, dx, dy

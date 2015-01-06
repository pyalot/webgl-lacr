tau = Math.PI*2

exports.Vec3 = class Vec3
    constructor: (@x=0, @y=0, @z=0) -> null

    set: (@x=0, @y=0, @z=0) -> return @

    rotatey: (angle) ->
        rad = tau*(angle/360)
        s = Math.sin rad
        c = Math.cos rad

        x = @z*s + @x*c
        z = @z*c - @x*s

        @x = x
        @z = z
        
        return @

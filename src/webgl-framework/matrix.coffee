tau = Math.PI*2

exports.Mat4 = class Mat4
    constructor: (@view) ->
        @data ?= new Float32Array(16)
        @identity()
    
    identity: ->
        d = @data
        d[0]  = 1; d[1]  =0; d[2]  = 0; d[3]  = 0
        d[4]  = 0; d[5]  =1; d[6]  = 0; d[7]  = 0
        d[8]  = 0; d[9]  =0; d[10] = 1; d[11] = 0
        d[12] = 0; d[13] =0; d[14] = 0; d[15] = 1
        return @
    
    zero: ->
        d = @data
        d[0]  = 0; d[1]  =0; d[2]  = 0; d[3]  = 0
        d[4]  = 0; d[5]  =0; d[6]  = 0; d[7]  = 0
        d[8]  = 0; d[9]  =0; d[10] = 0; d[11] = 0
        d[12] = 0; d[13] =0; d[14] = 0; d[15] = 0
        return @
    
    copy: (dest) ->
        dest ?= new Mat4()

        src = @data
        dst = dest.data
        dst[0] = src[0]
        dst[1] = src[1]
        dst[2] = src[2]
        dst[3] = src[3]
        dst[4] = src[4]
        dst[5] = src[5]
        dst[6] = src[6]
        dst[7] = src[7]
        dst[8] = src[8]
        dst[9] = src[9]
        dst[10] = src[10]
        dst[11] = src[11]
        dst[12] = src[12]
        dst[13] = src[13]
        dst[14] = src[14]
        dst[15] = src[15]
        return dest
    
    perspective: (fov, aspect, near, far) ->
        #FIXME
        
        fov ?= 60
        aspect ?= 1
        near ?= 0.01
        far ?= 100

        # diagonal fov
        hyp = Math.sqrt(1 + aspect*aspect)
        rel = 1/hyp
        vfov = fov*rel

        @zero()
        d = @data
        top = near * Math.tan(vfov*Math.PI/360)
        right = top*aspect
        left = -right
        bottom = -top

        d[0] = (2*near)/(right-left)
        d[5] = (2*near)/(top-bottom)
        d[8] = (right+left)/(right-left)
        d[9] = (top+bottom)/(top-bottom)
        d[10] = -(far+near)/(far-near)
        d[11] = -1
        d[14] = -(2*far*near)/(far-near)

        return @
    
    translate: (x, y, z) ->
        #FIXME
        d = @data
        a00 = d[0]; a01 = d[1]; a02 = d[2]; a03 = d[3]
        a10 = d[4]; a11 = d[5]; a12 = d[6]; a13 = d[7]
        a20 = d[8]; a21 = d[9]; a22 = d[10]; a23 = d[11]

        d[12] = a00 * x + a10 * y + a20 * z + d[12]
        d[13] = a01 * x + a11 * y + a21 * z + d[13]
        d[14] = a02 * x + a12 * y + a22 * z + d[14]
        d[15] = a03 * x + a13 * y + a23 * z + d[15]

        return @
    
    rotatex: (angle) ->
        #FIXME
        d = @data
        rad = tau*(angle/360)
        s = Math.sin rad
        c = Math.cos rad

        a10 = d[4]
        a11 = d[5]
        a12 = d[6]
        a13 = d[7]
        a20 = d[8]
        a21 = d[9]
        a22 = d[10]
        a23 = d[11]

        d[4] = a10 * c + a20 * s
        d[5] = a11 * c + a21 * s
        d[6] = a12 * c + a22 * s
        d[7] = a13 * c + a23 * s

        d[8] = a10 * -s + a20 * c
        d[9] = a11 * -s + a21 * c
        d[10] = a12 * -s + a22 * c
        d[11] = a13 * -s + a23 * c

        return @

    rotatey: (angle) ->
        #FIXME
        d = @data
        rad = tau*(angle/360)
        s = Math.sin rad
        c = Math.cos rad

        a00 = d[0]
        a01 = d[1]
        a02 = d[2]
        a03 = d[3]
        a20 = d[8]
        a21 = d[9]
        a22 = d[10]
        a23 = d[11]

        d[0] = a00 * c + a20 * -s
        d[1] = a01 * c + a21 * -s
        d[2] = a02 * c + a22 * -s
        d[3] = a03 * c + a23 * -s

        d[8] = a00 * s + a20 * c
        d[9] = a01 * s + a21 * c
        d[10] = a02 * s + a22 * c
        d[11] = a03 * s + a23 * c

        return @
    
    invert: (destination=@) ->
        src = @data
        dst = destination.data

        a00 = src[0]; a01 = src[1]; a02 = src[2]; a03 = src[3]
        a10 = src[4]; a11 = src[5]; a12 = src[6]; a13 = src[7]
        a20 = src[8]; a21 = src[9]; a22 = src[10]; a23 = src[11]
        a30 = src[12]; a31 = src[13]; a32 = src[14]; a33 = src[15]

        b00 = a00 * a11 - a01 * a10
        b01 = a00 * a12 - a02 * a10
        b02 = a00 * a13 - a03 * a10
        b03 = a01 * a12 - a02 * a11
        b04 = a01 * a13 - a03 * a11
        b05 = a02 * a13 - a03 * a12
        b06 = a20 * a31 - a21 * a30
        b07 = a20 * a32 - a22 * a30
        b08 = a20 * a33 - a23 * a30
        b09 = a21 * a32 - a22 * a31
        b10 = a21 * a33 - a23 * a31
        b11 = a22 * a33 - a23 * a32

        d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06)
            
        if d==0 then return
        invDet = 1 / d

        dst[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet
        dst[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet
        dst[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet
        dst[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet
        dst[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet
        dst[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet
        dst[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet
        dst[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet
        dst[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet
        dst[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet
        dst[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet
        dst[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet
        dst[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet
        dst[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet
        dst[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet
        dst[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet

        return destination

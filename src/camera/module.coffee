keys = require 'keys'
Pointer = require 'pointer'

class InertialValue
    constructor: (@value, damping, @dt) ->
        @damping = Math.pow(damping, @dt)
        @last = @value
        @display = @value
        @velocity = 0

    accelerate: (acceleration) ->
        @velocity += acceleration*@dt

    integrate: ->
        @velocity *= @damping
        @last = @value
        @value += @velocity*@dt

    interpolate: (f) ->
        @display = @last*f + (1-f)*@value

    get: -> @display

    set: (@value) ->
        @last = @value

class InertialVector
    constructor: (x, y, z, damping, dt) ->
        @x = new InertialValue x, damping, dt
        @y = new InertialValue y, damping, dt
        @z = new InertialValue z, damping, dt

    accelerate: (x, y, z) ->
        @x.accelerate x
        @y.accelerate y
        @z.accelerate z

    integrate: ->
        @x.integrate()
        @y.integrate()
        @z.integrate()

    interpolate: (f) ->
        @x.interpolate f
        @y.interpolate f
        @z.interpolate f

    set: (x, y, z) ->
        if x instanceof Array
            @x.set x[0]
            @y.set x[1]
            @z.set x[2]
        else
            @x.set x
            @y.set y
            @z.set z

exports = class Camera
    constructor: (@gf) ->
        @proj = @gf.mat4()
        @view = @gf.mat4()
        @invView = @gf.mat4()

        @rotation = 0
        @pitch = 30
        @rotvec = @gf.vec3()

        @pointer = new Pointer @gf.canvas, @pointerMove

        @dt = 1/240
        @position = new InertialVector 0, 0, 0, 0.05, @dt

        @time = performance.now()/1000

    pointerMove: (x, y, dx, dy) =>
        if @pointer.pressed
            @rotation -= dx * 0.1
            @pitch -= dy * 0.1

    step: ->
        now = performance.now()/1000
        while @time < now
            @time += @dt
            @position.integrate()

        f = (@time - now)/@dt
        @position.interpolate f
       
    cameraAcceleration: ->
        acc = 10
        @rotvec.set(acc, 0, 0).rotatey(-@rotation)
        if keys.a
            @position.accelerate -@rotvec.x, -@rotvec.y, -@rotvec.z
        if keys.d
            @position.accelerate @rotvec.x, @rotvec.y, @rotvec.z
        
        @rotvec.set(0, 0, acc).rotatey(-@rotation)
        if keys.w
            @position.accelerate -@rotvec.x, -@rotvec.y, -@rotvec.z
        if keys.s
            @position.accelerate @rotvec.x, @rotvec.y, @rotvec.z

        if keys.q
            @position.accelerate 0, -acc, 0
        if keys.e
            @position.accelerate 0, acc, 0

    update: ->
        @cameraAcceleration()
        @step()

        aspect = @gf.canvas.width/@gf.canvas.height
        @proj.perspective 70, aspect, 0.001, 1000
        @view
            .identity()
            .rotatex(@pitch)
            .rotatey(@rotation)
            .translate(
                -@position.x.get()
                -@position.y.get()
                -@position.z.get()
            )
        @view.invert @invView.identity()

    setUniformsOn: (state) ->
        state
            .mat4('proj', @proj)
            .mat4('view', @view)
            .mat4('invView', @invView)

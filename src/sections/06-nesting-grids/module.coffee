exports = class Grid
    @title = '1.9 Nesting Grids'
    @cameraPos = [0, 10, 0]
    @cameraPitch = 90

    constructor: (@app) ->
        @shader = app.gf.shader fs.read('display.shader')

        pointers = [
            {name:'position', size:2}
            {name:'barycentric', size:3}
        ]
        uniforms = [
            {name:'uTerrain', type:'sampler', value:app.height}
            {name:'uAlbedo', type:'sampler', value:app.albedo}
        ]

        @patchState = app.gf.state
            cull: 'back'
            vertexbuffer:
                pointers: pointers
                vertices: @patch(app.gridSize)
            shader: @shader
            depthTest: true
            uniforms: uniforms
        
        @ringState = app.gf.state
            cull: 'back'
            vertexbuffer:
                pointers: pointers
                vertices: @ring(app.gridSize)
            shader: @shader
            depthTest: true
            uniforms: uniforms
        
        @textureScale = app.addRange label: 'Texture Scale', value: 0, min: -5, max: 5, step:0.1, convert: (value) -> Math.pow(2, value)
        @morphFactor = app.addRange label: 'Morph Factor', value: 1, min: 0, max: 1, step:0.01
        @gridLevels = app.addRange label: 'Grid Levels', value: 3, min: 0, max: 16
    
    onGridSize: (size) ->
        @patchState.vertices @patch size
        @ringState.vertices @ring size

    ring: (size) ->
        size /= 2

        innerLow = -size+size/2
        innerHigh = size-size/2
        innerSize = innerHigh - innerLow
        
        v = vertices = new Float32Array (Math.pow(size*2, 2) - Math.pow(innerSize, 2))*3*5*2
        i = 0
        for x in [-size...size]
            l = x
            r = x+1
            xInner = x >= innerLow and x < innerHigh
            for z in [-size...size]
                f = z
                b = z+1
                zInner = z >= innerLow and z < innerHigh
                if xInner and zInner
                    continue

                v[i++]=r; v[i++]=b; v[i++]=0; v[i++]=0; v[i++]=1
                v[i++]=r; v[i++]=f; v[i++]=0; v[i++]=1; v[i++]=0
                v[i++]=l; v[i++]=f; v[i++]=1; v[i++]=0; v[i++]=0
                
                v[i++]=l; v[i++]=b; v[i++]=0; v[i++]=0; v[i++]=1
                v[i++]=r; v[i++]=b; v[i++]=0; v[i++]=1; v[i++]=0
                v[i++]=l; v[i++]=f; v[i++]=1; v[i++]=0; v[i++]=0

        return vertices
        
    patch: (size) ->
        size /= 2

        v = vertices = new Float32Array(Math.pow(size*2, 2)*3*5*2)
        i = 0
        for x in [-size...size]
            l = x
            r = x+1
            for z in [-size...size]
                f = z
                b = z+1
                v[i++]=r; v[i++]=b; v[i++]=0; v[i++]=0; v[i++]=1
                v[i++]=r; v[i++]=f; v[i++]=0; v[i++]=1; v[i++]=0
                v[i++]=l; v[i++]=f; v[i++]=1; v[i++]=0; v[i++]=0
                
                v[i++]=l; v[i++]=b; v[i++]=0; v[i++]=0; v[i++]=1
                v[i++]=r; v[i++]=b; v[i++]=0; v[i++]=1; v[i++]=0
                v[i++]=l; v[i++]=f; v[i++]=1; v[i++]=0; v[i++]=0
        
        return vertices

    destroy: ->
        @shader.destroy()
        @ringState.destroy()
        @patchState.destroy()
        @textureScale.remove()
        @morphFactor.remove()
        @gridLevels.remove()

    draw: ->
        @shader
            .uniformSetter(@app.camera)
            .float('showGridLines', @app.gridLines)
            .float('gridSize', @app.gridSize)
            .float('textureScale', @textureScale.value)
            .float('morphFactor', @morphFactor.value)

        @patchState
            .float('gridScale', @app.gridScale.value)
            .draw()
        
        for level in [0...@gridLevels.value]
            scale = @app.gridScale.value * Math.pow(2, level+1)

            @ringState
                .float('gridScale', scale)
                .draw()

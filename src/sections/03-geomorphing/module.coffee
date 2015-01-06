exports = class Grid
    @title = '1.6 Geomorphing'
    @cameraPos = [0, 2, 4]

    constructor: (@app) ->
        @gf = app.gf

        @state = @gf.state
            cull: 'back'
            vertexbuffer:
                pointers: [
                    {name:'position', size:2}
                    {name:'barycentric', size:3}
                ]
                vertices: @patch(app.gridSize)
            shader: fs.read('display.shader')
            depthTest: true
            uniforms: [
                {name:'uTerrain', type:'sampler', value:app.height}
                {name:'uAlbedo', type:'sampler', value:app.albedo}
            ]
        
        @textureScale = app.addRange label: 'Texture Scale', value: 0, min: -5, max: 5, step:0.1, convert: (value) -> Math.pow(2, value)
        @morphFactor = app.addRange label: 'Morph Factor', value: 1, min: 0, max: 1, step:0.01
        
    onGridSize: (size) ->
        @state.vertices @patch size
    
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
        @morphFactor.remove()
        @state.destroy()
        @textureScale.remove()

    draw: ->
        @state
            .uniformSetter(@app.camera)
            .float('showGridLines', @app.gridLines)
            .float('gridScale', @app.gridScale.value)
            .float('gridSize', @app.gridSize)
            .float('textureScale', @textureScale.value)
            .float('morphFactor', @morphFactor.value)
            .draw()

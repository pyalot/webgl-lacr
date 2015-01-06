exports = class Grid
    @title = '1.4 Rendering the Grid'
    @cameraPos = [0, 2, 4]

    constructor: (@app) ->
        @state = app.gf.state
            cull: 'back'
            vertexbuffer:
                pointers: [
                    {name:'position', size:2}
                    {name:'barycentric', size:3}
                ]
                vertices: @patch(app.gridSize)
            shader: fs.read('display.shader')
            depthTest: true
        
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
        @state.destroy()

    draw: ->
        @state
            .uniformSetter(@app.camera)
            .float('showGridLines', @app.gridLines)
            .float('gridSize', @app.gridSize)
            .float('gridScale', @app.gridScale.value)
            .draw()

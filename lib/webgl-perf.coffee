css = (elem, values) ->
    for name, value of values
        if typeof value is 'number'
            elem.style[name] = value.toFixed(0) + 'px'
        else
            elem.style[name] = value

element = (parent, name, style) ->
    elem = document.createElement name
    css elem, style
    parent.appendChild elem
    return elem

formatNum = (n) ->
    if n < 1000
        return n.toFixed(1)
    else if n < 1000000
        return (n/1000).toFixed(1) + 'k'
    else
        return (n/1000000).toFixed(1) + 'm'

class Graph
    constructor: (label, container) ->
        @width = 160
        @values = new Float32Array(@width)
        @idx = 0

        for i in [0...@values.length]
            @values[i] = NaN

        graphHeight = @height = 40
        graphWidth = @width
        legendWidth = 50
        labelHeight = 15
        totalWidth = graphWidth + legendWidth
        totalHeight = graphHeight + labelHeight

        @container = element container, 'div',
            width:totalWidth, height:totalHeight, display: 'inline-block', position:'relative'
            marginLeft: 5
            marginTop: 5

        @label = element @container, 'div',
            width:totalWidth, height:labelHeight, position:'absolute', top:0, left:0
            fontSize: labelHeight*0.8, lineHeight: labelHeight
        @label.textContent = label

        @legend = element @container, 'div',
            width: legendWidth, height: graphHeight, position:'absolute', top:labelHeight, left:0
       
        @max = element @legend, 'div',
            width: legendWidth-5, height: graphHeight/3, lineHeight: graphHeight/3, textAlign: 'right', paddingRight: 5
        @max.textContent = 'max'
        
        @avg = element @legend, 'div',
            width: legendWidth-5, height: graphHeight/3, lineHeight: graphHeight/3, textAlign: 'right', paddingRight: 5
        @avg.textContent = 'avg'
        
        @min = element @legend, 'div',
            width: legendWidth-5, height: graphHeight/3, lineHeight: graphHeight/3, textAlign: 'right', paddingRight: 5
        @min.textContent = 'min'
       
        @canvas = element @container, 'canvas',
            width: graphWidth, height: graphHeight, position:'absolute', top:labelHeight, left:legendWidth
            background: 'linear-gradient(to bottom, rgba(0,255,0,0.3) 0%,rgba(0,255,0,0.1) 100%)'

        @canvas.width = graphWidth
        @canvas.height = graphHeight

        @ctx = @canvas.getContext '2d'
        #@ctx.fillStyle = 'red'
        #@ctx.fillRect 0, 0, graphWidth, graphHeight
        @ctx.transform(1, 0, 0, -1, 0, @height)

    add: (value=@counter) ->
        @values[@idx] = value
        @idx = (@idx + 1) % @width

    draw: ->
        @ctx.clearRect 0, 0, @width, @height

        @ctx.strokeStyle = 'red'

        min = max = @values[0]
        avg = 0
        for value in @values
            if not isNaN(value)
                min = Math.min value, min
                max = Math.max value, max
                avg += value
        avg/=@width

        @avg.textContent = formatNum(avg)
        @min.textContent = formatNum(min)
        @max.textContent = formatNum(max)

        @ctx.beginPath()

        diff = max-min
        if diff > 0
            if not isNaN(@values[@idx])
                for i in [@idx...@width]
                    f = (@values[i] - min)/diff
                    left = i - @idx
                    @ctx.lineTo(left, @height*f)
            
            for i in [0...@idx]
                f = (@values[i] - min)/diff
                left = (@width - @idx) + i
                @ctx.lineTo(left, (@height-2)*f+1)
        else
            @ctx.moveTo(0, @height/2)
            @ctx.lineTo(@width, @height/2)

        @ctx.stroke()

window.WebGLPerfContext =
    create: (gl) ->
        frameStart = frameEnd = last = performance.now()
   
        overlay = element document.body, 'div',
            position: 'fixed'
            top: '0px'
            left: '0px'
            width: '100%'
            #height: '200px'
            color: 'white'
            fontFamily: 'monospace'
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.5) 100%)'
            borderBottom: '1px solid rgba(0,0,0,0.9)'
            pointerEvents: 'none'
            zIndex: '1000'
            display: 'none'

        shown = false

        keydown = (event) ->
            if event.which == 192 or event.which == 191
                if overlay.style.display.length == 0
                    shown = false
                    overlay.style.display = 'none'
                else
                    shown = true
                    overlay.style.display = ''
        window.addEventListener 'keydown', keydown, false

        jsTime = new Graph('JS Execution Time (ms)', overlay)
        frameTime = new Graph('Frame Time (ms)', overlay)

        bufferBinds = new Graph('gl.bufferBind (count)', overlay)
        gl.origBindBuffer = gl.bindBuffer
        gl.bindBuffer = (target, buffer) ->
            bufferBinds.counter += 1
            return gl.origBindBuffer target, buffer
        
        draws = new Graph('gl.draw* (count)', overlay)
        vertices = new Graph('gl.draw* (vertices)', overlay)
        gl.origDrawArrays = gl.drawArrays
        gl.drawArrays = (mode, first, count) ->
            draws.counter += 1
            vertices.counter += count
            return gl.origDrawArrays mode, first, count
        
        programs = new Graph('gl.useProgram (count)', overlay)
        gl.origUseProgram = gl.useProgram
        gl.useProgram = (program) ->
            programs.counter += 1
            return gl.origUseProgram program

        stopCount = 0

        gl.performance = {
            start: ->
                bufferBinds.counter = 0
                draws.counter = 0
                vertices.counter = 0
                programs.counter = 0
                frameStart = performance.now()
            stop: ->
                stopCount += 1
                frameEnd = performance.now()
                jsDelta = frameEnd - frameStart
                frameDelta = frameEnd - last
                last = frameEnd

                jsTime.add jsDelta
                frameTime.add frameDelta
                bufferBinds.add()
                draws.add()
                vertices.add()
                programs.add()

                #if stopCount % 15 == 0 and shown
                jsTime.draw()
                frameTime.draw()
                bufferBinds.draw()
                draws.draw()
                vertices.draw()
                programs.draw()
        }

            
        return gl

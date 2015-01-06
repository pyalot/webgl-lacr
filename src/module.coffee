WebGLFramework = require '/webgl-framework'
Camera = require 'camera'

class Application
    constructor: ->
        $('#grid-size').change =>
            @gridSize = parseInt($('#grid-size').val(), 10)
            @currentSection.onGridSize(@gridSize)
        @gridSize = parseInt($('#grid-size').val(), 10)
        
        $('#grid-lines').change =>
            @gridLines = if $('#grid-lines')[0].checked then 1 else 0
        @gridLines = if $('#grid-lines')[0].checked then 1 else 0

        @gridScale = @addRange label: 'Grid Scale', value: 0, min: -5, max: 5, step:0.1, convert: (value) -> Math.pow(2, value)

        canvas = document.getElementById('webgl')
        @gf = new WebGLFramework(canvas:canvas, antiAlias: false, debug:false, perf:true)

        @camera = new Camera @gf

        @albedo = @gf.texture2D
            filter: {anisotropy: true, minify: 'linear_mipmap_linear', magnify: 'linear'}
            clamp: 'repeat'
            data: fs.read('textures/albedo.png')
        
        @materialMix = @gf.texture2D
            filter: {anisotropy: true, minify: 'linear_mipmap_linear', magnify: 'linear'}
            clamp: 'repeat'
            data: fs.read('textures/mix.png')
        
        @dirtColor = @gf.texture2D
            filter: {anisotropy: true, minify: 'linear_mipmap_linear', magnify: 'linear'}
            clamp: 'repeat'
            data: fs.read('textures/dirt-color.png')
        
        @rockColor = @gf.texture2D
            filter: {anisotropy: true, minify: 'linear_mipmap_linear', magnify: 'linear'}
            clamp: 'repeat'
            data: fs.read('textures/rock-color.png')
        
        @grassColor = @gf.texture2D
            filter: {anisotropy: true, minify: 'linear_mipmap_linear', magnify: 'linear'}
            clamp: 'repeat'
            data: fs.read('textures/grass-color.png')

        @height = @loadHeight('textures/height.png', 0.136439830834)
        @dirtHeight = @loadHeight('textures/dirt-height.png', 0.0450444817543)
        @rockHeight = @loadHeight('textures/rock-height.png', 0.083146572113)
        @grassHeight = @loadHeight('textures/grass-height.png', 0.0247397422791)
        @loadSections()
        
    loadSections: ->
        @sections = for name in fs.listdir('sections', type:'directory')
            require 'sections/' + name

        @sectionByPath = {}
        @sectionSelect = $('<select class="sections"></select>')
            .prependTo('div.controls')
            .change =>
                document.location.hash = @sectionSelect.val()

        for Section, i in @sections
            Section.path = Section.title.toLowerCase().replace(/[ .]/g, '-')

            $('<option></option>')
                .appendTo(@sectionSelect)
                .text(Section.title)
                .val(Section.path)

            @sectionByPath[Section.path] = Section

        @currentSection = null
        @draw()
    
    loadHeight: (name, scaleFactor) ->
        encodedHeight = @gf.texture2D
            filter: 'linear'
            clamp: 'repeat'
            data: fs.read(name)

        convertHeight = @gf.shader(fs.read('convertHeight.shader'))

        result = @gf.texture2D
            type: 'float'
            width: encodedHeight.width
            height: encodedHeight.height
            filter: {
                anisotropy: true
                minify: 'linear_mipmap_linear'
                magnify: 'linear'
            }
            clamp: 'repeat'

        state = @gf.state
            shader: convertHeight
            framebuffer:
                color: result
            uniforms: [
                {name:'source', type:'sampler', value:encodedHeight}
                {name:'viewport', type:'vec2', value:[encodedHeight.width, encodedHeight.height]}
                {name:'scaleFactor', type:'float', value:scaleFactor}
            ]
        state.draw().generateMipmap()

        state.destroy()
        convertHeight.destroy()
        encodedHeight.destroy()
        return result

    checkLocation: ->
        path = document.location.hash.substr(1)

        if not @currentSection? or @currentSection.constructor.path isnt path
            Section = @sectionByPath[path] ? @sections[0]
            if @currentSection?
                @currentSection.destroy()
            @currentSection = new Section(@)
            @camera.position.set Section.cameraPos
            @camera.pitch = Section.cameraPitch ? 30
            @sectionSelect.val Section.path

    draw: =>
        @checkLocation()
        @gf.frameStart()
        @camera.update()
        @currentSection.draw()
        @gf.frameEnd()
        requestAnimationFrame @draw

    addSelect: ({label, value, options, onValue}) ->
        container = $('<div></div>')
            .appendTo('div.controls')

        $('<label></label>')
            .text(label)
            .appendTo(container)

        select = $('<select></select>')
            .appendTo(container)
            .change ->
                onValue select.val()

        for option in options
            optionElem = $('<option></option>')
                .appendTo(select)

            if typeof option is 'string'
                name = option
            else
                {name, option} = option

            optionElem
                .text(name)
                .attr('value', option)

        select.val value
        onValue value
        return container

    addCheckbox: ({label, value}) ->
        value ?= false

        container = $('<div></div>')
            .appendTo('div.controls')
        
        $('<label></label>')
            .text(label)
            .appendTo(container)

        input = $('<input type="checkbox"></input')
            .appendTo(container)
            .change ->
                obj.value = input[0].checked
                if obj.value
                    obj.numValue = 1
                else
                    obj.numValue = 0

        if value
            input.attr('checked', 'checked')

        obj = {
            remove: ->
                container.remove()
            value: value
            numValue: if value then 1 else 0
        }

        return obj

    addRange: ({label, value, min, max, step, convert}) ->
        convert ?= (value) -> value

        container = $('<div></div>')
            .appendTo('div.controls')

        $('<label></label>')
            .text(label)
            .appendTo(container)

        input = $('<input type="range"></input>')
            .attr('min', min)
            .attr('max', max)
            .attr('value', value)
            .appendTo(container)
            .bind 'input', ->
                obj.value = convert(parseFloat(input.val()))
                span.text(obj.value.toFixed(2))

        if step?
            input.attr('step', step)

        span = $('<span></span>')
            .text(value.toFixed(2))
            .appendTo(container)

        obj = {
            remove: ->
                container.remove()
            value: convert(value)
        }

        return obj
        
exports.main = ->
    app = new Application()

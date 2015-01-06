sys =
    modules: {}
    files: {}

    defModule: (name, closure) ->
        @modules[name] = {
            closure: closure
            instance: null
        }

    defFile: (name, value) ->
        @files[name] = value

    loadImage: (name, callback) ->
        img = new Image()
        img.onload = ->
            callback name, img
        img.onerror = ->
            console.error 'failed to load: ' + name
        img.src = 'src' + name
        return

    main: ->
        window.addEventListener 'load', =>
            toLoad = 0
            loaded = 0
            for name, value of @files
                ext = name.split('.').pop()
                if value is undefined
                    toLoad += 1
                    switch ext
                        when 'png', 'jpg', 'jpeg', 'gif'
                            @loadImage name, (imageName, img) =>
                                @files[imageName] = img
                                loaded += 1
                                if loaded is toLoad
                                    @require('/module').main()
            if loaded is toLoad
                @require('/module').main()

    abspath: (fromName, pathName) ->
        if pathName == '.'
            pathName = ''

        baseName = fromName.split('/')
        baseName.pop()
        baseName = baseName.join('/')

        if pathName[0] == '/'
            return pathName
        else
            path = pathName.split '/'
            if baseName == '/'
                base = ['']
            else
                base = baseName.split '/'

            while base.length > 0 and path.length > 0 and path[0] == '..'
                base.pop()
                path.shift()

            if base.length == 0 || path.length == 0 || base[0] != ''
                throw new Error("Invalid path: #{base.join '/'}/#{path.join '/'}")
            return "#{base.join('/')}/#{path.join('/')}"

    FileSystem: class
        constructor: (@origin) ->
        listdir: (path, {type}) ->
            path = sys.abspath(@origin, path)
            result = []

            for name, value of sys.modules
                if name.indexOf(path) == 0
                    name = name[path.length+1..].split('/')[0]
                    if name not in result
                        result.push name

            for name, value of sys.files
                if name.indexOf(path) == 0
                    name = name[path.length+1..].split('/')[0]
                    if name not in result
                        result.push name

            directories = []
            files = []

            for name in result
                if @isdir path + '/' + name
                    directories.push name
                else
                    files.push name

            switch type
                when 'directory'
                    return directories
                when 'file'
                    return files
                else
                    return result
            
        isdir: (path) ->
            path = sys.abspath(@origin, path)
            module = sys.modules[path]
            if module?
                return false

            file = sys.files[path]
            if file?
                return false

            for name, value of sys.modules
                if name.indexOf(path) == 0
                    return true
            for name, value of sys.files
                if name.indexOf(path) == 0
                    return true
            throw new Error('Path does not exist: ' + path)

        read: (path) ->
            path = sys.abspath(@origin, path)
            return sys.files[path]

    require: (moduleName) ->
        if moduleName?
            module = @modules[moduleName]

            if module == undefined
                module = @modules[moduleName+'/module']
                if module?
                    moduleName = moduleName+'/module'
                else
                    throw new Error('Module not found: ' + moduleName)
            
            if module.instance == null
                require = (requirePath) =>
                    path = @abspath(moduleName, requirePath)
                    return @require(path)

                fs = new sys.FileSystem(moduleName)

                exports = {}
                exports = module.closure(exports, require, fs)
                module.instance = exports

            return module.instance
        else
            throw new Error('no module name provided')

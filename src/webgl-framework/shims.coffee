vendors = [null, 'webkit', 'apple', 'moz', 'o', 'xv', 'ms', 'khtml', 'atsc', 'wap', 'prince', 'ah', 'hp', 'ro', 'rim', 'tc']

vendorName = (name, vendor) ->
    if vendor == null
        return name
    else
        return vendor + name[0].toUpperCase() + name.substr(1)
   
getAttrib = (obj, name, def) ->
    if obj
        for vendor in vendors
            attrib_name = vendorName(name, vendor)
            attrib = obj[attrib_name]
            if attrib != undefined
                return attrib
    return def

window.performance = getAttrib(window, 'performance')

if not window.performance?
    window.performance = {}

window.performance.now = getAttrib(window.performance, 'now')

if not window.performance.now?
    startTime = Date.now()
    window.performance.now = ->
        return Date.now() - startTime

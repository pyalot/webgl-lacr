(function(){
var sys,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

sys = {
  modules: {},
  files: {},
  defModule: function(name, closure) {
    return this.modules[name] = {
      closure: closure,
      instance: null
    };
  },
  defFile: function(name, value) {
    return this.files[name] = value;
  },
  loadImage: function(name, callback) {
    var img;
    img = new Image();
    img.onload = function() {
      return callback(name, img);
    };
    img.onerror = function() {
      return console.error('failed to load: ' + name);
    };
    img.src = 'src' + name;
  },
  main: function() {
    return window.addEventListener('load', (function(_this) {
      return function() {
        var ext, loaded, name, toLoad, value, _ref;
        toLoad = 0;
        loaded = 0;
        _ref = _this.files;
        for (name in _ref) {
          value = _ref[name];
          ext = name.split('.').pop();
          if (value === void 0) {
            toLoad += 1;
            switch (ext) {
              case 'png':
              case 'jpg':
              case 'jpeg':
              case 'gif':
                _this.loadImage(name, function(imageName, img) {
                  _this.files[imageName] = img;
                  loaded += 1;
                  if (loaded === toLoad) {
                    return _this.require('/module').main();
                  }
                });
            }
          }
        }
        if (loaded === toLoad) {
          return _this.require('/module').main();
        }
      };
    })(this));
  },
  abspath: function(fromName, pathName) {
    var base, baseName, path;
    if (pathName === '.') {
      pathName = '';
    }
    baseName = fromName.split('/');
    baseName.pop();
    baseName = baseName.join('/');
    if (pathName[0] === '/') {
      return pathName;
    } else {
      path = pathName.split('/');
      if (baseName === '/') {
        base = [''];
      } else {
        base = baseName.split('/');
      }
      while (base.length > 0 && path.length > 0 && path[0] === '..') {
        base.pop();
        path.shift();
      }
      if (base.length === 0 || path.length === 0 || base[0] !== '') {
        throw new Error("Invalid path: " + (base.join('/')) + "/" + (path.join('/')));
      }
      return "" + (base.join('/')) + "/" + (path.join('/'));
    }
  },
  FileSystem: (function() {
    function _Class(origin) {
      this.origin = origin;
    }

    _Class.prototype.listdir = function(path, _arg) {
      var directories, files, name, result, type, value, _i, _len, _ref, _ref1;
      type = _arg.type;
      path = sys.abspath(this.origin, path);
      result = [];
      _ref = sys.modules;
      for (name in _ref) {
        value = _ref[name];
        if (name.indexOf(path) === 0) {
          name = name.slice(path.length + 1).split('/')[0];
          if (__indexOf.call(result, name) < 0) {
            result.push(name);
          }
        }
      }
      _ref1 = sys.files;
      for (name in _ref1) {
        value = _ref1[name];
        if (name.indexOf(path) === 0) {
          name = name.slice(path.length + 1).split('/')[0];
          if (__indexOf.call(result, name) < 0) {
            result.push(name);
          }
        }
      }
      directories = [];
      files = [];
      for (_i = 0, _len = result.length; _i < _len; _i++) {
        name = result[_i];
        if (this.isdir(path + '/' + name)) {
          directories.push(name);
        } else {
          files.push(name);
        }
      }
      switch (type) {
        case 'directory':
          return directories;
        case 'file':
          return files;
        default:
          return result;
      }
    };

    _Class.prototype.isdir = function(path) {
      var file, module, name, value, _ref, _ref1;
      path = sys.abspath(this.origin, path);
      module = sys.modules[path];
      if (module != null) {
        return false;
      }
      file = sys.files[path];
      if (file != null) {
        return false;
      }
      _ref = sys.modules;
      for (name in _ref) {
        value = _ref[name];
        if (name.indexOf(path) === 0) {
          return true;
        }
      }
      _ref1 = sys.files;
      for (name in _ref1) {
        value = _ref1[name];
        if (name.indexOf(path) === 0) {
          return true;
        }
      }
      throw new Error('Path does not exist: ' + path);
    };

    _Class.prototype.read = function(path) {
      path = sys.abspath(this.origin, path);
      return sys.files[path];
    };

    return _Class;

  })(),
  require: function(moduleName) {
    var exports, fs, module, require;
    if (moduleName != null) {
      module = this.modules[moduleName];
      if (module === void 0) {
        module = this.modules[moduleName + '/module'];
        if (module != null) {
          moduleName = moduleName + '/module';
        } else {
          throw new Error('Module not found: ' + moduleName);
        }
      }
      if (module.instance === null) {
        require = (function(_this) {
          return function(requirePath) {
            var path;
            path = _this.abspath(moduleName, requirePath);
            return _this.require(path);
          };
        })(this);
        fs = new sys.FileSystem(moduleName);
        exports = {};
        exports = module.closure(exports, require, fs);
        module.instance = exports;
      }
      return module.instance;
    } else {
      throw new Error('no module name provided');
    }
  }
};
sys.defModule('/camera/keys', function(exports, require, fs) {
  var keymap, name, value;
  keymap = {
    87: 'w',
    65: 'a',
    83: 's',
    68: 'd',
    81: 'q',
    69: 'e',
    37: 'left',
    39: 'right',
    38: 'up',
    40: 'down',
    13: 'enter',
    27: 'esc',
    32: 'space',
    8: 'backspace',
    16: 'shift',
    17: 'ctrl',
    18: 'alt',
    91: 'start',
    0: 'altc',
    20: 'caps',
    9: 'tab',
    49: 'key1',
    50: 'key2',
    51: 'key3',
    52: 'key4'
  };
  for (value in keymap) {
    name = keymap[value];
    exports[name] = false;
  }
  $(document).keydown(function(event) {
    name = keymap[event.which];
    return exports[name] = true;
  });
  $(document).keyup(function(event) {
    name = keymap[event.which];
    return exports[name] = false;
  });
  return exports;
});
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

sys.defModule('/camera/module', function(exports, require, fs) {
  var Camera, InertialValue, InertialVector, Pointer, keys;
  keys = require('keys');
  Pointer = require('pointer');
  InertialValue = (function() {
    function InertialValue(value, damping, dt) {
      this.value = value;
      this.dt = dt;
      this.damping = Math.pow(damping, this.dt);
      this.last = this.value;
      this.display = this.value;
      this.velocity = 0;
    }

    InertialValue.prototype.accelerate = function(acceleration) {
      return this.velocity += acceleration * this.dt;
    };

    InertialValue.prototype.integrate = function() {
      this.velocity *= this.damping;
      this.last = this.value;
      return this.value += this.velocity * this.dt;
    };

    InertialValue.prototype.interpolate = function(f) {
      return this.display = this.last * f + (1 - f) * this.value;
    };

    InertialValue.prototype.get = function() {
      return this.display;
    };

    InertialValue.prototype.set = function(value) {
      this.value = value;
      return this.last = this.value;
    };

    return InertialValue;

  })();
  InertialVector = (function() {
    function InertialVector(x, y, z, damping, dt) {
      this.x = new InertialValue(x, damping, dt);
      this.y = new InertialValue(y, damping, dt);
      this.z = new InertialValue(z, damping, dt);
    }

    InertialVector.prototype.accelerate = function(x, y, z) {
      this.x.accelerate(x);
      this.y.accelerate(y);
      return this.z.accelerate(z);
    };

    InertialVector.prototype.integrate = function() {
      this.x.integrate();
      this.y.integrate();
      return this.z.integrate();
    };

    InertialVector.prototype.interpolate = function(f) {
      this.x.interpolate(f);
      this.y.interpolate(f);
      return this.z.interpolate(f);
    };

    InertialVector.prototype.set = function(x, y, z) {
      if (x instanceof Array) {
        this.x.set(x[0]);
        this.y.set(x[1]);
        return this.z.set(x[2]);
      } else {
        this.x.set(x);
        this.y.set(y);
        return this.z.set(z);
      }
    };

    return InertialVector;

  })();
  exports = Camera = (function() {
    function Camera(gf) {
      this.gf = gf;
      this.pointerMove = __bind(this.pointerMove, this);
      this.proj = this.gf.mat4();
      this.view = this.gf.mat4();
      this.invView = this.gf.mat4();
      this.rotation = 0;
      this.pitch = 30;
      this.rotvec = this.gf.vec3();
      this.pointer = new Pointer(this.gf.canvas, this.pointerMove);
      this.dt = 1 / 240;
      this.position = new InertialVector(0, 0, 0, 0.05, this.dt);
      this.time = performance.now() / 1000;
    }

    Camera.prototype.pointerMove = function(x, y, dx, dy) {
      if (this.pointer.pressed) {
        this.rotation -= dx * 0.1;
        return this.pitch -= dy * 0.1;
      }
    };

    Camera.prototype.step = function() {
      var f, now;
      now = performance.now() / 1000;
      while (this.time < now) {
        this.time += this.dt;
        this.position.integrate();
      }
      f = (this.time - now) / this.dt;
      return this.position.interpolate(f);
    };

    Camera.prototype.cameraAcceleration = function() {
      var acc;
      acc = 10;
      this.rotvec.set(acc, 0, 0).rotatey(-this.rotation);
      if (keys.a) {
        this.position.accelerate(-this.rotvec.x, -this.rotvec.y, -this.rotvec.z);
      }
      if (keys.d) {
        this.position.accelerate(this.rotvec.x, this.rotvec.y, this.rotvec.z);
      }
      this.rotvec.set(0, 0, acc).rotatey(-this.rotation);
      if (keys.w) {
        this.position.accelerate(-this.rotvec.x, -this.rotvec.y, -this.rotvec.z);
      }
      if (keys.s) {
        this.position.accelerate(this.rotvec.x, this.rotvec.y, this.rotvec.z);
      }
      if (keys.q) {
        this.position.accelerate(0, -acc, 0);
      }
      if (keys.e) {
        return this.position.accelerate(0, acc, 0);
      }
    };

    Camera.prototype.update = function() {
      var aspect;
      this.cameraAcceleration();
      this.step();
      aspect = this.gf.canvas.width / this.gf.canvas.height;
      this.proj.perspective(70, aspect, 0.001, 1000);
      this.view.identity().rotatex(this.pitch).rotatey(this.rotation).translate(-this.position.x.get(), -this.position.y.get(), -this.position.z.get());
      return this.view.invert(this.invView.identity());
    };

    Camera.prototype.setUniformsOn = function(state) {
      return state.mat4('proj', this.proj).mat4('view', this.view).mat4('invView', this.invView);
    };

    return Camera;

  })();
  return exports;
});
sys.defModule('/camera/pointer', function(exports, require, fs) {
  var Pointer;
  exports = Pointer = (function() {
    function Pointer(element, onMove) {
      this.onMove = onMove != null ? onMove : function() {
        return null;
      };
      this.pressed = false;
      this.x = null;
      this.y = null;
      element.addEventListener('mousedown', (function(_this) {
        return function(event) {
          return _this.pressed = true;
        };
      })(this));
      element.addEventListener('mouseup', (function(_this) {
        return function(event) {
          return _this.pressed = false;
        };
      })(this));
      element.addEventListener('mousemove', (function(_this) {
        return function(event) {
          var dx, dy, rect, x, y;
          rect = element.getBoundingClientRect();
          x = event.clientX - rect.left;
          y = event.clientY - rect.top;
          if (_this.x != null) {
            dx = _this.x - x;
            dy = _this.y - y;
          } else {
            dx = 0;
            dy = 0;
          }
          _this.x = x;
          _this.y = y;
          return _this.onMove(_this.x, _this.y, dx, dy);
        };
      })(this));
    }

    return Pointer;

  })();
  return exports;
});
sys.defFile("/convertHeight.shader", "#file /convertHeight.shader\nvarying vec2 texcoord;\n\nvertex:\n    attribute vec2 position;\n    void main(){\n        texcoord = position*0.5+0.5;\n        gl_Position = vec4(position, 0, 1);\n    }\n\nfragment:\n    uniform sampler2D source;\n    uniform vec2 viewport;\n    uniform float scaleFactor;\n\n    float getHeight(float s, float t){\n        vec2 coord = texcoord+vec2(s,t)/viewport;\n        vec4 texel = texture2D(source, coord);\n        float height = (((texel.r*256.0 + texel.g)/257.0)-0.5)*scaleFactor;\n        return height;\n    }\n\n    void main(){\n        float height = getHeight(0.0, 0.0);\n        float left = getHeight(-1.0, 0.0);\n        float right = getHeight(1.0, 0.0);\n        float bottom = getHeight(0.0, -1.0);\n        float top = getHeight(0.0, 1.0);\n        float dS = (right-left)*0.5;\n        float dT = (top-bottom)*0.5;\n        gl_FragColor = vec4(height, dS*viewport.s, dT*viewport.t, 1);\n    }");
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

sys.defModule('/module', function(exports, require, fs) {
  var Application, Camera, WebGLFramework;
  WebGLFramework = require('/webgl-framework');
  Camera = require('camera');
  Application = (function() {
    function Application() {
      this.draw = __bind(this.draw, this);
      var canvas;
      $('#grid-size').change((function(_this) {
        return function() {
          _this.gridSize = parseInt($('#grid-size').val(), 10);
          return _this.currentSection.onGridSize(_this.gridSize);
        };
      })(this));
      this.gridSize = parseInt($('#grid-size').val(), 10);
      $('#grid-lines').change((function(_this) {
        return function() {
          return _this.gridLines = $('#grid-lines')[0].checked ? 1 : 0;
        };
      })(this));
      this.gridLines = $('#grid-lines')[0].checked ? 1 : 0;
      this.gridScale = this.addRange({
        label: 'Grid Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      canvas = document.getElementById('webgl');
      this.gf = new WebGLFramework({
        canvas: canvas,
        antiAlias: false,
        debug: false,
        perf: true
      });
      this.camera = new Camera(this.gf);
      this.albedo = this.gf.texture2D({
        filter: {
          anisotropy: true,
          minify: 'linear_mipmap_linear',
          magnify: 'linear'
        },
        clamp: 'repeat',
        data: fs.read('textures/albedo.png')
      });
      this.materialMix = this.gf.texture2D({
        filter: {
          anisotropy: true,
          minify: 'linear_mipmap_linear',
          magnify: 'linear'
        },
        clamp: 'repeat',
        data: fs.read('textures/mix.png')
      });
      this.dirtColor = this.gf.texture2D({
        filter: {
          anisotropy: true,
          minify: 'linear_mipmap_linear',
          magnify: 'linear'
        },
        clamp: 'repeat',
        data: fs.read('textures/dirt-color.png')
      });
      this.rockColor = this.gf.texture2D({
        filter: {
          anisotropy: true,
          minify: 'linear_mipmap_linear',
          magnify: 'linear'
        },
        clamp: 'repeat',
        data: fs.read('textures/rock-color.png')
      });
      this.grassColor = this.gf.texture2D({
        filter: {
          anisotropy: true,
          minify: 'linear_mipmap_linear',
          magnify: 'linear'
        },
        clamp: 'repeat',
        data: fs.read('textures/grass-color.png')
      });
      this.height = this.loadHeight('textures/height.png', 0.136439830834);
      this.dirtHeight = this.loadHeight('textures/dirt-height.png', 0.0450444817543);
      this.rockHeight = this.loadHeight('textures/rock-height.png', 0.083146572113);
      this.grassHeight = this.loadHeight('textures/grass-height.png', 0.0247397422791);
      this.loadSections();
    }

    Application.prototype.loadSections = function() {
      var Section, i, name, _i, _len, _ref;
      this.sections = (function() {
        var _i, _len, _ref, _results;
        _ref = fs.listdir('sections', {
          type: 'directory'
        });
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          name = _ref[_i];
          _results.push(require('sections/' + name));
        }
        return _results;
      })();
      this.sectionByPath = {};
      this.sectionSelect = $('<select class="sections"></select>').prependTo('div.controls').change((function(_this) {
        return function() {
          return document.location.hash = _this.sectionSelect.val();
        };
      })(this));
      _ref = this.sections;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        Section = _ref[i];
        Section.path = Section.title.toLowerCase().replace(/[ .]/g, '-');
        $('<option></option>').appendTo(this.sectionSelect).text(Section.title).val(Section.path);
        this.sectionByPath[Section.path] = Section;
      }
      this.currentSection = null;
      return this.draw();
    };

    Application.prototype.loadHeight = function(name, scaleFactor) {
      var convertHeight, encodedHeight, result, state;
      encodedHeight = this.gf.texture2D({
        filter: 'linear',
        clamp: 'repeat',
        data: fs.read(name)
      });
      convertHeight = this.gf.shader(fs.read('convertHeight.shader'));
      result = this.gf.texture2D({
        type: 'float',
        width: encodedHeight.width,
        height: encodedHeight.height,
        filter: {
          anisotropy: true,
          minify: 'linear_mipmap_linear',
          magnify: 'linear'
        },
        clamp: 'repeat'
      });
      state = this.gf.state({
        shader: convertHeight,
        framebuffer: {
          color: result
        },
        uniforms: [
          {
            name: 'source',
            type: 'sampler',
            value: encodedHeight
          }, {
            name: 'viewport',
            type: 'vec2',
            value: [encodedHeight.width, encodedHeight.height]
          }, {
            name: 'scaleFactor',
            type: 'float',
            value: scaleFactor
          }
        ]
      });
      state.draw().generateMipmap();
      state.destroy();
      convertHeight.destroy();
      encodedHeight.destroy();
      return result;
    };

    Application.prototype.checkLocation = function() {
      var Section, path, _ref, _ref1;
      path = document.location.hash.substr(1);
      if ((this.currentSection == null) || this.currentSection.constructor.path !== path) {
        Section = (_ref = this.sectionByPath[path]) != null ? _ref : this.sections[0];
        if (this.currentSection != null) {
          this.currentSection.destroy();
        }
        this.currentSection = new Section(this);
        this.camera.position.set(Section.cameraPos);
        this.camera.pitch = (_ref1 = Section.cameraPitch) != null ? _ref1 : 30;
        return this.sectionSelect.val(Section.path);
      }
    };

    Application.prototype.draw = function() {
      this.checkLocation();
      this.gf.frameStart();
      this.camera.update();
      this.currentSection.draw();
      this.gf.frameEnd();
      return requestAnimationFrame(this.draw);
    };

    Application.prototype.addSelect = function(_arg) {
      var container, label, name, onValue, option, optionElem, options, select, value, _i, _len, _ref;
      label = _arg.label, value = _arg.value, options = _arg.options, onValue = _arg.onValue;
      container = $('<div></div>').appendTo('div.controls');
      $('<label></label>').text(label).appendTo(container);
      select = $('<select></select>').appendTo(container).change(function() {
        return onValue(select.val());
      });
      for (_i = 0, _len = options.length; _i < _len; _i++) {
        option = options[_i];
        optionElem = $('<option></option>').appendTo(select);
        if (typeof option === 'string') {
          name = option;
        } else {
          _ref = option, name = _ref.name, option = _ref.option;
        }
        optionElem.text(name).attr('value', option);
      }
      select.val(value);
      onValue(value);
      return container;
    };

    Application.prototype.addCheckbox = function(_arg) {
      var container, input, label, obj, value;
      label = _arg.label, value = _arg.value;
      if (value == null) {
        value = false;
      }
      container = $('<div></div>').appendTo('div.controls');
      $('<label></label>').text(label).appendTo(container);
      input = $('<input type="checkbox"></input').appendTo(container).change(function() {
        obj.value = input[0].checked;
        if (obj.value) {
          return obj.numValue = 1;
        } else {
          return obj.numValue = 0;
        }
      });
      if (value) {
        input.attr('checked', 'checked');
      }
      obj = {
        remove: function() {
          return container.remove();
        },
        value: value,
        numValue: value ? 1 : 0
      };
      return obj;
    };

    Application.prototype.addRange = function(_arg) {
      var container, convert, input, label, max, min, obj, span, step, value;
      label = _arg.label, value = _arg.value, min = _arg.min, max = _arg.max, step = _arg.step, convert = _arg.convert;
      if (convert == null) {
        convert = function(value) {
          return value;
        };
      }
      container = $('<div></div>').appendTo('div.controls');
      $('<label></label>').text(label).appendTo(container);
      input = $('<input type="range"></input>').attr('min', min).attr('max', max).attr('value', value).appendTo(container).bind('input', function() {
        obj.value = convert(parseFloat(input.val()));
        return span.text(obj.value.toFixed(2));
      });
      if (step != null) {
        input.attr('step', step);
      }
      span = $('<span></span>').text(value.toFixed(2)).appendTo(container);
      obj = {
        remove: function() {
          return container.remove();
        },
        value: convert(value)
      };
      return obj;
    };

    return Application;

  })();
  exports.main = function() {
    var app;
    return app = new Application();
  };
  return exports;
});
sys.defFile("/sections/01-grid/display.shader", "#file /sections/01-grid/display.shader\nvarying vec3 vBarycentric;\n\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n                \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n    uniform mat4 proj, view;\n\n    void main(){\n        vBarycentric = barycentric;\n        vec2 pos = transformPosition(position);\n        gl_Position = proj * view * vec4(pos.x, 0, pos.y, 1);\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n\n    void main(){\n        vec3 display = gridLines(vec3(0.3));\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/01-grid/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.4 Rendering the Grid';

    Grid.cameraPos = [0, 2, 4];

    function Grid(app) {
      this.app = app;
      this.state = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: [
            {
              name: 'position',
              size: 2
            }, {
              name: 'barycentric',
              size: 3
            }
          ],
          vertices: this.patch(app.gridSize)
        },
        shader: fs.read('display.shader'),
        depthTest: true
      });
    }

    Grid.prototype.onGridSize = function(size) {
      return this.state.vertices(this.patch(size));
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      return this.state.destroy();
    };

    Grid.prototype.draw = function() {
      return this.state.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('gridScale', this.app.gridScale.value).draw();
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/02-grid-offset/display.shader", "#file /sections/02-grid-offset/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\n    \nuniform float textureScale;\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n                \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n    uniform mat4 proj, view;\n\n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        return texture2D(uTerrain, texcoord).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n        vec2 pos = transformPosition(position);\n        float yOffset = getHeight(pos);\n        gl_Position = proj * view * vec4(pos.x, yOffset, pos.y, 1);\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n\n    void main(){\n        vec3 display = gridLines(vec3(0.3));\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/02-grid-offset/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.5 Offsetting the Grid';

    Grid.cameraPos = [0, 2, 4];

    function Grid(app) {
      this.app = app;
      this.state = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: [
            {
              name: 'position',
              size: 2
            }, {
              name: 'barycentric',
              size: 3
            }
          ],
          vertices: this.patch(app.gridSize)
        },
        shader: fs.read('display.shader'),
        depthTest: true,
        uniforms: [
          {
            name: 'uTerrain',
            type: 'sampler',
            value: app.height
          }
        ]
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
    }

    Grid.prototype.onGridSize = function(size) {
      return this.state.vertices(this.patch(size));
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.state.destroy();
      return this.textureScale.remove();
    };

    Grid.prototype.draw = function() {
      return this.state.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridScale', this.app.gridScale.value).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).draw();
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/03-geomorphing/display.shader", "#file /sections/03-geomorphing/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\n\nuniform float textureScale;\n\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n                \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform float morphFactor;\n    uniform mat4 proj, view;\n\n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        float yOffset = texture2D(uTerrain, texcoord).r*textureScale;\n        return yOffset;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 modPos = mod(position, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(position);\n        float ownHeight = getHeight(ownPosition);\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(position+modPos);\n            vec2 neighbor2Position = transformPosition(position-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position);\n            float neighbor2Height = getHeight(neighbor2Position);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    void main(){\n        vec3 albedo = getAlbedo();\n        vec3 display = gridLines(albedo);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/03-geomorphing/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.6 Geomorphing';

    Grid.cameraPos = [0, 2, 4];

    function Grid(app) {
      this.app = app;
      this.gf = app.gf;
      this.state = this.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: [
            {
              name: 'position',
              size: 2
            }, {
              name: 'barycentric',
              size: 3
            }
          ],
          vertices: this.patch(app.gridSize)
        },
        shader: fs.read('display.shader'),
        depthTest: true,
        uniforms: [
          {
            name: 'uTerrain',
            type: 'sampler',
            value: app.height
          }, {
            name: 'uAlbedo',
            type: 'sampler',
            value: app.albedo
          }
        ]
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.morphFactor = app.addRange({
        label: 'Morph Factor',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01
      });
    }

    Grid.prototype.onGridSize = function(size) {
      return this.state.vertices(this.patch(size));
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.morphFactor.remove();
      this.state.destroy();
      return this.textureScale.remove();
    };

    Grid.prototype.draw = function() {
      return this.state.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridScale', this.app.gridScale.value).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', this.morphFactor.value).draw();
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/04-lighting/display.shader", "#file /sections/04-lighting/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\n\nuniform float textureScale;\n\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n                \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform float morphFactor;\n    uniform mat4 proj, view;\n\n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        return texture2D(uTerrain, texcoord).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 modPos = mod(position, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(position);\n        float ownHeight = getHeight(ownPosition);\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(position+modPos);\n            vec2 neighbor2Position = transformPosition(position-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position);\n            float neighbor2Height = getHeight(neighbor2Position);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n   \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    uniform float showAspect;\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n\n        if(showAspect < 0.5){\n            gl_FragColor = vec4(gridLines(vec3(derivatives*0.5+0.5, 0)), 1);\n        }\n        else if(showAspect > 0.5 && showAspect < 1.5){\n            gl_FragColor = vec4(gridLines(normal*0.5+0.5), 1);\n        }\n        else if(showAspect > 1.5 && showAspect < 2.5){\n            gl_FragColor = vec4(gammasRGB(display), 1);\n        }\n    }");
sys.defModule('/sections/04-lighting/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.7 Derivative Maps and Lighting';

    Grid.cameraPos = [0, 2, 4];

    function Grid(app) {
      this.app = app;
      this.state = this.app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: [
            {
              name: 'position',
              size: 2
            }, {
              name: 'barycentric',
              size: 3
            }
          ],
          vertices: this.patch(app.gridSize)
        },
        shader: fs.read('display.shader'),
        depthTest: true,
        uniforms: [
          {
            name: 'uTerrain',
            type: 'sampler',
            value: app.height
          }, {
            name: 'uAlbedo',
            type: 'sampler',
            value: app.albedo
          }
        ]
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.morphFactor = app.addRange({
        label: 'Morph Factor',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01
      });
      this.aspectSelect = app.addSelect({
        label: 'Aspect',
        value: 2,
        options: [
          {
            name: 'Derivatives',
            option: 0
          }, {
            name: 'Normals',
            option: 1
          }, {
            name: 'Lit',
            option: 2
          }
        ],
        onValue: (function(_this) {
          return function(value) {
            console.log(value);
            return _this.aspectNum = parseInt(value, 10);
          };
        })(this)
      });
    }

    Grid.prototype.onGridSize = function(size) {
      return this.state.vertices(this.patch(size));
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.state.destroy();
      this.textureScale.remove();
      this.morphFactor.remove();
      return this.aspectSelect.remove();
    };

    Grid.prototype.draw = function() {
      return this.state.uniformSetter(this.app.camera).float('showAspect', this.aspectNum).float('showGridLines', this.app.gridLines).float('gridScale', this.app.gridScale.value).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', this.morphFactor.value).draw();
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/05-moving-the-grid/display.shader", "#file /sections/05-moving-the-grid/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\n\nuniform float textureScale;\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n\nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform float morphFactor;\n    uniform mat4 proj, view, invView;\n    \n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        return texture2D(uTerrain, texcoord).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 cameraPosition = invTransformPosition((invView * vec4(0, 0, 0, 1)).xz);\n        vec2 pos = position + floor(cameraPosition+0.5);\n\n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition);\n        \n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position);\n            float neighbor2Height = getHeight(neighbor2Position);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/05-moving-the-grid/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.8 Moving the Grid';

    Grid.cameraPos = [0, 0.1, 0];

    function Grid(app) {
      this.app = app;
      this.state = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: [
            {
              name: 'position',
              size: 2
            }, {
              name: 'barycentric',
              size: 3
            }
          ],
          vertices: this.patch(app.gridSize)
        },
        shader: fs.read('display.shader'),
        depthTest: true,
        uniforms: [
          {
            name: 'uTerrain',
            type: 'sampler',
            value: app.height
          }, {
            name: 'uAlbedo',
            type: 'sampler',
            value: app.albedo
          }
        ]
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.morphFactor = app.addRange({
        label: 'Morph Factor',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01
      });
    }

    Grid.prototype.onGridSize = function(size) {
      return this.state.vertices(this.patch(size));
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.state.destroy();
      this.textureScale.remove();
      return this.morphFactor.remove();
    };

    Grid.prototype.draw = function() {
      return this.state.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridScale', this.app.gridScale.value).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', this.morphFactor.value).draw();
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/06-nesting-grids/display.shader", "#file /sections/06-nesting-grids/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\n\nuniform float textureScale;\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n\nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform float morphFactor;\n    uniform mat4 proj, view, invView;\n    \n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        return texture2D(uTerrain, texcoord).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 cameraPosition = invTransformPosition((invView * vec4(0, 0, 0, 1)).xz);\n        vec2 pos = position + floor(cameraPosition+0.5);\n\n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition);\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position);\n            float neighbor2Height = getHeight(neighbor2Position);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/06-nesting-grids/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.9 Nesting Grids';

    Grid.cameraPos = [0, 10, 0];

    Grid.cameraPitch = 90;

    function Grid(app) {
      var pointers, uniforms;
      this.app = app;
      this.shader = app.gf.shader(fs.read('display.shader'));
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.morphFactor = app.addRange({
        label: 'Morph Factor',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.shader.destroy();
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      this.morphFactor.remove();
      return this.gridLevels.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', this.morphFactor.value);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/07-gaps/display.shader", "#file /sections/07-gaps/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\n\nuniform float textureScale;\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n\nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform float morphFactor;\n    uniform mat4 proj, view, invView;\n    \n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        return texture2D(uTerrain, texcoord).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 cameraPosition = invTransformPosition((invView * vec4(0, 0, 0, 1)).xz);\n        vec2 pos = position + floor(cameraPosition+0.5);\n\n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition);\n        \n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position);\n            float neighbor2Height = getHeight(neighbor2Position);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/07-gaps/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.10 Filling the grid gaps';

    Grid.cameraPos = [0, 0.5, 0];

    Grid.cameraPitch = 10;

    function Grid(app) {
      var pointers, uniforms;
      this.app = app;
      this.shader = app.gf.shader(fs.read('display.shader'));
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.morphFactor = app.addRange({
        label: 'Morph Factor',
        value: 1,
        min: 0,
        max: 1,
        step: 0.01
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      size += 1;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      size += 1;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.shader.destroy();
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      this.morphFactor.remove();
      return this.gridLevels.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', this.morphFactor.value);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/08-lod-morph/display.shader", "#file /sections/08-lod-morph/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\nvarying float morphFactor;\n\nuniform float textureScale;\nuniform float gridSize, gridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n\nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform mat4 proj, view, invView;\n    \n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position){\n        vec2 texcoord = position/textureScale;\n        return texture2D(uTerrain, texcoord).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 cameraPosition = invTransformPosition((invView * vec4(0, 0, 0, 1)).xz);\n        vec2 pos = position + floor(cameraPosition+0.5);\n    \n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition);\n            \n        vec2 cameraDelta = abs(pos - cameraPosition);\n        float chebyshevDistance = max(cameraDelta.x, cameraDelta.y);\n        morphFactor = linstep(\n            gridSize/4.0+1.0,\n            gridSize/2.0-1.0,\n            chebyshevDistance\n        );\n        \n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position);\n            float neighbor2Height = getHeight(neighbor2Position);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    uniform float showMorphFactor;\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(mix(gammasRGB(excident), vec3(morphFactor), showMorphFactor));\n        gl_FragColor = vec4(display, 1);\n    }");
sys.defModule('/sections/08-lod-morph/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.11 Morph factor between LOD levels';

    Grid.cameraPos = [0, 0.5, 0];

    Grid.cameraPitch = 10;

    function Grid(app) {
      var pointers, uniforms;
      this.app = app;
      this.shader = app.gf.shader(fs.read('display.shader'));
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
      this.showMorphFactor = app.addCheckbox({
        label: 'Morph Factor',
        value: false
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      size += 1;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      size += 1;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.shader.destroy();
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      this.gridLevels.remove();
      return this.showMorphFactor.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('showMorphFactor', this.showMorphFactor.numValue);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/09-mip-level/display.shader", "#file /sections/09-mip-level/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\nvarying float morphFactor;\n\nuniform float textureScale;\nuniform float gridSize, gridScale, startGridScale;\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n\nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform mat4 proj, view, invView;\n   \n    float getMiplevel(vec2 position, float texelSize){\n        float dist = max(abs(position.x), abs(position.y));\n\n        float cellSize = startGridScale/(gridSize*2.0);\n\n        float correction = log2(cellSize/texelSize);\n        float distanceLevel = max(0.0, log2(dist*4.0/startGridScale));\n\n        return distanceLevel+correction;\n    }\n\n    uniform sampler2D uTerrain;\n    uniform float terrainSize;\n    float getHeight(vec2 position, vec2 camera){\n        float texelSize = textureScale/terrainSize;\n        float miplevel = getMiplevel(abs(position - camera), texelSize);\n        vec2 texcoord = position/textureScale;\n        return texture2DLod(uTerrain, texcoord, miplevel).x*textureScale;\n    }\n\n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 worldCameraPosition = (invView * vec4(0, 0, 0, 1)).xz;\n        vec2 cameraPosition = invTransformPosition(worldCameraPosition);\n        vec2 pos = position + floor(cameraPosition+0.5);\n        \n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition, worldCameraPosition);\n            \n        vec2 cameraDelta = abs(pos - cameraPosition);\n        float chebyshevDistance = max(cameraDelta.x, cameraDelta.y);\n        morphFactor = linstep(\n            gridSize/4.0+1.0,\n            gridSize/2.0-1.0,\n            chebyshevDistance\n        );\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position, worldCameraPosition);\n            float neighbor2Height = getHeight(neighbor2Position, worldCameraPosition);\n\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/09-mip-level/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.12 Texture MIP Level selection';

    Grid.cameraPos = [0, 0.5, 0];

    Grid.cameraPitch = 10;

    function Grid(app) {
      var pointers, uniforms;
      this.app = app;
      this.shader = app.gf.shader(fs.read('display.shader'));
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      size += 1;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      size += 1;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      this.shader.destroy();
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      return this.gridLevels.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('terrainSize', this.app.height.width).float('startGridScale', this.app.gridScale.value).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', 1);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/10-magnification/display.shader", "#file /sections/10-magnification/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\nvarying float morphFactor;\n    \nuniform float textureScale;\nuniform float gridSize, gridScale, startGridScale;\n\nuniform float terrainSize;\n\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n    \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform mat4 proj, view, invView;\n    \n    float getMiplevel(vec2 position, float texelSize){\n        float dist = max(abs(position.x), abs(position.y));\n\n        float cellSize = startGridScale/(gridSize*2.0);\n\n        float correction = log2(cellSize/texelSize);\n        float distanceLevel = max(0.0, log2(dist*4.0/startGridScale));\n\n        return distanceLevel+correction;\n    }\n\n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position, vec2 camera){\n        float texelSize = textureScale/terrainSize;\n        float miplevel = getMiplevel(abs(position - camera), texelSize);\n        vec2 texcoord = position/textureScale;\n            \n        float mipHeight = texture2DLod(\n            uTerrain, texcoord, max(1.0, miplevel)\n        ).x*textureScale;\n       \n        if(miplevel >= 1.0){\n            return mipHeight;\n        }\n        else{\n            float baseHeight = texture2DInterp(\n                uTerrain, texcoord, vec2(terrainSize)\n            ).x*textureScale;\n            return mix(\n                baseHeight, mipHeight, max(0.0, miplevel)\n            );\n        }\n    }\n    \n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 worldCameraPosition = (invView * vec4(0, 0, 0, 1)).xz;\n        vec2 cameraPosition = invTransformPosition(worldCameraPosition);\n        vec2 pos = position + floor(cameraPosition+0.5);\n        \n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition, worldCameraPosition);\n            \n        vec2 cameraDelta = abs(pos - cameraPosition);\n        float chebyshevDistance = max(cameraDelta.x, cameraDelta.y);\n        morphFactor = linstep(\n            gridSize/4.0+1.0,\n            gridSize/2.0-1.0,\n            chebyshevDistance\n        );\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position, worldCameraPosition);\n            float neighbor2Height = getHeight(neighbor2Position, worldCameraPosition);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    uniform sampler2D uAlbedo;\n    vec3 getAlbedo(){\n        vec2 texcoord = vPosition/textureScale;\n        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n    }\n\n    uniform sampler2D uTerrain;\n    vec2 getDerivatives(){\n        vec2 texcoord = vPosition/textureScale;\n        return texture2D(uTerrain, texcoord).yz;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n\n    void main(){\n        vec2 derivatives = getDerivatives();\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo();\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/10-magnification/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.13 Magnifification';

    Grid.cameraPos = [0, 0.5, 0];

    Grid.cameraPitch = 10;

    function Grid(app) {
      var i, name, pointers, shader, uniforms, _i, _j, _len, _len1, _ref, _ref1;
      this.app = app;
      this.shaders = [];
      _ref = ['lerp', 'smoothstep', 'euclidian', 'classicBicubic'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this.shaders.push({
          name: name,
          shader: app.gf.shader([fs.read('texfuns/rect.shader'), fs.read("texfuns/" + name + ".shader"), fs.read('display.shader')])
        });
      }
      _ref1 = ['bicubicLinear', 'polynom6th', 'bicubicSmoothstep', 'bspline', 'bell', 'catmull-rom'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        name = _ref1[_j];
        this.shaders.push({
          name: name,
          shader: app.gf.shader([fs.read('texfuns/rect.shader'), fs.read("texfuns/" + name + ".shader"), fs.read("texfuns/generalBicubic.shader"), fs.read('display.shader')])
        });
      }
      this.shader = app.gf.shaderProxy(this.shaders[0].shader);
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
      this.shaderSelect = app.addSelect({
        label: 'Interpolation',
        value: 0,
        options: (function() {
          var _k, _len2, _ref2, _results;
          _ref2 = this.shaders;
          _results = [];
          for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
            shader = _ref2[i];
            _results.push({
              name: shader.name,
              option: i
            });
          }
          return _results;
        }).call(this),
        onValue: (function(_this) {
          return function(value) {
            return _this.shader.shader = _this.shaders[parseInt(value, 10)].shader;
          };
        })(this)
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      size += 1;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      size += 1;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      var shader, _i, _len, _ref;
      this.shaderSelect.remove();
      _ref = this.shaders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        shader = _ref[_i];
        shader.shader.destroy();
      }
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      return this.gridLevels.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('terrainSize', this.app.height.width).float('startGridScale', this.app.gridScale.value).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('morphFactor', 1);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/10-magnification/texfuns/bell.shader", "#file /sections/10-magnification/texfuns/bell.shader\nvertex:\n    float interp(float x){\n        float f = ( x / 2.0 ) * 1.5; // Converting -2 to +2 to -1.5 to +1.5\n        if( f > -1.5 && f < -0.5 ){\n            return( 0.5 * pow(f + 1.5, 2.0));\n        }\n        else if( f > -0.5 && f < 0.5 ){\n            return 3.0 / 4.0 - ( f * f );\n        }\n        else if( ( f > 0.5 && f < 1.5 ) ){\n            return( 0.5 * pow(f - 1.5, 2.0));\n        }\n        return 0.0;\n    }");
sys.defFile("/sections/10-magnification/texfuns/bicubicLinear.shader", "#file /sections/10-magnification/texfuns/bicubicLinear.shader\nvertex:\n    float interp(float x){\n        return 1.0-linstep(0.0, 1.5, abs(x));\n    } ");
sys.defFile("/sections/10-magnification/texfuns/bicubicSmoothstep.shader", "#file /sections/10-magnification/texfuns/bicubicSmoothstep.shader\nvertex:\n    float interp(float x){\n        return 1.0-smoothstep(0.0, 1.5, abs(x));\n    } ");
sys.defFile("/sections/10-magnification/texfuns/bspline.shader", "#file /sections/10-magnification/texfuns/bspline.shader\nvertex:\n    float interp(float x){\n        float f = x;\n        if(f < 0.0){\n            f = -f;\n        }\n        if(f >= 0.0 && f <= 1.0){\n            return ( 2.0 / 3.0 ) + ( 0.5 ) * ( f* f * f ) - (f*f);\n        }\n        else if( f > 1.0 && f <= 2.0 ){\n            return 1.0 / 6.0 * pow( ( 2.0 - f  ), 3.0 );\n        }\n        return 1.0;\n    }");
sys.defFile("/sections/10-magnification/texfuns/catmull-rom.shader", "#file /sections/10-magnification/texfuns/catmull-rom.shader\nvertex:\n    float interp(float x){\n        const float B = 0.0;\n        const float C = 0.5;\n        float f = x;\n        if( f < 0.0 ){\n            f = -f;\n        }\n        if( f < 1.0 ){\n            return ( ( 12.0 - 9.0 * B - 6.0 * C ) * ( f * f * f ) +\n                ( -18.0 + 12.0 * B + 6.0 *C ) * ( f * f ) +\n                ( 6.0 - 2.0 * B ) ) / 6.0;\n        }\n        else if( f >= 1.0 && f < 2.0 ){\n            return ( ( -B - 6.0 * C ) * ( f * f * f )\n                + ( 6.0 * B + 30.0 * C ) * ( f *f ) +\n                ( - ( 12.0 * B ) - 48.0 * C  ) * f +\n                8.0 * B + 24.0 * C)/ 6.0;\n        }\n        else{\n            return 0.0;\n        }\n    }");
sys.defFile("/sections/10-magnification/texfuns/classicBicubic.shader", "#file /sections/10-magnification/texfuns/classicBicubic.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n\n        vec2 st0 = ((2.0 - f) * f - 1.0) * f;\n        vec2 st1 = (3.0 * f - 5.0) * f * f + 2.0;\n        vec2 st2 = ((4.0 - 3.0 * f) * f + 1.0) * f;\n        vec2 st3 = (f - 1.0) * f * f;\n        vec4 row0 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, -1.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, -1.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, -1.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, -1.0), size);\n        vec4 row1 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 0.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 0.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 0.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 0.0), size);\n        vec4 row2 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 1.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 1.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 1.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 1.0), size);\n        vec4 row3 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 2.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 2.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 2.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 2.0), size);\n\n        return 0.25 * ((st0.t * row0) + (st1.t * row1) + (st2.t * row2) + (st3.t * row3));\n    }");
sys.defFile("/sections/10-magnification/texfuns/euclidian.shader", "#file /sections/10-magnification/texfuns/euclidian.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n\n        vec4 sum = vec4(0.0);\n        float denom = 0.0;\n        for(int x = -1; x <=2; x++){\n            for(int y =-1; y<= 2; y++){\n                vec4 color = texture2DRect(source, c + vec2(x,y), size);\n                float dist = distance(vec2(x,y), f);\n                float factor = 1.0-smoothstep(0.0, 2.0, dist);\n                sum += color * factor;\n                denom += factor;\n            }\n        }\n        return sum/denom;\n    }\n");
sys.defFile("/sections/10-magnification/texfuns/generalBicubic.shader", "#file /sections/10-magnification/texfuns/generalBicubic.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n        vec4 sum = vec4(0.0);\n        float denom = 0.0;\n        for(int x = -1; x <=2; x++){\n            for(int y =-1; y<= 2; y++){\n                vec4 color = texture2DRect(source, c + vec2(x,y), size);\n                float fx  = interp(float(x) - f.x);\n                float fy = interp(float(y) - f.y);\n                sum += color * fx * fy;\n                denom += fx*fy;\n            }\n        }\n        return sum/denom;\n    }");
sys.defFile("/sections/10-magnification/texfuns/lerp.shader", "#file /sections/10-magnification/texfuns/lerp.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*terrainSize-0.5);\n        vec2 c = floor(coord*terrainSize-0.5);\n\n        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);\n        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);\n        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);\n        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);\n\n        vec4 a = mix(lb, lt, f.t);\n        vec4 b = mix(rb, rt, f.t);\n        return mix(a, b, f.s);\n    }");
sys.defFile("/sections/10-magnification/texfuns/polynom6th.shader", "#file /sections/10-magnification/texfuns/polynom6th.shader\nvertex:\n    float interp(float x){\n        float t = 1.0-linstep(0.0, 1.5, abs(x));\n        return t*t*t*(t*(t*6.0-15.0)+10.0);\n    } ");
sys.defFile("/sections/10-magnification/texfuns/rect.shader", "#file /sections/10-magnification/texfuns/rect.shader\nvertex:\n    vec4 texture2DRect(sampler2D source, vec2 coord, vec2 size){\n        return texture2DLod(source, (coord+0.5)/size, 0.0);\n    }");
sys.defFile("/sections/10-magnification/texfuns/smoothstep.shader", "#file /sections/10-magnification/texfuns/smoothstep.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = smoothstep(0.0, 1.0, fract(coord*terrainSize-0.5));\n        vec2 c = floor(coord*terrainSize-0.5);\n\n        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);\n        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);\n        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);\n        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);\n\n        vec4 a = mix(lb, lt, f.t);\n        vec4 b = mix(rb, rt, f.t);\n        return mix(a, b, f.s);\n    }");
sys.defFile("/sections/11-detail-mapping/display.shader", "#file /sections/11-detail-mapping/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\nvarying float morphFactor;\n    \nuniform float textureScale, detailScale, showDetail;\nuniform float gridSize, gridScale, startGridScale;\n\nuniform float terrainSize, detailSize;\n\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n    \nuniform sampler2D uMaterialMix;\nvec3 getMaterialMix(vec2 position){\n    vec2 texcoord = vPosition/textureScale;\n    vec3 mixFactors = texture2D(uMaterialMix, position/textureScale).rgb;\n    return mixFactors /= (mixFactors.r + mixFactors.g + mixFactors.b);\n}\n    \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform mat4 proj, view, invView;\n    \n    float getMiplevel(vec2 position, float texelSize){\n        float dist = max(abs(position.x), abs(position.y));\n\n        float cellSize = startGridScale/(gridSize*2.0);\n\n        float correction = log2(cellSize/texelSize);\n        float distanceLevel = max(0.0, log2(dist*4.0/startGridScale));\n\n        return distanceLevel+correction;\n    }\n   \n    uniform sampler2D uRockHeight, uGrassHeight, uDirtHeight;\n    float getDetailHeight(vec2 position, vec2 camera){\n        float scaleFactor = textureScale*detailScale;\n        float texelSize = scaleFactor/detailSize;\n        vec2 texcoord = position/scaleFactor;\n\n        float miplevel = getMiplevel(abs(position - camera), texelSize);\n\n        float rockHeight = texture2DLod(uRockHeight, texcoord, miplevel).x;\n        float grassHeight = texture2DLod(uGrassHeight, texcoord, miplevel).x;\n        float dirtHeight = texture2DLod(uDirtHeight, texcoord, miplevel).x;\n\n        vec3 mixFactors = getMaterialMix(position);\n\n        return (\n            mixFactors.r*dirtHeight +\n            mixFactors.g*grassHeight +\n            mixFactors.b*rockHeight\n        )*detailScale*textureScale*showDetail;\n    }\n\n    uniform sampler2D uTerrain;\n    float getHeight(vec2 position, vec2 camera){\n        float texelSize = textureScale/terrainSize;\n        float miplevel = getMiplevel(abs(position - camera), texelSize);\n        vec2 texcoord = position/textureScale;\n            \n        float mipHeight = texture2DLod(\n            uTerrain, texcoord, max(1.0, miplevel)\n        ).x*textureScale;\n\n        float detailHeight = getDetailHeight(position, camera);\n       \n        if(miplevel >= 1.0){\n            return detailHeight+mipHeight;\n        }\n        else{\n            float baseHeight = texture2DInterp(\n                uTerrain, texcoord, vec2(terrainSize)\n            ).x*textureScale;\n\n            return detailHeight+mix(\n                baseHeight, mipHeight, max(0.0, miplevel)\n            );\n        }\n    }\n    \n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 worldCameraPosition = (invView * vec4(0, 0, 0, 1)).xz;\n        vec2 cameraPosition = invTransformPosition(worldCameraPosition);\n        vec2 pos = position + floor(cameraPosition+0.5);\n        \n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownPosition = vPosition = transformPosition(pos);\n        float ownHeight = getHeight(ownPosition, worldCameraPosition);\n            \n        vec2 cameraDelta = abs(pos - cameraPosition);\n        float chebyshevDistance = max(cameraDelta.x, cameraDelta.y);\n        morphFactor = linstep(\n            gridSize/4.0+1.0,\n            gridSize/2.0-1.0,\n            chebyshevDistance\n        );\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Position = transformPosition(pos+modPos);\n            vec2 neighbor2Position = transformPosition(pos-modPos);\n\n            float neighbor1Height = getHeight(neighbor1Position, worldCameraPosition);\n            float neighbor2Height = getHeight(neighbor2Position, worldCameraPosition);\n\n            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;\n            float yOffset = mix(ownHeight, neighborHeight, morphFactor);\n\n            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);\n        }\n\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n\n    vec3 getDetailColor(sampler2D source){\n        vec2 texcoord = (vPosition/textureScale)/detailScale;\n        return degammasRGB(texture2D(source, texcoord).rgb);\n    }\n\n    uniform sampler2D uAlbedo;\n    uniform sampler2D uRockColor, uDirtColor, uGrassColor;\n    uniform vec3 rockAvg, dirtAvg, grassAvg;\n    vec3 getAlbedo(vec3 materialMix){\n        vec2 texcoord = vPosition/textureScale;\n        vec3 albedo = degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n\n        vec3 rockAlbedo = (albedo/rockAvg)*getDetailColor(uRockColor);\n        vec3 dirtAlbedo = (albedo/dirtAvg)*getDetailColor(uDirtColor);\n        vec3 grassAlbedo = (albedo/grassAvg)*getDetailColor(uGrassColor);\n\n        vec3 detail = (\n            materialMix.x*dirtAlbedo +\n            materialMix.y*grassAlbedo +\n            materialMix.z*rockAlbedo\n        );\n        return mix(albedo, detail, showDetail);\n    }\n\n    vec2 getDetailDerivatives(sampler2D source){\n        vec2 texcoord = (vPosition/textureScale)/detailScale;\n        return texture2D(source, texcoord).yz;\n    }\n\n    uniform sampler2D uTerrain;\n    uniform sampler2D uRockHeight, uDirtHeight, uGrassHeight;\n    vec2 getDerivatives(vec3 materialMix){\n        vec2 texcoord = vPosition/textureScale;\n        vec2 derivatives = texture2D(uTerrain, texcoord).yz;\n\n        vec2 rockDerivatives = getDetailDerivatives(uRockHeight);\n        vec2 dirtDerivatives = getDetailDerivatives(uDirtHeight);\n        vec2 grassDerivatives = getDetailDerivatives(uGrassHeight);\n\n        vec2 detailDerivatives = (\n            materialMix.r*dirtDerivatives +\n            materialMix.g*grassDerivatives +\n            materialMix.b*rockDerivatives\n        );\n\n        return derivatives + detailDerivatives*showDetail;\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n   \n    void main(){\n        vec3 materialMix = getMaterialMix(vPosition);\n        vec2 derivatives = getDerivatives(materialMix);\n        vec3 normal = getNormal(derivatives);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo(materialMix);\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/11-detail-mapping/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.13 Detail Mapping';

    Grid.cameraPos = [0, 0.5, 0];

    Grid.cameraPitch = 10;

    function Grid(app) {
      var i, name, pointers, shader, uniforms, _i, _j, _len, _len1, _ref, _ref1;
      this.app = app;
      this.shaders = [];
      _ref = ['lerp', 'smoothstep', 'euclidian', 'classicBicubic'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this.shaders.push({
          cull: 'back',
          name: name,
          shader: app.gf.shader([fs.read('texfuns/rect.shader'), fs.read("texfuns/" + name + ".shader"), fs.read('display.shader')])
        });
      }
      _ref1 = ['bicubicLinear', 'polynom6th', 'bicubicSmoothstep', 'bspline', 'bell', 'catmull-rom'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        name = _ref1[_j];
        this.shaders.push({
          cull: 'back',
          name: name,
          shader: app.gf.shader([fs.read('texfuns/rect.shader'), fs.read("texfuns/" + name + ".shader"), fs.read("texfuns/generalBicubic.shader"), fs.read('display.shader')])
        });
      }
      this.shader = app.gf.shaderProxy(this.shaders[0].shader);
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uDirtHeight',
          type: 'sampler',
          value: app.dirtHeight
        }, {
          name: 'uDirtColor',
          type: 'sampler',
          value: app.dirtColor
        }, {
          name: 'uGrassHeight',
          type: 'sampler',
          value: app.grassHeight
        }, {
          name: 'uGrassColor',
          type: 'sampler',
          value: app.grassColor
        }, {
          name: 'uRockHeight',
          type: 'sampler',
          value: app.rockHeight
        }, {
          name: 'uRockColor',
          type: 'sampler',
          value: app.rockColor
        }, {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }, {
          name: 'uMaterialMix',
          type: 'sampler',
          value: app.materialMix
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
      this.shaderSelect = app.addSelect({
        label: 'Interpolation',
        value: 0,
        options: (function() {
          var _k, _len2, _ref2, _results;
          _ref2 = this.shaders;
          _results = [];
          for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
            shader = _ref2[i];
            _results.push({
              name: shader.name,
              option: i
            });
          }
          return _results;
        }).call(this),
        onValue: (function(_this) {
          return function(value) {
            return _this.shader.shader = _this.shaders[parseInt(value, 10)].shader;
          };
        })(this)
      });
      this.showDetail = app.addCheckbox({
        label: 'Enable Detail',
        value: true
      });
      this.detailScale = app.addRange({
        label: 'Detail Scale',
        value: 0.1,
        min: 0,
        max: 0.5,
        step: 0.001
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      size += 1;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      size += 1;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      var shader, _i, _len, _ref;
      _ref = this.shaders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        shader = _ref[_i];
        shader.shader.destroy();
      }
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      this.gridLevels.remove();
      this.shaderSelect.remove();
      this.showDetail.remove();
      return this.detailScale.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('terrainSize', this.app.height.width).float('detailSize', this.app.dirtHeight.width).float('startGridScale', this.app.gridScale.value).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('showDetail', this.showDetail.numValue).float('detailScale', this.detailScale.value).float('morphFactor', 1).vec3('dirtAvg', 0.287469395055, 0.120516057539, 0.0431425926961).vec3('grassAvg', 0.24244317307, 0.284209597124, 0.00726620932363).vec3('rockAvg', 0.451768651247, 0.451768651247, 0.451768651247);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/11-detail-mapping/texfuns/bell.shader", "#file /sections/11-detail-mapping/texfuns/bell.shader\nvertex:\n    float interp(float x){\n        float f = ( x / 2.0 ) * 1.5; // Converting -2 to +2 to -1.5 to +1.5\n        if( f > -1.5 && f < -0.5 ){\n            return( 0.5 * pow(f + 1.5, 2.0));\n        }\n        else if( f > -0.5 && f < 0.5 ){\n            return 3.0 / 4.0 - ( f * f );\n        }\n        else if( ( f > 0.5 && f < 1.5 ) ){\n            return( 0.5 * pow(f - 1.5, 2.0));\n        }\n        return 0.0;\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/bicubicLinear.shader", "#file /sections/11-detail-mapping/texfuns/bicubicLinear.shader\nvertex:\n    float interp(float x){\n        return 1.0-linstep(0.0, 1.5, abs(x));\n    } ");
sys.defFile("/sections/11-detail-mapping/texfuns/bicubicSmoothstep.shader", "#file /sections/11-detail-mapping/texfuns/bicubicSmoothstep.shader\nvertex:\n    float interp(float x){\n        return 1.0-smoothstep(0.0, 1.5, abs(x));\n    } ");
sys.defFile("/sections/11-detail-mapping/texfuns/bspline.shader", "#file /sections/11-detail-mapping/texfuns/bspline.shader\nvertex:\n    float interp(float x){\n        float f = x;\n        if(f < 0.0){\n            f = -f;\n        }\n        if(f >= 0.0 && f <= 1.0){\n            return ( 2.0 / 3.0 ) + ( 0.5 ) * ( f* f * f ) - (f*f);\n        }\n        else if( f > 1.0 && f <= 2.0 ){\n            return 1.0 / 6.0 * pow( ( 2.0 - f  ), 3.0 );\n        }\n        return 1.0;\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/catmull-rom.shader", "#file /sections/11-detail-mapping/texfuns/catmull-rom.shader\nvertex:\n    float interp(float x){\n        const float B = 0.0;\n        const float C = 0.5;\n        float f = x;\n        if( f < 0.0 ){\n            f = -f;\n        }\n        if( f < 1.0 ){\n            return ( ( 12.0 - 9.0 * B - 6.0 * C ) * ( f * f * f ) +\n                ( -18.0 + 12.0 * B + 6.0 *C ) * ( f * f ) +\n                ( 6.0 - 2.0 * B ) ) / 6.0;\n        }\n        else if( f >= 1.0 && f < 2.0 ){\n            return ( ( -B - 6.0 * C ) * ( f * f * f )\n                + ( 6.0 * B + 30.0 * C ) * ( f *f ) +\n                ( - ( 12.0 * B ) - 48.0 * C  ) * f +\n                8.0 * B + 24.0 * C)/ 6.0;\n        }\n        else{\n            return 0.0;\n        }\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/classicBicubic.shader", "#file /sections/11-detail-mapping/texfuns/classicBicubic.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n\n        vec2 st0 = ((2.0 - f) * f - 1.0) * f;\n        vec2 st1 = (3.0 * f - 5.0) * f * f + 2.0;\n        vec2 st2 = ((4.0 - 3.0 * f) * f + 1.0) * f;\n        vec2 st3 = (f - 1.0) * f * f;\n        vec4 row0 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, -1.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, -1.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, -1.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, -1.0), size);\n        vec4 row1 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 0.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 0.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 0.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 0.0), size);\n        vec4 row2 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 1.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 1.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 1.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 1.0), size);\n        vec4 row3 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 2.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 2.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 2.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 2.0), size);\n\n        return 0.25 * ((st0.t * row0) + (st1.t * row1) + (st2.t * row2) + (st3.t * row3));\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/euclidian.shader", "#file /sections/11-detail-mapping/texfuns/euclidian.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n\n        vec4 sum = vec4(0.0);\n        float denom = 0.0;\n        for(int x = -1; x <=2; x++){\n            for(int y =-1; y<= 2; y++){\n                vec4 color = texture2DRect(source, c + vec2(x,y), size);\n                float dist = distance(vec2(x,y), f);\n                float factor = 1.0-smoothstep(0.0, 2.0, dist);\n                sum += color * factor;\n                denom += factor;\n            }\n        }\n        return sum/denom;\n    }\n");
sys.defFile("/sections/11-detail-mapping/texfuns/generalBicubic.shader", "#file /sections/11-detail-mapping/texfuns/generalBicubic.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n        vec4 sum = vec4(0.0);\n        float denom = 0.0;\n        for(int x = -1; x <=2; x++){\n            for(int y =-1; y<= 2; y++){\n                vec4 color = texture2DRect(source, c + vec2(x,y), size);\n                float fx  = interp(float(x) - f.x);\n                float fy = interp(float(y) - f.y);\n                sum += color * fx * fy;\n                denom += fx*fy;\n            }\n        }\n        return sum/denom;\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/lerp.shader", "#file /sections/11-detail-mapping/texfuns/lerp.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*terrainSize-0.5);\n        vec2 c = floor(coord*terrainSize-0.5);\n\n        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);\n        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);\n        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);\n        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);\n\n        vec4 a = mix(lb, lt, f.t);\n        vec4 b = mix(rb, rt, f.t);\n        return mix(a, b, f.s);\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/polynom6th.shader", "#file /sections/11-detail-mapping/texfuns/polynom6th.shader\nvertex:\n    float interp(float x){\n        float t = 1.0-linstep(0.0, 1.5, abs(x));\n        return t*t*t*(t*(t*6.0-15.0)+10.0);\n    } ");
sys.defFile("/sections/11-detail-mapping/texfuns/rect.shader", "#file /sections/11-detail-mapping/texfuns/rect.shader\nvertex:\n    vec4 texture2DRect(sampler2D source, vec2 coord, vec2 size){\n        return texture2DLod(source, (coord+0.5)/size, 0.0);\n    }");
sys.defFile("/sections/11-detail-mapping/texfuns/smoothstep.shader", "#file /sections/11-detail-mapping/texfuns/smoothstep.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = smoothstep(0.0, 1.0, fract(coord*terrainSize-0.5));\n        vec2 c = floor(coord*terrainSize-0.5);\n\n        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);\n        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);\n        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);\n        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);\n\n        vec4 a = mix(lb, lt, f.t);\n        vec4 b = mix(rb, rt, f.t);\n        return mix(a, b, f.s);\n    }");
sys.defFile("/sections/12-detail-normal-direction/display.shader", "#file /sections/12-detail-normal-direction/display.shader\nvarying vec2 vPosition;\nvarying vec3 vBarycentric;\nvarying float morphFactor;\n    \nuniform float textureScale, detailScale, showDetail;\nuniform float gridSize, gridScale, startGridScale;\n\nuniform float terrainSize, detailSize;\n\nvec2 transformPosition(vec2 position){\n    return (position/gridSize)*gridScale;\n}\n\nvec2 invTransformPosition(vec2 position){\n    return (position/gridScale)*gridSize;\n}\n    \nuniform sampler2D uMaterialMix;\nvec3 getMaterialMix(vec2 position){\n    vec2 texcoord = vPosition/textureScale;\n    vec3 mixFactors = texture2D(uMaterialMix, position/textureScale).rgb;\n    return mixFactors /= (mixFactors.r + mixFactors.g + mixFactors.b);\n}\n    \nvertex:\n    attribute vec2 position;\n    attribute vec3 barycentric;\n\n    uniform mat4 proj, view, invView;\n\n    vec3 getNormal(vec2 derivatives){\n        vec3 sDirection = vec3(1, derivatives.s, 0);\n        vec3 tDirection = vec3(0, derivatives.t, 1);\n        return normalize(cross(tDirection, sDirection));\n    }\n    \n    float getMiplevel(vec2 position, float texelSize){\n        float dist = max(abs(position.x), abs(position.y));\n\n        float cellSize = startGridScale/(gridSize*2.0);\n\n        float correction = log2(cellSize/texelSize);\n        float distanceLevel = max(0.0, log2(dist*4.0/startGridScale));\n\n        return distanceLevel+correction;\n    }\n   \n    uniform sampler2D uRockHeight, uGrassHeight, uDirtHeight;\n    float getDetailHeight(vec2 position, vec2 camera){\n        float scaleFactor = textureScale*detailScale;\n        float texelSize = scaleFactor/detailSize;\n        vec2 texcoord = position/scaleFactor;\n\n        float miplevel = getMiplevel(abs(position - camera), texelSize);\n\n        float rockHeight = texture2DLod(uRockHeight, texcoord, miplevel).x;\n        float grassHeight = texture2DLod(uGrassHeight, texcoord, miplevel).x;\n        float dirtHeight = texture2DLod(uDirtHeight, texcoord, miplevel).x;\n\n        vec3 mixFactors = getMaterialMix(position);\n\n        return (\n            mixFactors.r*dirtHeight +\n            mixFactors.g*grassHeight +\n            mixFactors.b*rockHeight\n        )*detailScale*textureScale*showDetail;\n    }\n\n    uniform sampler2D uTerrain;\n    vec3 getOffsetPosition(vec2 coord, vec2 camera){\n        float texelSize = textureScale/terrainSize;\n        float miplevel = getMiplevel(abs(coord - camera), texelSize);\n        vec2 texcoord = coord/textureScale;\n            \n        vec3 mipInfo = texture2DLod(\n            uTerrain, texcoord, max(1.0, miplevel)\n        ).xyz*vec3(textureScale, 1, 1);\n\n\n        float detailHeight = getDetailHeight(coord, camera);\n       \n        if(miplevel >= 1.0){\n            vec3 normal = getNormal(mipInfo.yz);\n            return vec3(coord.x, mipInfo.x, coord.y) + detailHeight*normal;\n        }\n        else{\n            vec3 baseInfo = texture2DInterp(\n                uTerrain, texcoord, vec2(terrainSize)\n            ).xyz*vec3(textureScale, 1, 1);\n\n            vec3 info = mix(baseInfo, mipInfo, max(0.0, miplevel));\n            vec3 normal = getNormal(info.yz);\n\n            return vec3(coord.x, info.x, coord.y) + detailHeight*normal;\n        }\n    }\n    \n    void main(){\n        vBarycentric = barycentric;\n\n        vec2 worldCameraPosition = (invView * vec4(0, 0, 0, 1)).xz;\n        vec2 cameraPosition = invTransformPosition(worldCameraPosition);\n        vec2 pos = position + floor(cameraPosition+0.5);\n        \n        vec2 modPos = mod(pos, 2.0);\n        vec2 ownCoord = vPosition = transformPosition(pos);\n        vec3 ownPosition = getOffsetPosition(ownCoord, worldCameraPosition);\n            \n        vec2 cameraDelta = abs(pos - cameraPosition);\n        float chebyshevDistance = max(cameraDelta.x, cameraDelta.y);\n        morphFactor = linstep(\n            gridSize/4.0+1.0,\n            gridSize/2.0-1.0,\n            chebyshevDistance\n        );\n\n        if(length(modPos) > 0.5){\n            vec2 neighbor1Coord = transformPosition(pos+modPos);\n            vec2 neighbor2Coord = transformPosition(pos-modPos);\n\n            vec3 neighbor1Position = getOffsetPosition(neighbor1Coord, worldCameraPosition);\n            vec3 neighbor2Position = getOffsetPosition(neighbor2Coord, worldCameraPosition);\n\n            vec3 neighborPosition = (neighbor1Position+neighbor2Position)/2.0;\n            vec3 resultPosition = mix(ownPosition, neighborPosition, morphFactor);\n            gl_Position = proj * view * vec4(resultPosition, 1);\n        }\n        else{\n            gl_Position = proj * view * vec4(ownPosition, 1);\n        }\n\n    }\n\nfragment:\n    #extension GL_OES_standard_derivatives : enable\n    uniform float showGridLines;\n    vec3 gridLines(vec3 color){\n        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);\n        float ddist = fwidth(dist);\n        float border = mix(\n            0.0, smoothstep(ddist, -ddist, dist),\n            showGridLines\n        );\n        return mix(color, vec3(1, 1, 0), border*0.5);\n    }\n    \n    vec3 getDetailColor(sampler2D source){\n        vec2 texcoord = (vPosition/textureScale)/detailScale;\n        return degammasRGB(texture2D(source, texcoord).rgb);\n    }\n\n    uniform sampler2D uAlbedo;\n    uniform sampler2D uRockColor, uDirtColor, uGrassColor;\n    uniform vec3 rockAvg, dirtAvg, grassAvg;\n    vec3 getAlbedo(vec3 materialMix){\n        vec2 texcoord = vPosition/textureScale;\n        vec3 albedo = degammasRGB(texture2D(uAlbedo, texcoord).rgb);\n\n        vec3 rockAlbedo = (albedo/rockAvg)*getDetailColor(uRockColor);\n        vec3 dirtAlbedo = (albedo/dirtAvg)*getDetailColor(uDirtColor);\n        vec3 grassAlbedo = (albedo/grassAvg)*getDetailColor(uGrassColor);\n\n        vec3 detail = (\n            materialMix.x*dirtAlbedo +\n            materialMix.y*grassAlbedo +\n            materialMix.z*rockAlbedo\n        );\n        return mix(albedo, detail, showDetail);\n    }\n\n    vec2 getDetailDerivative(sampler2D source){\n        vec2 texcoord = (vPosition/textureScale)/detailScale;\n        return texture2D(source, texcoord).yz;\n    }\n\n    uniform sampler2D uTerrain;\n    uniform sampler2D uRockHeight, uDirtHeight, uGrassHeight;\n    vec2 getDetailDerivatives(vec3 materialMix){\n        vec2 texcoord = vPosition/textureScale;\n        vec2 derivatives = texture2D(uTerrain, texcoord).yz;\n\n        vec2 rockDerivatives = getDetailDerivative(uRockHeight);\n        vec2 dirtDerivatives = getDetailDerivative(uDirtHeight);\n        vec2 grassDerivatives = getDetailDerivative(uGrassHeight);\n\n        return (\n            materialMix.r*dirtDerivatives +\n            materialMix.g*grassDerivatives +\n            materialMix.b*rockDerivatives\n        );\n    }\n    \n    vec3 getNormal(vec3 materialMix){\n        vec2 texcoord = vPosition/textureScale;\n        vec2 basisDerivatives = texture2D(uTerrain, texcoord).yz;\n\n        vec3 tangent = normalize(vec3(1, basisDerivatives.s, 0));\n        vec3 cotangent = normalize(vec3(0, basisDerivatives.t, 1));\n        vec3 normal = cross(cotangent, tangent);\n\n        vec2 detailDerivatives = getDetailDerivatives(materialMix);\n\n        tangent = tangent + normal*detailDerivatives.s;\n        cotangent = cotangent + normal*detailDerivatives.t;\n        vec3 detailNormal = normalize(cross(cotangent, tangent));\n\n        return mix(normal, detailNormal, showDetail);\n    }\n\n    vec3 getIncident(vec3 normal){\n        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);\n        float ambient = 0.03;\n        return vec3(lambert+ambient);\n    }\n   \n    void main(){\n        vec3 materialMix = getMaterialMix(vPosition);\n        vec3 normal = getNormal(materialMix);\n        vec3 incident = getIncident(normal);\n        vec3 albedo = getAlbedo(materialMix);\n        vec3 excident = albedo*incident;\n        vec3 display = gridLines(excident);\n        gl_FragColor = vec4(gammasRGB(display), 1);\n    }");
sys.defModule('/sections/12-detail-normal-direction/module', function(exports, require, fs) {
  var Grid;
  exports = Grid = (function() {
    Grid.title = '1.14 Detail Normal Direction';

    Grid.cameraPos = [0, 0.5, 0];

    Grid.cameraPitch = 10;

    function Grid(app) {
      var i, name, pointers, shader, uniforms, _i, _j, _len, _len1, _ref, _ref1;
      this.app = app;
      this.shaders = [];
      _ref = ['lerp', 'smoothstep', 'euclidian', 'classicBicubic'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        name = _ref[_i];
        this.shaders.push({
          cull: 'back',
          name: name,
          shader: app.gf.shader([fs.read('texfuns/rect.shader'), fs.read("texfuns/" + name + ".shader"), fs.read('display.shader')])
        });
      }
      _ref1 = ['bicubicLinear', 'polynom6th', 'bicubicSmoothstep', 'bspline', 'bell', 'catmull-rom'];
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        name = _ref1[_j];
        this.shaders.push({
          cull: 'back',
          name: name,
          shader: app.gf.shader([fs.read('texfuns/rect.shader'), fs.read("texfuns/" + name + ".shader"), fs.read("texfuns/generalBicubic.shader"), fs.read('display.shader')])
        });
      }
      this.shader = app.gf.shaderProxy(this.shaders[0].shader);
      pointers = [
        {
          name: 'position',
          size: 2
        }, {
          name: 'barycentric',
          size: 3
        }
      ];
      uniforms = [
        {
          name: 'uDirtHeight',
          type: 'sampler',
          value: app.dirtHeight
        }, {
          name: 'uDirtColor',
          type: 'sampler',
          value: app.dirtColor
        }, {
          name: 'uGrassHeight',
          type: 'sampler',
          value: app.grassHeight
        }, {
          name: 'uGrassColor',
          type: 'sampler',
          value: app.grassColor
        }, {
          name: 'uRockHeight',
          type: 'sampler',
          value: app.rockHeight
        }, {
          name: 'uRockColor',
          type: 'sampler',
          value: app.rockColor
        }, {
          name: 'uTerrain',
          type: 'sampler',
          value: app.height
        }, {
          name: 'uAlbedo',
          type: 'sampler',
          value: app.albedo
        }, {
          name: 'uMaterialMix',
          type: 'sampler',
          value: app.materialMix
        }
      ];
      this.patchState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.patch(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.ringState = app.gf.state({
        cull: 'back',
        vertexbuffer: {
          pointers: pointers,
          vertices: this.ring(app.gridSize)
        },
        shader: this.shader,
        depthTest: true,
        uniforms: uniforms
      });
      this.textureScale = app.addRange({
        label: 'Texture Scale',
        value: 0,
        min: -5,
        max: 5,
        step: 0.1,
        convert: function(value) {
          return Math.pow(2, value);
        }
      });
      this.gridLevels = app.addRange({
        label: 'Grid Levels',
        value: 3,
        min: 0,
        max: 16
      });
      this.shaderSelect = app.addSelect({
        label: 'Interpolation',
        value: 0,
        options: (function() {
          var _k, _len2, _ref2, _results;
          _ref2 = this.shaders;
          _results = [];
          for (i = _k = 0, _len2 = _ref2.length; _k < _len2; i = ++_k) {
            shader = _ref2[i];
            _results.push({
              name: shader.name,
              option: i
            });
          }
          return _results;
        }).call(this),
        onValue: (function(_this) {
          return function(value) {
            return _this.shader.shader = _this.shaders[parseInt(value, 10)].shader;
          };
        })(this)
      });
      this.showDetail = app.addCheckbox({
        label: 'Enable Detail',
        value: true
      });
      this.detailScale = app.addRange({
        label: 'Detail Scale',
        value: 0.1,
        min: 0,
        max: 0.5,
        step: 0.001
      });
    }

    Grid.prototype.onGridSize = function(size) {
      this.patchState.vertices(this.patch(size));
      return this.ringState.vertices(this.ring(size));
    };

    Grid.prototype.ring = function(size) {
      var b, f, i, innerHigh, innerLow, innerSize, l, r, v, vertices, x, xInner, z, zInner, _i, _j;
      size /= 2;
      innerLow = -size + size / 2;
      innerHigh = size - size / 2;
      innerSize = innerHigh - innerLow;
      size += 1;
      v = vertices = new Float32Array((Math.pow(size * 2, 2) - Math.pow(innerSize, 2)) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        xInner = x >= innerLow && x < innerHigh;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          zInner = z >= innerLow && z < innerHigh;
          if (xInner && zInner) {
            continue;
          }
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.patch = function(size) {
      var b, f, i, l, r, v, vertices, x, z, _i, _j;
      size /= 2;
      size += 1;
      v = vertices = new Float32Array(Math.pow(size * 2, 2) * 3 * 5 * 2);
      i = 0;
      for (x = _i = -size; -size <= size ? _i < size : _i > size; x = -size <= size ? ++_i : --_i) {
        l = x;
        r = x + 1;
        for (z = _j = -size; -size <= size ? _j < size : _j > size; z = -size <= size ? ++_j : --_j) {
          f = z;
          b = z + 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = f;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = r;
          v[i++] = b;
          v[i++] = 0;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = l;
          v[i++] = f;
          v[i++] = 1;
          v[i++] = 0;
          v[i++] = 0;
        }
      }
      return vertices;
    };

    Grid.prototype.destroy = function() {
      var shader, _i, _len, _ref;
      _ref = this.shaders;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        shader = _ref[_i];
        shader.shader.destroy();
      }
      this.ringState.destroy();
      this.patchState.destroy();
      this.textureScale.remove();
      this.gridLevels.remove();
      this.shaderSelect.remove();
      this.showDetail.remove();
      return this.detailScale.remove();
    };

    Grid.prototype.draw = function() {
      var level, scale, _i, _ref, _results;
      this.shader.uniformSetter(this.app.camera).float('terrainSize', this.app.height.width).float('detailSize', this.app.dirtHeight.width).float('startGridScale', this.app.gridScale.value).float('showGridLines', this.app.gridLines).float('gridSize', this.app.gridSize).float('textureScale', this.textureScale.value).float('showDetail', this.showDetail.numValue).float('detailScale', this.detailScale.value).float('morphFactor', 1).vec3('dirtAvg', 0.287469395055, 0.120516057539, 0.0431425926961).vec3('grassAvg', 0.24244317307, 0.284209597124, 0.00726620932363).vec3('rockAvg', 0.451768651247, 0.451768651247, 0.451768651247);
      this.patchState.float('gridScale', this.app.gridScale.value).draw();
      _results = [];
      for (level = _i = 0, _ref = this.gridLevels.value; 0 <= _ref ? _i < _ref : _i > _ref; level = 0 <= _ref ? ++_i : --_i) {
        scale = this.app.gridScale.value * Math.pow(2, level + 1);
        _results.push(this.ringState.float('gridScale', scale).draw());
      }
      return _results;
    };

    return Grid;

  })();
  return exports;
});
sys.defFile("/sections/12-detail-normal-direction/texfuns/bell.shader", "#file /sections/12-detail-normal-direction/texfuns/bell.shader\nvertex:\n    float interp(float x){\n        float f = ( x / 2.0 ) * 1.5; // Converting -2 to +2 to -1.5 to +1.5\n        if( f > -1.5 && f < -0.5 ){\n            return( 0.5 * pow(f + 1.5, 2.0));\n        }\n        else if( f > -0.5 && f < 0.5 ){\n            return 3.0 / 4.0 - ( f * f );\n        }\n        else if( ( f > 0.5 && f < 1.5 ) ){\n            return( 0.5 * pow(f - 1.5, 2.0));\n        }\n        return 0.0;\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/bicubicLinear.shader", "#file /sections/12-detail-normal-direction/texfuns/bicubicLinear.shader\nvertex:\n    float interp(float x){\n        return 1.0-linstep(0.0, 1.5, abs(x));\n    } ");
sys.defFile("/sections/12-detail-normal-direction/texfuns/bicubicSmoothstep.shader", "#file /sections/12-detail-normal-direction/texfuns/bicubicSmoothstep.shader\nvertex:\n    float interp(float x){\n        return 1.0-smoothstep(0.0, 1.5, abs(x));\n    } ");
sys.defFile("/sections/12-detail-normal-direction/texfuns/bspline.shader", "#file /sections/12-detail-normal-direction/texfuns/bspline.shader\nvertex:\n    float interp(float x){\n        float f = x;\n        if(f < 0.0){\n            f = -f;\n        }\n        if(f >= 0.0 && f <= 1.0){\n            return ( 2.0 / 3.0 ) + ( 0.5 ) * ( f* f * f ) - (f*f);\n        }\n        else if( f > 1.0 && f <= 2.0 ){\n            return 1.0 / 6.0 * pow( ( 2.0 - f  ), 3.0 );\n        }\n        return 1.0;\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/catmull-rom.shader", "#file /sections/12-detail-normal-direction/texfuns/catmull-rom.shader\nvertex:\n    float interp(float x){\n        const float B = 0.0;\n        const float C = 0.5;\n        float f = x;\n        if( f < 0.0 ){\n            f = -f;\n        }\n        if( f < 1.0 ){\n            return ( ( 12.0 - 9.0 * B - 6.0 * C ) * ( f * f * f ) +\n                ( -18.0 + 12.0 * B + 6.0 *C ) * ( f * f ) +\n                ( 6.0 - 2.0 * B ) ) / 6.0;\n        }\n        else if( f >= 1.0 && f < 2.0 ){\n            return ( ( -B - 6.0 * C ) * ( f * f * f )\n                + ( 6.0 * B + 30.0 * C ) * ( f *f ) +\n                ( - ( 12.0 * B ) - 48.0 * C  ) * f +\n                8.0 * B + 24.0 * C)/ 6.0;\n        }\n        else{\n            return 0.0;\n        }\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/classicBicubic.shader", "#file /sections/12-detail-normal-direction/texfuns/classicBicubic.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n\n        vec2 st0 = ((2.0 - f) * f - 1.0) * f;\n        vec2 st1 = (3.0 * f - 5.0) * f * f + 2.0;\n        vec2 st2 = ((4.0 - 3.0 * f) * f + 1.0) * f;\n        vec2 st3 = (f - 1.0) * f * f;\n        vec4 row0 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, -1.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, -1.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, -1.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, -1.0), size);\n        vec4 row1 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 0.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 0.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 0.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 0.0), size);\n        vec4 row2 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 1.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 1.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 1.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 1.0), size);\n        vec4 row3 =\n            st0.s * texture2DRect(source, c + vec2(-1.0, 2.0), size) +\n            st1.s * texture2DRect(source, c + vec2(0.0, 2.0), size) +\n            st2.s * texture2DRect(source, c + vec2(1.0, 2.0), size) +\n            st3.s * texture2DRect(source, c + vec2(2.0, 2.0), size);\n\n        return 0.25 * ((st0.t * row0) + (st1.t * row1) + (st2.t * row2) + (st3.t * row3));\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/euclidian.shader", "#file /sections/12-detail-normal-direction/texfuns/euclidian.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n\n        vec4 sum = vec4(0.0);\n        float denom = 0.0;\n        for(int x = -1; x <=2; x++){\n            for(int y =-1; y<= 2; y++){\n                vec4 color = texture2DRect(source, c + vec2(x,y), size);\n                float dist = distance(vec2(x,y), f);\n                float factor = 1.0-smoothstep(0.0, 2.0, dist);\n                sum += color * factor;\n                denom += factor;\n            }\n        }\n        return sum/denom;\n    }\n");
sys.defFile("/sections/12-detail-normal-direction/texfuns/generalBicubic.shader", "#file /sections/12-detail-normal-direction/texfuns/generalBicubic.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*size-0.5);\n        vec2 c = floor(coord*size-0.5);\n        vec4 sum = vec4(0.0);\n        float denom = 0.0;\n        for(int x = -1; x <=2; x++){\n            for(int y =-1; y<= 2; y++){\n                vec4 color = texture2DRect(source, c + vec2(x,y), size);\n                float fx  = interp(float(x) - f.x);\n                float fy = interp(float(y) - f.y);\n                sum += color * fx * fy;\n                denom += fx*fy;\n            }\n        }\n        return sum/denom;\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/lerp.shader", "#file /sections/12-detail-normal-direction/texfuns/lerp.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = fract(coord*terrainSize-0.5);\n        vec2 c = floor(coord*terrainSize-0.5);\n\n        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);\n        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);\n        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);\n        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);\n\n        vec4 a = mix(lb, lt, f.t);\n        vec4 b = mix(rb, rt, f.t);\n        return mix(a, b, f.s);\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/polynom6th.shader", "#file /sections/12-detail-normal-direction/texfuns/polynom6th.shader\nvertex:\n    float interp(float x){\n        float t = 1.0-linstep(0.0, 1.5, abs(x));\n        return t*t*t*(t*(t*6.0-15.0)+10.0);\n    } ");
sys.defFile("/sections/12-detail-normal-direction/texfuns/rect.shader", "#file /sections/12-detail-normal-direction/texfuns/rect.shader\nvertex:\n    vec4 texture2DRect(sampler2D source, vec2 coord, vec2 size){\n        return texture2DLod(source, (coord+0.5)/size, 0.0);\n    }");
sys.defFile("/sections/12-detail-normal-direction/texfuns/smoothstep.shader", "#file /sections/12-detail-normal-direction/texfuns/smoothstep.shader\nvertex:\n    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){\n        vec2 f = smoothstep(0.0, 1.0, fract(coord*terrainSize-0.5));\n        vec2 c = floor(coord*terrainSize-0.5);\n\n        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);\n        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);\n        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);\n        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);\n\n        vec4 a = mix(lb, lt, f.t);\n        vec4 b = mix(rb, rt, f.t);\n        return mix(a, b, f.s);\n    }");
sys.defFile('/textures/albedo.png');
sys.defFile('/textures/dirt-color.png');
sys.defFile('/textures/dirt-height.png');
sys.defFile('/textures/grass-color.png');
sys.defFile('/textures/grass-height.png');
sys.defFile('/textures/height.png');
sys.defFile('/textures/mix.png');
sys.defFile('/textures/rock-color.png');
sys.defFile('/textures/rock-height.png');
sys.defModule('/webgl-framework/framebuffer', function(exports, require, fs) {
  var Framebuffer, texture;
  texture = require('texture');
  exports = Framebuffer = (function() {
    function Framebuffer(gf, params) {
      this.gf = gf;
      this.gl = this.gf.gl;
      this.buffer = this.gl.createFramebuffer();
      if (params.color instanceof texture.Texture2D) {
        this.color(params.color);
        this.ownColor = false;
      } else {
        this.color(this.gf.texture2D(params.color));
        this.ownColor = true;
      }
    }

    Framebuffer.prototype.use = function() {
      if (this.gf.currentFramebuffer !== this) {
        this.gf.currentFramebuffer = this;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
      }
      return this;
    };

    Framebuffer.prototype.unuse = function() {
      if (this.gf.currentFramebuffer != null) {
        this.gf.currentFramebuffer = null;
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
      }
      return this;
    };

    Framebuffer.prototype.check = function() {
      var result;
      result = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
      switch (result) {
        case this.gl.FRAMEBUFFER_UNSUPPORTED:
          throw 'Framebuffer is unsupported';
          break;
        case this.gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
          throw 'Framebuffer incomplete attachment';
          break;
        case this.gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
          throw 'Framebuffer incomplete dimensions';
          break;
        case this.gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
          throw 'Framebuffer incomplete missing attachment';
      }
      return this;
    };

    Framebuffer.prototype.color = function(colorTexture) {
      this.colorTexture = colorTexture;
      this.use();
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.colorTexture.target, this.colorTexture.handle, 0);
      this.check();
      this.unuse();
      return this;
    };

    Framebuffer.prototype.destroy = function() {
      this.gl.deleteFramebuffer(this.buffer);
      if (this.ownColor) {
        this.color.destroy();
      }
      return this;
    };

    Framebuffer.prototype.viewport = function(width, height) {
      if (width == null) {
        width = this.colorTexture.width;
      }
      if (height == null) {
        height = this.colorTexture.height;
      }
      return this.gl.viewport(0, 0, width, height);
    };

    Framebuffer.prototype.bind = function(unit) {
      if (unit == null) {
        unit = 0;
      }
      return this.colorTexture.bind(unit);
    };

    Framebuffer.prototype.generateMipmap = function() {
      return this.colorTexture.generateMipmap();
    };

    return Framebuffer;

  })();
  return exports;
});
sys.defModule('/webgl-framework/matrix', function(exports, require, fs) {
  var Mat4, tau;
  tau = Math.PI * 2;
  exports.Mat4 = Mat4 = (function() {
    function Mat4(view) {
      this.view = view;
      if (this.data == null) {
        this.data = new Float32Array(16);
      }
      this.identity();
    }

    Mat4.prototype.identity = function() {
      var d;
      d = this.data;
      d[0] = 1;
      d[1] = 0;
      d[2] = 0;
      d[3] = 0;
      d[4] = 0;
      d[5] = 1;
      d[6] = 0;
      d[7] = 0;
      d[8] = 0;
      d[9] = 0;
      d[10] = 1;
      d[11] = 0;
      d[12] = 0;
      d[13] = 0;
      d[14] = 0;
      d[15] = 1;
      return this;
    };

    Mat4.prototype.zero = function() {
      var d;
      d = this.data;
      d[0] = 0;
      d[1] = 0;
      d[2] = 0;
      d[3] = 0;
      d[4] = 0;
      d[5] = 0;
      d[6] = 0;
      d[7] = 0;
      d[8] = 0;
      d[9] = 0;
      d[10] = 0;
      d[11] = 0;
      d[12] = 0;
      d[13] = 0;
      d[14] = 0;
      d[15] = 0;
      return this;
    };

    Mat4.prototype.copy = function(dest) {
      var dst, src;
      if (dest == null) {
        dest = new Mat4();
      }
      src = this.data;
      dst = dest.data;
      dst[0] = src[0];
      dst[1] = src[1];
      dst[2] = src[2];
      dst[3] = src[3];
      dst[4] = src[4];
      dst[5] = src[5];
      dst[6] = src[6];
      dst[7] = src[7];
      dst[8] = src[8];
      dst[9] = src[9];
      dst[10] = src[10];
      dst[11] = src[11];
      dst[12] = src[12];
      dst[13] = src[13];
      dst[14] = src[14];
      dst[15] = src[15];
      return dest;
    };

    Mat4.prototype.perspective = function(fov, aspect, near, far) {
      var bottom, d, hyp, left, rel, right, top, vfov;
      if (fov == null) {
        fov = 60;
      }
      if (aspect == null) {
        aspect = 1;
      }
      if (near == null) {
        near = 0.01;
      }
      if (far == null) {
        far = 100;
      }
      hyp = Math.sqrt(1 + aspect * aspect);
      rel = 1 / hyp;
      vfov = fov * rel;
      this.zero();
      d = this.data;
      top = near * Math.tan(vfov * Math.PI / 360);
      right = top * aspect;
      left = -right;
      bottom = -top;
      d[0] = (2 * near) / (right - left);
      d[5] = (2 * near) / (top - bottom);
      d[8] = (right + left) / (right - left);
      d[9] = (top + bottom) / (top - bottom);
      d[10] = -(far + near) / (far - near);
      d[11] = -1;
      d[14] = -(2 * far * near) / (far - near);
      return this;
    };

    Mat4.prototype.translate = function(x, y, z) {
      var a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, d;
      d = this.data;
      a00 = d[0];
      a01 = d[1];
      a02 = d[2];
      a03 = d[3];
      a10 = d[4];
      a11 = d[5];
      a12 = d[6];
      a13 = d[7];
      a20 = d[8];
      a21 = d[9];
      a22 = d[10];
      a23 = d[11];
      d[12] = a00 * x + a10 * y + a20 * z + d[12];
      d[13] = a01 * x + a11 * y + a21 * z + d[13];
      d[14] = a02 * x + a12 * y + a22 * z + d[14];
      d[15] = a03 * x + a13 * y + a23 * z + d[15];
      return this;
    };

    Mat4.prototype.rotatex = function(angle) {
      var a10, a11, a12, a13, a20, a21, a22, a23, c, d, rad, s;
      d = this.data;
      rad = tau * (angle / 360);
      s = Math.sin(rad);
      c = Math.cos(rad);
      a10 = d[4];
      a11 = d[5];
      a12 = d[6];
      a13 = d[7];
      a20 = d[8];
      a21 = d[9];
      a22 = d[10];
      a23 = d[11];
      d[4] = a10 * c + a20 * s;
      d[5] = a11 * c + a21 * s;
      d[6] = a12 * c + a22 * s;
      d[7] = a13 * c + a23 * s;
      d[8] = a10 * -s + a20 * c;
      d[9] = a11 * -s + a21 * c;
      d[10] = a12 * -s + a22 * c;
      d[11] = a13 * -s + a23 * c;
      return this;
    };

    Mat4.prototype.rotatey = function(angle) {
      var a00, a01, a02, a03, a20, a21, a22, a23, c, d, rad, s;
      d = this.data;
      rad = tau * (angle / 360);
      s = Math.sin(rad);
      c = Math.cos(rad);
      a00 = d[0];
      a01 = d[1];
      a02 = d[2];
      a03 = d[3];
      a20 = d[8];
      a21 = d[9];
      a22 = d[10];
      a23 = d[11];
      d[0] = a00 * c + a20 * -s;
      d[1] = a01 * c + a21 * -s;
      d[2] = a02 * c + a22 * -s;
      d[3] = a03 * c + a23 * -s;
      d[8] = a00 * s + a20 * c;
      d[9] = a01 * s + a21 * c;
      d[10] = a02 * s + a22 * c;
      d[11] = a03 * s + a23 * c;
      return this;
    };

    Mat4.prototype.invert = function(destination) {
      var a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33, b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, d, dst, invDet, src;
      if (destination == null) {
        destination = this;
      }
      src = this.data;
      dst = destination.data;
      a00 = src[0];
      a01 = src[1];
      a02 = src[2];
      a03 = src[3];
      a10 = src[4];
      a11 = src[5];
      a12 = src[6];
      a13 = src[7];
      a20 = src[8];
      a21 = src[9];
      a22 = src[10];
      a23 = src[11];
      a30 = src[12];
      a31 = src[13];
      a32 = src[14];
      a33 = src[15];
      b00 = a00 * a11 - a01 * a10;
      b01 = a00 * a12 - a02 * a10;
      b02 = a00 * a13 - a03 * a10;
      b03 = a01 * a12 - a02 * a11;
      b04 = a01 * a13 - a03 * a11;
      b05 = a02 * a13 - a03 * a12;
      b06 = a20 * a31 - a21 * a30;
      b07 = a20 * a32 - a22 * a30;
      b08 = a20 * a33 - a23 * a30;
      b09 = a21 * a32 - a22 * a31;
      b10 = a21 * a33 - a23 * a31;
      b11 = a22 * a33 - a23 * a32;
      d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (d === 0) {
        return;
      }
      invDet = 1 / d;
      dst[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
      dst[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
      dst[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
      dst[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
      dst[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
      dst[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
      dst[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
      dst[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
      dst[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
      dst[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
      dst[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
      dst[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
      dst[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
      dst[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
      dst[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
      dst[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
      return destination;
    };

    return Mat4;

  })();
  return exports;
});
sys.defModule('/webgl-framework/module', function(exports, require, fs) {
  var FrameBuffer, Shader, ShaderProxy, State, VertexBuffer, WebGLFramework, matrix, texture, vector, _ref;
  require('shims');
  texture = require('texture');
  matrix = require('matrix');
  vector = require('vector');
  State = require('state');
  VertexBuffer = require('vertexbuffer');
  _ref = require('shader'), Shader = _ref.Shader, ShaderProxy = _ref.ShaderProxy;
  FrameBuffer = require('framebuffer');
  exports = WebGLFramework = (function() {
    function WebGLFramework(params) {
      var debug, i, perf, _ref1, _ref2, _ref3;
      if (params == null) {
        params = {};
      }
      debug = (_ref1 = params.debug) != null ? _ref1 : false;
      delete params.debug;
      perf = (_ref2 = params.perf) != null ? _ref2 : false;
      delete params.perf;
      this.canvas = (_ref3 = params.canvas) != null ? _ref3 : document.createElement('canvas');
      delete params.canvas;
      this.gl = this.getContext('webgl', params);
      this.gl.getExtension('OES_standard_derivatives');
      this.gl.getExtension('OES_texture_float');
      this.gl.getExtension('OES_texture_half_float');
      this.gl.getExtension('OES_texture_float_linear');
      this.gl.getExtension('OES_texture_half_float_linear');
      this.gl.getExtension('WEBGL_color_buffer_float');
      this.gl.getExtension('EXT_color_buffer_half_float');
      this.vao = null;
      if (this.gl == null) {
        this.gl = this.getContext('experimental-webgl');
      }
      if (this.gl == null) {
        throw new Error('WebGL is not supported');
      }
      if ((window.WebGLPerfContext != null) && perf) {
        console.log('webgl perf context enabled');
        this.gl = new WebGLPerfContext.create(this.gl);
      } else if ((window.WebGLDebugUtils != null) && debug) {
        console.log('webgl debug enabled');
        this.gl = WebGLDebugUtils.makeDebugContext(this.gl, function(err, funcName, args) {
          throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
        });
      }
      this.currentVertexBuffer = null;
      this.currentShader = null;
      this.currentFramebuffer = null;
      this.currentState = null;
      this.maxAttribs = this.gl.getParameter(this.gl.MAX_VERTEX_ATTRIBS);
      this.vertexUnits = (function() {
        var _i, _ref4, _results;
        _results = [];
        for (i = _i = 0, _ref4 = this.maxAttribs; 0 <= _ref4 ? _i < _ref4 : _i > _ref4; i = 0 <= _ref4 ? ++_i : --_i) {
          _results.push({
            enabled: false,
            pointer: null,
            location: i
          });
        }
        return _results;
      }).call(this);
      this.lineWidth = 1;
      this.quadVertices = this.vertexbuffer({
        pointers: [
          {
            name: 'position',
            size: 2
          }
        ],
        vertices: [-1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, 1]
      });
    }

    WebGLFramework.prototype.haveExtension = function(search) {
      var name, _i, _len, _ref1;
      _ref1 = this.gl.getSupportedExtensions();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        name = _ref1[_i];
        if (name.indexOf(search) >= 0) {
          return true;
        }
      }
      return false;
    };

    WebGLFramework.prototype.getContext = function(name, params) {
      var error;
      try {
        return this.canvas.getContext(name, params);
      } catch (_error) {
        error = _error;
        return null;
      }
    };

    WebGLFramework.prototype.state = function(params) {
      return new State(this, params);
    };

    WebGLFramework.prototype.vertexbuffer = function(params) {
      return new VertexBuffer(this, params);
    };

    WebGLFramework.prototype.framebuffer = function(params) {
      return new FrameBuffer(this, params);
    };

    WebGLFramework.prototype.shader = function(params) {
      return new Shader(this, params);
    };

    WebGLFramework.prototype.shaderProxy = function(shader) {
      return new ShaderProxy(shader);
    };

    WebGLFramework.prototype.mat4 = function(view) {
      return new matrix.Mat4(view);
    };

    WebGLFramework.prototype.vec3 = function(x, y, z) {
      return new vector.Vec3(x, y, z);
    };

    WebGLFramework.prototype.frameStart = function() {
      if (this.canvas.offsetWidth !== this.canvas.width) {
        this.canvas.width = this.canvas.offsetWidth;
      }
      if (this.canvas.offsetHeight !== this.canvas.height) {
        this.canvas.height = this.canvas.offsetHeight;
      }
      if (this.gl.performance != null) {
        return this.gl.performance.start();
      }
    };

    WebGLFramework.prototype.frameEnd = function() {
      if (this.gl.performance != null) {
        return this.gl.performance.stop();
      }
    };

    WebGLFramework.prototype.texture2D = function(params) {
      return new texture.Texture2D(this, params);
    };

    WebGLFramework.prototype.getExtension = function(name) {
      return this.gl.getExtension(name);
    };

    WebGLFramework.prototype.htmlColor2Vec = function(value) {
      var b, g, r;
      r = parseInt(value.slice(0, 2), 16) / 255;
      g = parseInt(value.slice(2, 4), 16) / 255;
      b = parseInt(value.slice(4), 16) / 255;
      return {
        r: r,
        g: g,
        b: b
      };
    };

    return WebGLFramework;

  })();
  return exports;
});
var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

sys.defModule('/webgl-framework/shader', function(exports, require, fs) {
  var Shader, ShaderObj, ShaderProxy, boilerplate, matrix;
  matrix = require('matrix');
  exports.ShaderObj = ShaderObj = (function() {
    function ShaderObj() {}

    return ShaderObj;

  })();
  boilerplate = '    precision highp int;\n    precision highp float;\n    #define PI 3.141592653589793\n    #define TAU 6.283185307179586\n    #define PIH 1.5707963267948966\n    #define E 2.7182818284590451\n    float angleBetween(vec3 a, vec3 b){return acos(dot(a,b));}\n\n    vec3 gamma(vec3 color){\n        return pow(color, vec3(1.0/2.4)); \n    }\n\n    vec3 degamma(vec3 color){\n        return pow(color, vec3(2.4));\n    }\n\n    vec3 gammasRGB(vec3 color){\n        return mix(\n            color*12.92,\n            pow(color, vec3(1.0/2.4))*1.055-0.055,\n            step((0.04045/12.92), color)\n        );\n    }\n\n    vec3 degammasRGB(vec3 color){\n        return mix(\n            color/12.92,\n            pow((color+0.055)/1.055, vec3(2.4)),\n            step(0.04045, color)\n        );\n    }\n    \n    float linstep(float edge0, float edge1, float value){\n        return clamp((value-edge0)/(edge1-edge0), 0.0, 1.0);\n    }';
  exports.Shader = Shader = (function(_super) {
    __extends(Shader, _super);

    function Shader(gf, params) {
      var c, common, f, fragment, source, v, vertex, _i, _len, _ref, _ref1;
      this.gf = gf;
      this.gl = this.gf.gl;
      if (typeof params === 'string') {
        _ref = this.splitSource(params), common = _ref[0], vertex = _ref[1], fragment = _ref[2];
      } else if (params instanceof Array) {
        common = [];
        vertex = [];
        fragment = [];
        for (_i = 0, _len = params.length; _i < _len; _i++) {
          source = params[_i];
          _ref1 = this.splitSource(source), c = _ref1[0], v = _ref1[1], f = _ref1[2];
          if (c.length > 0) {
            common.push(c);
          }
          if (v.length > 0) {
            vertex.push(v);
          }
          if (f.length > 0) {
            fragment.push(f);
          }
        }
        common = common.join('\n');
        vertex = vertex.join('\n');
        fragment = fragment.join('\n');
      }
      this.program = this.gl.createProgram();
      this.vs = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.attachShader(this.program, this.vs);
      this.gl.attachShader(this.program, this.fs);
      this.setSource({
        common: common,
        vertex: vertex,
        fragment: fragment
      });
    }

    Shader.prototype.destroy = function() {
      this.gl.deleteShader(this.vs);
      this.gl.deleteShader(this.fs);
      return this.gl.deleteProgram(this.program);
    };

    Shader.prototype.splitSource = function(source) {
      var common, current, filename, fragment, line, linenum, lines, vertex, _i, _len;
      common = [];
      vertex = [];
      fragment = [];
      current = common;
      lines = source.trim().split('\n');
      filename = lines.shift().split(' ')[1];
      for (linenum = _i = 0, _len = lines.length; _i < _len; linenum = ++_i) {
        line = lines[linenum];
        if (line.match(/vertex:$/)) {
          current = vertex;
        } else if (line.match(/fragment:$/)) {
          current = fragment;
        } else {
          current.push("#line " + linenum + " " + filename);
          current.push(line);
        }
      }
      return [common.join('\n').trim(), vertex.join('\n').trim(), fragment.join('\n').trim()];
    };

    Shader.prototype.preprocess = function(source) {
      var filename, line, lineno, lines, match, result, _i, _len, _ref;
      lines = [];
      result = [];
      filename = 'no file';
      lineno = 1;
      _ref = source.trim().split('\n');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        match = line.match(/#line (\d+) (.*)/);
        if (match) {
          lineno = parseInt(match[1], 10) + 1;
          filename = match[2];
        } else {
          lines.push({
            source: line,
            lineno: lineno,
            filename: filename
          });
          result.push(line);
          lineno += 1;
        }
      }
      return [result.join('\n'), lines];
    };

    Shader.prototype.setSource = function(_arg) {
      var common, fragment, vertex;
      common = _arg.common, vertex = _arg.vertex, fragment = _arg.fragment;
      this.uniformCache = {};
      this.attributeCache = {};
      if (common == null) {
        common = '';
      }
      this.compileShader(this.vs, [common, vertex].join('\n'));
      this.compileShader(this.fs, [common, fragment].join('\n'));
      return this.link();
    };

    Shader.prototype.compileShader = function(shader, source) {
      var error, lines, _ref;
      source = [boilerplate, source].join('\n');
      _ref = this.preprocess(source), source = _ref[0], lines = _ref[1];
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        error = this.gl.getShaderInfoLog(shader);
        throw this.translateError(error, lines);
      }
    };

    Shader.prototype.link = function() {
      this.gl.linkProgram(this.program);
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        throw new Error("Shader Link Error: " + (this.gl.getProgramInfoLog(this.program)));
      }
    };

    Shader.prototype.translateError = function(error, lines) {
      var i, line, lineno, match, message, result, sourceline, _i, _len, _ref;
      result = ['Shader Compile Error'];
      _ref = error.split('\n');
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        line = _ref[i];
        match = line.match(/ERROR: \d+:(\d+): (.*)/);
        if (match) {
          lineno = parseFloat(match[1]) - 1;
          message = match[2];
          sourceline = lines[lineno];
          result.push("File \"" + sourceline.filename + "\", Line " + sourceline.lineno + ", " + message);
          result.push("   " + sourceline.source);
        } else {
          result.push(line);
        }
      }
      return result.join('\n');
    };

    Shader.prototype.attributeLocation = function(name) {
      var location;
      location = this.attributeCache[name];
      if (location === void 0) {
        location = this.gl.getAttribLocation(this.program, name);
        if (location >= 0) {
          this.attributeCache[name] = location;
          return location;
        } else {
          this.attributeCache[name] = null;
          return null;
        }
      } else {
        return location;
      }
    };

    Shader.prototype.uniformLocation = function(name) {
      var location;
      location = this.uniformCache[name];
      if (location === void 0) {
        location = this.gl.getUniformLocation(this.program, name);
        if (location != null) {
          this.uniformCache[name] = location;
          return location;
        } else {
          this.uniformCache[name] = null;
          return null;
        }
      } else {
        return location;
      }
    };

    Shader.prototype.use = function() {
      if (this.gf.currentShader !== this) {
        this.gf.currentShader = this;
        return this.gl.useProgram(this.program);
      }
    };

    Shader.prototype.mat4 = function(name, value) {
      var location;
      if (value instanceof matrix.Mat4) {
        value = value.data;
      }
      location = this.uniformLocation(name);
      if (location != null) {
        this.use();
        this.gl.uniformMatrix4fv(location, false, value);
      }
      return this;
    };

    Shader.prototype.vec2 = function(name, a, b) {
      var location;
      location = this.uniformLocation(name);
      if (location != null) {
        this.use();
        if (a instanceof Array) {
          this.gl.uniform2fv(location, a);
        } else {
          this.gl.uniform2f(location, a, b);
        }
      }
      return this;
    };

    Shader.prototype.vec3 = function(name, a, b, c) {
      var location;
      location = this.uniformLocation(name);
      if (location != null) {
        this.use();
        if (a instanceof Array) {
          this.gl.uniform3fv(location, a);
        } else {
          this.gl.uniform3f(location, a, b, c);
        }
      }
      return this;
    };

    Shader.prototype.int = function(name, value) {
      var location;
      location = this.uniformLocation(name);
      if (location != null) {
        this.use();
        this.gl.uniform1i(location, value);
      }
      return this;
    };

    Shader.prototype.uniformSetter = function(obj) {
      obj.setUniformsOn(this);
      return this;
    };

    Shader.prototype.float = function(name, value) {
      var location;
      location = this.uniformLocation(name);
      if (location != null) {
        this.use();
        this.gl.uniform1f(location, value);
      }
      return this;
    };

    return Shader;

  })(ShaderObj);
  exports.ShaderProxy = ShaderProxy = (function(_super) {
    __extends(ShaderProxy, _super);

    function ShaderProxy(shader) {
      this.shader = shader != null ? shader : null;
    }

    ShaderProxy.prototype.attributeLocation = function(name) {
      return this.shader.attributeLocation(name);
    };

    ShaderProxy.prototype.uniformLocation = function(name) {
      return this.shader.uniformLocation(name);
    };

    ShaderProxy.prototype.use = function() {
      this.shader.use();
      return this;
    };

    ShaderProxy.prototype.mat4 = function(name, value) {
      this.shader.mat4(name, value);
      return this;
    };

    ShaderProxy.prototype.vec2 = function(name, a, b) {
      this.shader.vec2(name, a, b);
      return this;
    };

    ShaderProxy.prototype.vec3 = function(name, a, b, c) {
      this.shader.vec3(name, a, b, c);
      return this;
    };

    ShaderProxy.prototype.int = function(name, value) {
      this.shader.int(name, value);
      return this;
    };

    ShaderProxy.prototype.uniformSetter = function(obj) {
      this.shader.uniformSetter(obj);
      return this;
    };

    ShaderProxy.prototype.float = function(name, value) {
      this.shader.float(name, value);
      return this;
    };

    return ShaderProxy;

  })(ShaderObj);
  return exports;
});
sys.defModule('/webgl-framework/shims', function(exports, require, fs) {
  var getAttrib, startTime, vendorName, vendors;
  vendors = [null, 'webkit', 'apple', 'moz', 'o', 'xv', 'ms', 'khtml', 'atsc', 'wap', 'prince', 'ah', 'hp', 'ro', 'rim', 'tc'];
  vendorName = function(name, vendor) {
    if (vendor === null) {
      return name;
    } else {
      return vendor + name[0].toUpperCase() + name.substr(1);
    }
  };
  getAttrib = function(obj, name, def) {
    var attrib, attrib_name, vendor, _i, _len;
    if (obj) {
      for (_i = 0, _len = vendors.length; _i < _len; _i++) {
        vendor = vendors[_i];
        attrib_name = vendorName(name, vendor);
        attrib = obj[attrib_name];
        if (attrib !== void 0) {
          return attrib;
        }
      }
    }
    return def;
  };
  window.performance = getAttrib(window, 'performance');
  if (window.performance == null) {
    window.performance = {};
  }
  window.performance.now = getAttrib(window.performance, 'now');
  if (window.performance.now == null) {
    startTime = Date.now();
    window.performance.now = function() {
      return Date.now() - startTime;
    };
  }
  return exports;
});
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

sys.defModule('/webgl-framework/state', function(exports, require, fs) {
  var FrameBuffer, ShaderObj, State, VertexBuffer, util;
  util = require('util');
  VertexBuffer = require('vertexbuffer');
  ShaderObj = require('shader').ShaderObj;
  FrameBuffer = require('framebuffer');
  exports = State = (function() {
    function State(gf, params) {
      var location, pointer, uniform, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.gf = gf;
      this.blendAlpha = __bind(this.blendAlpha, this);
      this.gl = this.gf.gl;
      if (params.shader instanceof ShaderObj) {
        this.shader = params.shader;
        this.ownShader = false;
      } else {
        this.shader = this.gf.shader(params.shader);
        this.ownShader = true;
      }
      if (params.framebuffer != null) {
        if (params.framebuffer instanceof FrameBuffer) {
          this.framebuffer = this.params.framebuffer;
          this.ownFramebuffer = false;
        } else {
          this.framebuffer = this.gf.framebuffer(params.framebuffer);
          this.ownFramebuffer = true;
        }
      } else {
        this.framebuffer = null;
        this.ownFramebuffer = false;
      }
      if (params.vertexbuffer != null) {
        if (params.vertexbuffer instanceof VertexBuffer) {
          this.vertexbuffer = params.vertexbuffer;
          this.ownVertexbuffer = false;
        } else {
          this.vertexbuffer = this.gf.vertexbuffer(params.vertexbuffer);
          this.ownVertexbuffer = true;
        }
      } else {
        this.vertexbuffer = this.gf.quadVertices;
        this.ownVertexBuffer = false;
      }
      this.pointers = (function() {
        var _i, _ref, _results;
        _results = [];
        for (location = _i = 0, _ref = this.gf.maxAttribs; 0 <= _ref ? _i < _ref : _i > _ref; location = 0 <= _ref ? ++_i : --_i) {
          _results.push(null);
        }
        return _results;
      }).call(this);
      _ref = this.vertexbuffer.pointers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        pointer = _ref[_i];
        location = this.shader.attributeLocation(pointer.name);
        if (location != null) {
          pointer = util.clone(pointer);
          pointer.location = location;
          this.pointers[location] = pointer;
        }
      }
      this.texturesByName = {};
      this.textures = [];
      this.depthTest = (_ref1 = params.depthTest) != null ? _ref1 : false;
      this.depthWrite = (_ref2 = params.depthWrite) != null ? _ref2 : true;
      if (params.cull != null) {
        this.cullFace = (_ref3 = this.gl[params.cull.toUpperCase()]) != null ? _ref3 : this.gl.BACK;
      } else {
        this.cullFace = false;
      }
      this.lineWidth = (_ref4 = params.lineWidth) != null ? _ref4 : 1;
      if (params.blend != null) {
        switch (params.blend) {
          case 'alpha':
            this.blend = this.blendAlpha;
            break;
          default:
            throw new Error('blend mode is not implemented: ' + params.blend);
        }
      } else {
        this.blend = null;
      }
      if (params.uniforms != null) {
        _ref5 = params.uniforms;
        for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
          uniform = _ref5[_j];
          this[uniform.type](uniform.name, uniform.value);
        }
      }
      if (this.gf.vao != null) {
        this.vao = this.gf.vao.createVertexArrayOES();
        this.gf.vao.bindVertexArrayOES(this.vao);
        this.setPointers();
        this.gf.vao.bindVertexArrayOES(null);
      } else {
        this.vao = null;
      }
    }

    State.prototype.destroy = function() {
      if (this.ownShader) {
        this.shader.destroy();
      }
      if (this.ownBuffer) {
        this.vertexbuffer.destroy();
      }
      if (this.vao != null) {
        return this.gf.vao.deleteVertexArrayOES(this.vao);
      }
    };

    State.prototype.blendAlpha = function() {
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      return this.gl.enable(this.gl.BLEND);
    };

    State.prototype.clearColor = function(r, g, b, a) {
      if (r == null) {
        r = 0;
      }
      if (g == null) {
        g = 0;
      }
      if (b == null) {
        b = 0;
      }
      if (a == null) {
        a = 1;
      }
      this.gl.clearColor(r, g, b, a);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
      return this;
    };

    State.prototype.setViewport = function(width, height) {
      if (width == null) {
        width = this.gl.canvas.width;
      }
      if (height == null) {
        height = this.gl.canvas.height;
      }
      return this.gl.viewport(0, 0, width, height);
    };

    State.prototype.setPointers = function() {
      var location, pointer, _i, _len, _ref, _results;
      this.vertexbuffer.bind();
      _ref = this.pointers;
      _results = [];
      for (location = _i = 0, _len = _ref.length; _i < _len; location = ++_i) {
        pointer = _ref[location];
        if (pointer != null) {
          if (!this.gf.vertexUnits[location].enabled) {
            this.gl.enableVertexAttribArray(pointer.location);
          }
          _results.push(this.gl.vertexAttribPointer(pointer.location, pointer.size, pointer.type, false, this.vertexbuffer.stride, pointer.offset));
        } else {
          if (this.gf.vertexUnits[location].enabled) {
            _results.push(this.gl.disableVertexAttribArray(location));
          } else {
            _results.push(void 0);
          }
        }
      }
      return _results;
    };

    State.prototype.setupVertexBuffer = function() {
      if (this.vao != null) {
        return this.gf.vao.bindVertexArrayOES(this.vao);
      } else {
        return this.setPointers();
      }
    };

    State.prototype.setupState = function() {
      var texture, unit, _i, _len, _ref;
      if (this.depthTest) {
        this.gl.enable(this.gl.DEPTH_TEST);
      } else {
        this.gl.disable(this.gl.DEPTH_TEST);
      }
      this.gl.depthMask(this.depthWrite);
      if (this.cullFace) {
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.cullFace);
      } else {
        this.gl.disable(this.gl.CULL_FACE);
      }
      if (this.blend != null) {
        this.blend();
      } else {
        this.gl.disable(this.gl.BLEND);
      }
      if (this.vertexbuffer.mode === this.gl.LINES || this.vertexbuffer.mode === this.gl.LINE_STRIP) {
        if (this.gf.lineWidth !== this.lineWidth) {
          this.gf.lineWidth = this.lineWidth;
          this.gl.lineWidth(this.lineWidth);
        }
      }
      this.shader.use();
      _ref = this.textures;
      for (unit = _i = 0, _len = _ref.length; _i < _len; unit = ++_i) {
        texture = _ref[unit];
        texture.texture.bind(unit);
        this.int(texture.name, unit);
      }
      if (this.framebuffer != null) {
        this.framebuffer.use();
      } else {
        if (this.gf.currentFramebuffer != null) {
          this.gf.currentFramebuffer.unuse();
        }
      }
      this.setupVertexBuffer();
      return this.gf.currentState = this;
    };

    State.prototype.draw = function(first, count) {
      if (this.framebuffer != null) {
        this.framebuffer.viewport();
      } else {
        this.setViewport();
      }
      if (this.gf.currentState !== this) {
        this.setupState();
      }
      this.vertexbuffer.draw(first, count);
      return this;
    };

    State.prototype.mat4 = function(name, value) {
      this.shader.mat4(name, value);
      return this;
    };

    State.prototype.int = function(name, value) {
      this.shader.int(name, value);
      return this;
    };

    State.prototype.vec2 = function(name, a, b) {
      this.shader.vec2(name, a, b);
      return this;
    };

    State.prototype.vec3 = function(name, a, b, c) {
      this.shader.vec3(name, a, b, c);
      return this;
    };

    State.prototype.uniformSetter = function(obj) {
      this.shader.uniformSetter(obj);
      return this;
    };

    State.prototype.float = function(name, value) {
      this.shader.float(name, value);
      return this;
    };

    State.prototype.sampler = function(name, texture) {
      var stored;
      stored = this.texturesByName[name];
      if (stored == null) {
        stored = {
          name: name,
          texture: texture
        };
        this.texturesByName[name] = stored;
        this.textures.push(stored);
      }
      if (stored.texture !== texture) {
        stored.texture = texture;
      }
      return this;
    };

    State.prototype.bind = function(unit) {
      if (unit == null) {
        unit = 0;
      }
      if (this.framebuffer != null) {
        this.framebuffer.bind(unit);
      } else {
        throw new Error('State has no attached framebuffer');
      }
      return this;
    };

    State.prototype.generateMipmap = function() {
      if (this.framebuffer != null) {
        this.framebuffer.generateMipmap();
      } else {
        throw new Error('State has no attached framebuffer');
      }
      return this;
    };

    State.prototype.vertices = function(data) {
      this.vertexbuffer.vertices(data);
      return this;
    };

    return State;

  })();
  return exports;
});
sys.defModule('/webgl-framework/texture', function(exports, require, fs) {
  var Texture2D;
  exports.Texture2D = Texture2D = (function() {
    function Texture2D(gf, params) {
      var clamp, filter, magnify, minify, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      this.gf = gf;
      this.gl = this.gf.gl;
      this.target = this.gl.TEXTURE_2D;
      this.handle = this.gl.createTexture();
      this.channels = this.gl[((_ref = params.channels) != null ? _ref : 'rgba').toUpperCase()];
      this.type = this.gl[((_ref1 = params.type) != null ? _ref1 : 'unsigned_byte').toUpperCase()];
      if (params.data != null) {
        this.data(params.data);
      } else {
        this.size(params.width, params.height);
      }
      filter = (_ref2 = params.filter) != null ? _ref2 : 'nearest';
      if (typeof filter === 'string') {
        this[filter]();
      } else {
        minify = (_ref3 = this.gl[filter.minify.toUpperCase()]) != null ? _ref3 : this.gl.LINEAR;
        magnify = (_ref4 = this.gl[filter.magnify.toUpperCase()]) != null ? _ref4 : this.gl.LINEAR;
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, magnify);
        this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, minify);
        if (minify === this.gl.NEAREST_MIPMAP_NEAREST || minify === this.gl.LINEAR_MIPMAP_NEAREST || minify === this.gl.NEAREST_MIPMAP_LINEAR || minify === this.gl.LINEAR_MIPMAP_LINEAR) {
          this.generateMipmap();
        }
        if (filter.anisotropy) {
          this.anisotropy();
        }
      }
      clamp = (_ref5 = params.clamp) != null ? _ref5 : 'edge';
      this[clamp]();
      if (params.anisotropy) {
        this.anisotropy();
      }
    }

    Texture2D.prototype.destroy = function() {
      return this.gl.deleteTexture(this.handle);
    };

    Texture2D.prototype.generateMipmap = function() {
      this.mipmapped = true;
      this.bind();
      return this.gl.generateMipmap(this.target);
    };

    Texture2D.prototype.anisotropy = function() {
      var ext, max;
      this.anisotropic = true;
      ext = this.gl.getExtension('EXT_texture_filter_anisotropic' != null ? 'EXT_texture_filter_anisotropic' : this.gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic' != null ? 'WEBKIT_EXT_texture_filter_anisotropic' : this.gl.getExtension('MOZ_EXT_texture_filter_anisotropic' != null ? 'MOZ_EXT_texture_filter_anisotropic' : this.gl.getExtension('O_EXT_texture_filter_anisotropic' != null ? 'O_EXT_texture_filter_anisotropic' : this.gl.getExtension('MS_EXT_texture_filter_anisotropic')))));
      if (ext) {
        max = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        return this.gl.texParameterf(this.target, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
      }
    };

    Texture2D.prototype.data = function(data) {
      this.bind();
      this.width = data.width;
      this.height = data.height;
      this.gl.texImage2D(this.target, 0, this.channels, this.channels, this.type, data);
      return this;
    };

    Texture2D.prototype.size = function(width, height) {
      this.width = width;
      this.height = height;
      this.bind();
      this.gl.texImage2D(this.target, 0, this.channels, this.width, this.height, 0, this.channels, this.type, null);
      return this;
    };

    Texture2D.prototype.linear = function() {
      this.bind();
      this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      return this;
    };

    Texture2D.prototype.nearest = function() {
      this.bind();
      this.gl.texParameteri(this.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      return this;
    };

    Texture2D.prototype.repeat = function() {
      this.bind();
      this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
      this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);
      return this;
    };

    Texture2D.prototype.edge = function() {
      this.bind();
      this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      return this;
    };

    Texture2D.prototype.bind = function(unit) {
      if (unit == null) {
        unit = 0;
      }
      this.gl.activeTexture(this.gl.TEXTURE0 + unit);
      this.gl.bindTexture(this.target, this.handle);
      return this;
    };

    return Texture2D;

  })();
  return exports;
});
sys.defModule('/webgl-framework/util', function(exports, require, fs) {
  exports.clone = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
  return exports;
});
sys.defModule('/webgl-framework/vector', function(exports, require, fs) {
  var Vec3, tau;
  tau = Math.PI * 2;
  exports.Vec3 = Vec3 = (function() {
    function Vec3(x, y, z) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
      null;
    }

    Vec3.prototype.set = function(x, y, z) {
      this.x = x != null ? x : 0;
      this.y = y != null ? y : 0;
      this.z = z != null ? z : 0;
      return this;
    };

    Vec3.prototype.rotatey = function(angle) {
      var c, rad, s, x, z;
      rad = tau * (angle / 360);
      s = Math.sin(rad);
      c = Math.cos(rad);
      x = this.z * s + this.x * c;
      z = this.z * c - this.x * s;
      this.x = x;
      this.z = z;
      return this;
    };

    return Vec3;

  })();
  return exports;
});
sys.defModule('/webgl-framework/vertexbuffer', function(exports, require, fs) {
  var VertexBuffer, util;
  util = require('util');
  exports = VertexBuffer = (function() {
    function VertexBuffer(gf, _arg) {
      var mode, offset, pointer, pointers, stride, vertices;
      this.gf = gf;
      pointers = _arg.pointers, vertices = _arg.vertices, mode = _arg.mode, stride = _arg.stride;
      this.gl = this.gf.gl;
      this.buffer = this.gl.createBuffer();
      if (mode != null) {
        this.mode = this.gl[mode.toUpperCase()];
      } else {
        this.mode = this.gl.TRIANGLES;
      }
      offset = 0;
      this.pointers = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = pointers.length; _i < _len; _i++) {
          pointer = pointers[_i];
          pointer = util.clone(pointer);
          if (pointer.size == null) {
            pointer.size = 4;
          }
          pointer.type = this.gl.FLOAT;
          pointer.typeSize = 4;
          pointer.byteSize = pointer.typeSize * pointer.size;
          pointer.offset = offset;
          offset += pointer.byteSize;
          _results.push(pointer);
        }
        return _results;
      }).call(this);
      this.stride = offset;
      this.vertices(vertices);
    }

    VertexBuffer.prototype.destroy = function() {
      this.gl.deleteBuffer(this.buffer);
      return this;
    };

    VertexBuffer.prototype.vertices = function(data) {
      if (data instanceof Array) {
        data = new Float32Array(data);
      }
      this.count = data.buffer.byteLength / this.stride;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      return this;
    };

    VertexBuffer.prototype.bind = function() {
      if (this.gf.currentVertexbuffer !== this) {
        this.gf.currentVertexbuffer = this;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      }
      return this;
    };

    VertexBuffer.prototype.unbind = function() {
      if (this.gf.currentVertexbuffer != null) {
        this.gf.currentVertexbuffer = null;
        return this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
      }
    };

    VertexBuffer.prototype.draw = function(first, count) {
      if (first == null) {
        first = 0;
      }
      if (count == null) {
        count = this.count;
      }
      this.gl.drawArrays(this.mode, first, count);
      return this;
    };

    return VertexBuffer;

  })();
  return exports;
});
sys.main();
})();
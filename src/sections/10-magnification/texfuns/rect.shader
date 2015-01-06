vertex:
    vec4 texture2DRect(sampler2D source, vec2 coord, vec2 size){
        return texture2DLod(source, (coord+0.5)/size, 0.0);
    }

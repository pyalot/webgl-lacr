vertex:
    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){
        vec2 f = smoothstep(0.0, 1.0, fract(coord*terrainSize-0.5));
        vec2 c = floor(coord*terrainSize-0.5);

        vec4 lb = texture2DRect(source, c+vec2(0.0, 0.0), size);
        vec4 lt = texture2DRect(source, c+vec2(0.0, 1.0), size);
        vec4 rb = texture2DRect(source, c+vec2(1.0, 0.0), size);
        vec4 rt = texture2DRect(source, c+vec2(1.0, 1.0), size);

        vec4 a = mix(lb, lt, f.t);
        vec4 b = mix(rb, rt, f.t);
        return mix(a, b, f.s);
    }

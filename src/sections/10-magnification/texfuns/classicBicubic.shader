vertex:
    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){
        vec2 f = fract(coord*size-0.5);
        vec2 c = floor(coord*size-0.5);

        vec2 st0 = ((2.0 - f) * f - 1.0) * f;
        vec2 st1 = (3.0 * f - 5.0) * f * f + 2.0;
        vec2 st2 = ((4.0 - 3.0 * f) * f + 1.0) * f;
        vec2 st3 = (f - 1.0) * f * f;
        vec4 row0 =
            st0.s * texture2DRect(source, c + vec2(-1.0, -1.0), size) +
            st1.s * texture2DRect(source, c + vec2(0.0, -1.0), size) +
            st2.s * texture2DRect(source, c + vec2(1.0, -1.0), size) +
            st3.s * texture2DRect(source, c + vec2(2.0, -1.0), size);
        vec4 row1 =
            st0.s * texture2DRect(source, c + vec2(-1.0, 0.0), size) +
            st1.s * texture2DRect(source, c + vec2(0.0, 0.0), size) +
            st2.s * texture2DRect(source, c + vec2(1.0, 0.0), size) +
            st3.s * texture2DRect(source, c + vec2(2.0, 0.0), size);
        vec4 row2 =
            st0.s * texture2DRect(source, c + vec2(-1.0, 1.0), size) +
            st1.s * texture2DRect(source, c + vec2(0.0, 1.0), size) +
            st2.s * texture2DRect(source, c + vec2(1.0, 1.0), size) +
            st3.s * texture2DRect(source, c + vec2(2.0, 1.0), size);
        vec4 row3 =
            st0.s * texture2DRect(source, c + vec2(-1.0, 2.0), size) +
            st1.s * texture2DRect(source, c + vec2(0.0, 2.0), size) +
            st2.s * texture2DRect(source, c + vec2(1.0, 2.0), size) +
            st3.s * texture2DRect(source, c + vec2(2.0, 2.0), size);

        return 0.25 * ((st0.t * row0) + (st1.t * row1) + (st2.t * row2) + (st3.t * row3));
    }

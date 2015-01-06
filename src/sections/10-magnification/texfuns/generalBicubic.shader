vertex:
    vec4 texture2DInterp(sampler2D source, vec2 coord, vec2 size){
        vec2 f = fract(coord*size-0.5);
        vec2 c = floor(coord*size-0.5);
        vec4 sum = vec4(0.0);
        float denom = 0.0;
        for(int x = -1; x <=2; x++){
            for(int y =-1; y<= 2; y++){
                vec4 color = texture2DRect(source, c + vec2(x,y), size);
                float fx  = interp(float(x) - f.x);
                float fy = interp(float(y) - f.y);
                sum += color * fx * fy;
                denom += fx*fy;
            }
        }
        return sum/denom;
    }

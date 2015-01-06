vertex:
    float interp(float x){
        return 1.0-smoothstep(0.0, 1.5, abs(x));
    } 

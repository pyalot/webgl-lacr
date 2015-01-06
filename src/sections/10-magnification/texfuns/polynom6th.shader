vertex:
    float interp(float x){
        float t = 1.0-linstep(0.0, 1.5, abs(x));
        return t*t*t*(t*(t*6.0-15.0)+10.0);
    } 

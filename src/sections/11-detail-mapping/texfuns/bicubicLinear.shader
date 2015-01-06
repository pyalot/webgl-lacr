vertex:
    float interp(float x){
        return 1.0-linstep(0.0, 1.5, abs(x));
    } 

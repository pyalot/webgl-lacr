vertex:
    float interp(float x){
        float f = ( x / 2.0 ) * 1.5; // Converting -2 to +2 to -1.5 to +1.5
        if( f > -1.5 && f < -0.5 ){
            return( 0.5 * pow(f + 1.5, 2.0));
        }
        else if( f > -0.5 && f < 0.5 ){
            return 3.0 / 4.0 - ( f * f );
        }
        else if( ( f > 0.5 && f < 1.5 ) ){
            return( 0.5 * pow(f - 1.5, 2.0));
        }
        return 0.0;
    }

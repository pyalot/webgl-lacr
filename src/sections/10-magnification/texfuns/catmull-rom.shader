vertex:
    float interp(float x){
        const float B = 0.0;
        const float C = 0.5;
        float f = x;
        if( f < 0.0 ){
            f = -f;
        }
        if( f < 1.0 ){
            return ( ( 12.0 - 9.0 * B - 6.0 * C ) * ( f * f * f ) +
                ( -18.0 + 12.0 * B + 6.0 *C ) * ( f * f ) +
                ( 6.0 - 2.0 * B ) ) / 6.0;
        }
        else if( f >= 1.0 && f < 2.0 ){
            return ( ( -B - 6.0 * C ) * ( f * f * f )
                + ( 6.0 * B + 30.0 * C ) * ( f *f ) +
                ( - ( 12.0 * B ) - 48.0 * C  ) * f +
                8.0 * B + 24.0 * C)/ 6.0;
        }
        else{
            return 0.0;
        }
    }

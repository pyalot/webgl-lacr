varying vec2 texcoord;

vertex:
    attribute vec2 position;
    void main(){
        texcoord = position*0.5+0.5;
        gl_Position = vec4(position, 0, 1);
    }

fragment:
    uniform sampler2D source;
    uniform vec2 viewport;
    uniform float scaleFactor;

    float getHeight(float s, float t){
        vec2 coord = texcoord+vec2(s,t)/viewport;
        vec4 texel = texture2D(source, coord);
        float height = (((texel.r*256.0 + texel.g)/257.0)-0.5)*scaleFactor;
        return height;
    }

    void main(){
        float height = getHeight(0.0, 0.0);
        float left = getHeight(-1.0, 0.0);
        float right = getHeight(1.0, 0.0);
        float bottom = getHeight(0.0, -1.0);
        float top = getHeight(0.0, 1.0);
        float dS = (right-left)*0.5;
        float dT = (top-bottom)*0.5;
        gl_FragColor = vec4(height, dS*viewport.s, dT*viewport.t, 1);
    }

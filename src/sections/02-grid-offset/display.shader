varying vec2 vPosition;
varying vec3 vBarycentric;
    
uniform float textureScale;
uniform float gridSize, gridScale;
vec2 transformPosition(vec2 position){
    return (position/gridSize)*gridScale;
}
                
vertex:
    attribute vec2 position;
    attribute vec3 barycentric;
    uniform mat4 proj, view;

    uniform sampler2D uTerrain;
    float getHeight(vec2 position){
        vec2 texcoord = position/textureScale;
        return texture2D(uTerrain, texcoord).x*textureScale;
    }

    void main(){
        vBarycentric = barycentric;
        vec2 pos = transformPosition(position);
        float yOffset = getHeight(pos);
        gl_Position = proj * view * vec4(pos.x, yOffset, pos.y, 1);
    }

fragment:
    #extension GL_OES_standard_derivatives : enable
    uniform float showGridLines;
    vec3 gridLines(vec3 color){
        float dist = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
        float ddist = fwidth(dist);
        float border = mix(
            0.0, smoothstep(ddist, -ddist, dist),
            showGridLines
        );
        return mix(color, vec3(1, 1, 0), border*0.5);
    }

    void main(){
        vec3 display = gridLines(vec3(0.3));
        gl_FragColor = vec4(gammasRGB(display), 1);
    }

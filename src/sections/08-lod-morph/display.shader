varying vec2 vPosition;
varying vec3 vBarycentric;
varying float morphFactor;

uniform float textureScale;
uniform float gridSize, gridScale;
vec2 transformPosition(vec2 position){
    return (position/gridSize)*gridScale;
}

vec2 invTransformPosition(vec2 position){
    return (position/gridScale)*gridSize;
}

vertex:
    attribute vec2 position;
    attribute vec3 barycentric;

    uniform mat4 proj, view, invView;
    
    uniform sampler2D uTerrain;
    float getHeight(vec2 position){
        vec2 texcoord = position/textureScale;
        return texture2D(uTerrain, texcoord).x*textureScale;
    }

    void main(){
        vBarycentric = barycentric;

        vec2 cameraPosition = invTransformPosition((invView * vec4(0, 0, 0, 1)).xz);
        vec2 pos = position + floor(cameraPosition+0.5);
    
        vec2 modPos = mod(pos, 2.0);
        vec2 ownPosition = vPosition = transformPosition(pos);
        float ownHeight = getHeight(ownPosition);
            
        vec2 cameraDelta = abs(pos - cameraPosition);
        float chebyshevDistance = max(cameraDelta.x, cameraDelta.y);
        morphFactor = linstep(
            gridSize/4.0+1.0,
            gridSize/2.0-1.0,
            chebyshevDistance
        );
        
        if(length(modPos) > 0.5){
            vec2 neighbor1Position = transformPosition(pos+modPos);
            vec2 neighbor2Position = transformPosition(pos-modPos);

            float neighbor1Height = getHeight(neighbor1Position);
            float neighbor2Height = getHeight(neighbor2Position);

            float neighborHeight = (neighbor1Height+neighbor2Height)/2.0;
            float yOffset = mix(ownHeight, neighborHeight, morphFactor);

            gl_Position = proj * view * vec4(ownPosition.x, yOffset, ownPosition.y, 1);
        }
        else{
            gl_Position = proj * view * vec4(ownPosition.x, ownHeight, ownPosition.y, 1);
        }
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
    
    vec3 getNormal(vec2 derivatives){
        vec3 sDirection = vec3(1, derivatives.s, 0);
        vec3 tDirection = vec3(0, derivatives.t, 1);
        return normalize(cross(tDirection, sDirection));
    }

    uniform sampler2D uAlbedo;
    vec3 getAlbedo(){
        vec2 texcoord = vPosition/textureScale;
        return degammasRGB(texture2D(uAlbedo, texcoord).rgb);
    }

    uniform sampler2D uTerrain;
    vec2 getDerivatives(){
        vec2 texcoord = vPosition/textureScale;
        return texture2D(uTerrain, texcoord).yz;
    }

    vec3 getIncident(vec3 normal){
        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);
        float ambient = 0.03;
        return vec3(lambert+ambient);
    }

    uniform float showMorphFactor;
    void main(){
        vec2 derivatives = getDerivatives();
        vec3 normal = getNormal(derivatives);
        vec3 incident = getIncident(normal);
        vec3 albedo = getAlbedo();
        vec3 excident = albedo*incident;
        vec3 display = gridLines(mix(gammasRGB(excident), vec3(morphFactor), showMorphFactor));
        gl_FragColor = vec4(display, 1);
    }

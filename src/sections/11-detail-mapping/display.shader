varying vec2 vPosition;
varying vec3 vBarycentric;
varying float morphFactor;
    
uniform float textureScale, detailScale, showDetail;
uniform float gridSize, gridScale, startGridScale;

uniform float terrainSize, detailSize;

vec2 transformPosition(vec2 position){
    return (position/gridSize)*gridScale;
}

vec2 invTransformPosition(vec2 position){
    return (position/gridScale)*gridSize;
}
    
uniform sampler2D uMaterialMix;
vec3 getMaterialMix(vec2 position){
    vec2 texcoord = vPosition/textureScale;
    vec3 mixFactors = texture2D(uMaterialMix, position/textureScale).rgb;
    return mixFactors /= (mixFactors.r + mixFactors.g + mixFactors.b);
}
    
vertex:
    attribute vec2 position;
    attribute vec3 barycentric;

    uniform mat4 proj, view, invView;
    
    float getMiplevel(vec2 position, float texelSize){
        float dist = max(abs(position.x), abs(position.y));

        float cellSize = startGridScale/(gridSize*2.0);

        float correction = log2(cellSize/texelSize);
        float distanceLevel = max(0.0, log2(dist*4.0/startGridScale));

        return distanceLevel+correction;
    }
   
    uniform sampler2D uRockHeight, uGrassHeight, uDirtHeight;
    float getDetailHeight(vec2 position, vec2 camera){
        float scaleFactor = textureScale*detailScale;
        float texelSize = scaleFactor/detailSize;
        vec2 texcoord = position/scaleFactor;

        float miplevel = getMiplevel(abs(position - camera), texelSize);

        float rockHeight = texture2DLod(uRockHeight, texcoord, miplevel).x;
        float grassHeight = texture2DLod(uGrassHeight, texcoord, miplevel).x;
        float dirtHeight = texture2DLod(uDirtHeight, texcoord, miplevel).x;

        vec3 mixFactors = getMaterialMix(position);

        return (
            mixFactors.r*dirtHeight +
            mixFactors.g*grassHeight +
            mixFactors.b*rockHeight
        )*detailScale*textureScale*showDetail;
    }

    uniform sampler2D uTerrain;
    float getHeight(vec2 position, vec2 camera){
        float texelSize = textureScale/terrainSize;
        float miplevel = getMiplevel(abs(position - camera), texelSize);
        vec2 texcoord = position/textureScale;
            
        float mipHeight = texture2DLod(
            uTerrain, texcoord, max(1.0, miplevel)
        ).x*textureScale;

        float detailHeight = getDetailHeight(position, camera);
       
        if(miplevel >= 1.0){
            return detailHeight+mipHeight;
        }
        else{
            float baseHeight = texture2DInterp(
                uTerrain, texcoord, vec2(terrainSize)
            ).x*textureScale;

            return detailHeight+mix(
                baseHeight, mipHeight, max(0.0, miplevel)
            );
        }
    }
    
    void main(){
        vBarycentric = barycentric;

        vec2 worldCameraPosition = (invView * vec4(0, 0, 0, 1)).xz;
        vec2 cameraPosition = invTransformPosition(worldCameraPosition);
        vec2 pos = position + floor(cameraPosition+0.5);
        
        vec2 modPos = mod(pos, 2.0);
        vec2 ownPosition = vPosition = transformPosition(pos);
        float ownHeight = getHeight(ownPosition, worldCameraPosition);
            
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

            float neighbor1Height = getHeight(neighbor1Position, worldCameraPosition);
            float neighbor2Height = getHeight(neighbor2Position, worldCameraPosition);

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

    vec3 getDetailColor(sampler2D source){
        vec2 texcoord = (vPosition/textureScale)/detailScale;
        return degammasRGB(texture2D(source, texcoord).rgb);
    }

    uniform sampler2D uAlbedo;
    uniform sampler2D uRockColor, uDirtColor, uGrassColor;
    uniform vec3 rockAvg, dirtAvg, grassAvg;
    vec3 getAlbedo(vec3 materialMix){
        vec2 texcoord = vPosition/textureScale;
        vec3 albedo = degammasRGB(texture2D(uAlbedo, texcoord).rgb);

        vec3 rockAlbedo = (albedo/rockAvg)*getDetailColor(uRockColor);
        vec3 dirtAlbedo = (albedo/dirtAvg)*getDetailColor(uDirtColor);
        vec3 grassAlbedo = (albedo/grassAvg)*getDetailColor(uGrassColor);

        vec3 detail = (
            materialMix.x*dirtAlbedo +
            materialMix.y*grassAlbedo +
            materialMix.z*rockAlbedo
        );
        return mix(albedo, detail, showDetail);
    }

    vec2 getDetailDerivatives(sampler2D source){
        vec2 texcoord = (vPosition/textureScale)/detailScale;
        return texture2D(source, texcoord).yz;
    }

    uniform sampler2D uTerrain;
    uniform sampler2D uRockHeight, uDirtHeight, uGrassHeight;
    vec2 getDerivatives(vec3 materialMix){
        vec2 texcoord = vPosition/textureScale;
        vec2 derivatives = texture2D(uTerrain, texcoord).yz;

        vec2 rockDerivatives = getDetailDerivatives(uRockHeight);
        vec2 dirtDerivatives = getDetailDerivatives(uDirtHeight);
        vec2 grassDerivatives = getDetailDerivatives(uGrassHeight);

        vec2 detailDerivatives = (
            materialMix.r*dirtDerivatives +
            materialMix.g*grassDerivatives +
            materialMix.b*rockDerivatives
        );

        return derivatives + detailDerivatives*showDetail;
    }

    vec3 getIncident(vec3 normal){
        float lambert = clamp(dot(normal, normalize(vec3(1, 0.5, 0))), 0.0, 1.0);
        float ambient = 0.03;
        return vec3(lambert+ambient);
    }
   
    void main(){
        vec3 materialMix = getMaterialMix(vPosition);
        vec2 derivatives = getDerivatives(materialMix);
        vec3 normal = getNormal(derivatives);
        vec3 incident = getIncident(normal);
        vec3 albedo = getAlbedo(materialMix);
        vec3 excident = albedo*incident;
        vec3 display = gridLines(excident);
        gl_FragColor = vec4(gammasRGB(display), 1);
    }

import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

extend({ ShaderMaterial: THREE.ShaderMaterial });

export default function LayeredMaterial({ 
    baseTextures, 
    patternTexture,
    mainInterestTextures,
    layoutTextures,
}) {

    const ref = useRef()

    return (
      <mesh ref={ref} frustumCulled={false}>
        <planeGeometry args={[2, 3, 64, 64]}  />


        <shaderMaterial
            uniforms={{
                // Base Layer
                baseAlbedo: { value: baseTextures.albedo },
                baseAlpha: { value: baseTextures.alpha },
                baseHeight: { value: baseTextures.height },
                baseNormal: { value: baseTextures.normal },
                baseRoughness: { value: baseTextures.roughness },
                // Pattern Layer
                patternAlbedo: { value: patternTexture.albedo },
                // Main Interest Layer
                mainInterestAlbedo: { value: mainInterestTextures.albedo },
                mainInterestAo: { value: mainInterestTextures.ao },
                mainInterestHeight: { value: mainInterestTextures.height },
                mainInterestNormal: { value: mainInterestTextures.normal },
                // Layout Layer
                layoutAlbedo: { value: layoutTextures.albedo },
                layoutAo: { value: layoutTextures.ao },
                layoutHeight: { value: layoutTextures.height },
                layoutNormal: { value: layoutTextures.normal },
                // Scene
                lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                uCameraPosition: { value: new THREE.Vector3(0, 0, 5) },
            }}
            vertexShader={`
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                vUv = uv;
                vNormal = normalMatrix * normal;
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `}
            fragmentShader={`
                uniform sampler2D baseAlbedo;
                uniform sampler2D baseAlpha;
                uniform sampler2D baseHeight;
                uniform sampler2D baseNormal;
                uniform sampler2D baseRoughness;

                uniform sampler2D patternAlbedo;

                uniform sampler2D mainInterestAlbedo;
                uniform sampler2D mainInterestAo;
                uniform sampler2D mainInterestHeight;
                uniform sampler2D mainInterestNormal;

                uniform sampler2D layoutAlbedo;
                uniform sampler2D layoutAo;
                uniform sampler2D layoutHeight;
                uniform sampler2D layoutNormal;

                uniform vec3 lightDirection;
                uniform vec3 uCameraPosition;

                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                void main() {
                // Sample base maps
                vec4 baseColor = texture2D(baseAlbedo, vUv);
                float baseAlphaVal = texture2D(baseAlpha, vUv).r;
                vec3 baseNormal = texture2D(baseNormal, vUv).rgb * 2.0 - 1.0; // Normal map in tangent space
                float baseRoughness = texture2D(baseRoughness, vUv).r;

                // Sample pattern texture
                vec4 patternColor = texture2D(patternAlbedo, vUv);

                // Blend pattern with base
                vec4 blendedAlbedo = mix(baseColor, patternColor, baseAlphaVal);

                // Scale down and center main interest UVs
                vec2 scaledUv = (vUv - 0.5) * 1.0 + 0.5; // Scale down to half and center
                scaledUv.y = scaledUv.y * 1.5 - 0.25;

                // Sample main interest maps
                vec4 mainInterestColor = texture2D(mainInterestAlbedo, scaledUv);
                float mainInterestAo = texture2D(mainInterestAo, scaledUv).r;
                vec3 mainInterestNormal = vec3(0.0); //texture2D(mainInterestNormal, scaledUv).rgb * 2.0 - 1.0;
                float mainInterestHeight = texture2D(mainInterestHeight, scaledUv).r;

                // Constrain main interest effect to center using a radial mask
                float distanceFromCenter = length(vUv - vec2(0.5));
                float mainInterestMask = smoothstep(0.3, 0.4, 1.0 - distanceFromCenter);

                // Sample layout layer maps
                vec4 layoutColor = texture2D(layoutAlbedo, vUv);
                float layoutAo = texture2D(layoutAo, vUv).r;
                vec3 layoutNormal = texture2D(layoutNormal, vUv).rgb * 2.0 - 1.0;
                float layoutHeight = texture2D(layoutHeight, vUv).r;

                // Blend layout on top of all layers
                blendedAlbedo = mix(blendedAlbedo, layoutColor, layoutColor.g);

                // Blend main interest into the existing layers
                blendedAlbedo = mix(blendedAlbedo, mainInterestColor, mainInterestMask * mainInterestColor.a);

                // Combine normals for lighting (add layout normal)
                vec3 normal = normalize(vNormal + baseNormal + mainInterestNormal * mainInterestMask + layoutNormal);

                // Apply ambient occlusion (reduce its darkening impact)
                float ao = mix(1.0, mainInterestAo, mainInterestMask);
                ao = mix(ao, layoutAo, layoutColor.a * 0.5); // Reduced layout AO impact

                // Lighting calculations
                vec3 lightDir = normalize(lightDirection);
                vec3 viewDir = normalize(uCameraPosition - vPosition);

                // Diffuse reflection (ensure lighter appearance)
                float diff = max(dot(normal, lightDir), 0.5) * ao; // Minimum diffuse contribution

                // Specular reflection (boost for shinier effect)
                vec3 halfwayDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(normal, halfwayDir), 0.0), 24.0) * 1.5; // Boost specular

                // Combine diffuse and specular
                vec3 lighting = diff * blendedAlbedo.rgb + spec * vec3(1.5); // Brighter specular highlights

                // Brightness boost for final effect
                vec3 finalColor = lighting + vec3(0.2); // Add slight brightness boost

                // Apply roughness for final effect
                finalColor = mix(finalColor, blendedAlbedo.rgb, baseRoughness);

                // Preserve alpha transparency
                gl_FragColor = vec4(finalColor, baseAlphaVal);
                }
            `}
            transparent={true}
            side={THREE.DoubleSide}
        />



      </mesh>
    );
}

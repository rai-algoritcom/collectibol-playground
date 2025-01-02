

varying vec2 vUv;
varying vec3 vWorldPosition;
uniform sampler2D hdriTexture;
uniform vec3 uOrbitCameraPosition;


void main() {
    vec3 viewDir = normalize(vWorldPosition - uOrbitCameraPosition);
    vec2 sphericalCoords = vec2(
          0.5 - atan(viewDir.z, viewDir.x) / (2.0 * 3.14159265359),
          0.5 + asin(viewDir.y) / 3.14159265359
    );

    vec4 color = texture2D(hdriTexture, sphericalCoords);
    gl_FragColor = vec4(color.rgb, 1.0);
}
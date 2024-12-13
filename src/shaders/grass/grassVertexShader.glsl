uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform float uTime;

attribute vec3 position;
attribute vec3 terrPos;
attribute vec2 uv;
attribute float angle;

varying vec2 vUv;

// Function to create a quaternion from an axis and angle
vec4 quat_from_axis_angle(vec3 axis, float angle) { 
    vec4 qr;
    float half_angle = (angle * 0.5) * 3.14159 / 180.0;
    qr.x = axis.x * sin(half_angle);
    qr.y = axis.y * sin(half_angle);
    qr.z = axis.z * sin(half_angle);
    qr.w = cos(half_angle);
    return qr;
}

// Function to rotate a vertex position around an axis
vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle) {
    vec4 q = quat_from_axis_angle(axis, angle);
    vec3 v = position.xyz;
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main()
{   
    vUv = uv;

    vec3 finalPosition = position;

    // Scale the entire particle
    float scale = 0.2; // Adjust this value to control particle size
    finalPosition *= scale;

    finalPosition.x *= 0.5;
    finalPosition += 0.5;

    if (finalPosition.y > 0.5) {
        finalPosition.x = ( finalPosition.x + sin( uTime / 100.0 * ( angle * 0.01 )  ) * 0.05 );
        finalPosition.z = ( finalPosition.z + cos( uTime / 100.0 * ( angle * 0.01 )  ) * 0.05 );
    }

    vec3 axist = vec3(0.0, 1.0, 0.0);
    finalPosition = rotate_vertex_position(finalPosition, axist, angle);

    finalPosition += terrPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPosition, 1.0);
}

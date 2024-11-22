

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAlphaMask; // Alpha mask texture

varying vec2 vUv;

float noise(vec2 p) {
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(uTime / 11.0))) + 0.2; 
}

mat2 rotate(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float fbm(vec2 p) {
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 3; i++) {
    mat2 modify = rotate(uTime / 50.0 * float(i * i));
    f += amp * noise(p);
    p = modify * p;
    p *= 2.0;
    amp /= 2.2;
  }
  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  q = vec2(fbm(p + vec2(1.0)), fbm(rotate(0.1 * uTime) * p + vec2(1.0)));
  r = vec2(fbm(rotate(0.1) * q + vec2(0.0)), fbm(q + vec2(0.0)));
  return fbm(p + 1.0 * r);
}

float digit(vec2 p) {
  vec2 grid = vec2(3.0, 1.0) * 15.0;
  vec2 s = floor(p * grid) / grid;
  p = p * grid;
  vec2 q;
  vec2 r;
  float intensity = pattern(s / 10.0, q, r) * 1.3 - 0.03;
  p = fract(p);
  p *= vec2(1.2, 1.2);
  float x = fract(p.x * 5.0);
  float y = fract((1.0 - p.y) * 5.0);
  int i = int(floor((1.0 - p.y) * 5.0));
  int j = int(floor(p.x * 5.0));
  int n = (i - 2) * (i - 2) + (j - 2) * (j - 2);
  float f = float(n) / 16.0;
  float isOn = intensity - f > 0.1 ? 1.0 : 0.0;
  return p.x <= 1.0 && p.y <= 1.0 ? isOn * (0.2 + y * 4.0 / 5.0) * (0.75 + x / 4.0) : 0.0;
}

float displace(vec2 look) {
  float y = (look.y - mod(uTime / 4.0, 1.0));
  float window = 1.0 / (1.0 + 50.0 * y * y);
  return sin(look.y * 20.0 + uTime) / 80.0 * window;
}

vec3 getColor(vec2 p) {
  float bar = mod(p.y + uTime * 20.0, 1.0) < 0.2 ? 1.4 : 1.0;
  p.x += displace(p);
  float middle = digit(p);
  float off = 0.002;
  float sum = 0.0;
  for (float i = -1.0; i < 2.0; i += 1.0) {
    for (float j = -1.0; j < 2.0; j += 1.0) {
      sum += digit(p + vec2(off * i, off * j));
    }
  }
  return vec3(0.9) * middle + sum / 10.0 * vec3(0.0, 1.0, 0.0) * bar;
}

void main() {
  vec2 p = vUv;
  vec3 col = getColor(p);

  // Sample alpha from mask
  float alpha = texture2D(uAlphaMask, vUv).r;

  gl_FragColor = vec4(col, alpha);
}


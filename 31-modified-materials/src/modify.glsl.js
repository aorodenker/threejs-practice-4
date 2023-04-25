const commonMod = `
#include <common>

uniform float uTime;

mat2 get2dRotateMatrix(float _angle) {
    return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
}
`;

const beginNormalVertexMod = `
#include <beginnormal_vertex>

float angle = sin((position.y + uTime)) * 0.4;
mat2 rotateMatrix = get2dRotateMatrix(angle);

objectNormal.xz = rotateMatrix * objectNormal.xz;
`;

const beginVertexMod = `
#include <begin_vertex>

transformed.xz = rotateMatrix * transformed.xz;
`;

const depthBeginVertexMod = `
#include <begin_vertex>

float angle = sin((position.y + uTime)) * 0.4;
mat2 rotateMatrix = get2dRotateMatrix(angle);

transformed.xz = rotateMatrix * transformed.xz;
`;

export {
  commonMod,
  beginNormalVertexMod,
  beginVertexMod,
  depthBeginVertexMod
};
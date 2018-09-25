
// Scene
var vertexBuffer = undefined;
var indexBuffer  = undefined;
var colorBuffer  = undefined;

var indices  = []; // JS array to store the indices of the polygon
var vertices = []; // JS array to store the vertices of the polygon
var colors   = []; // JS array to store the colors assigned to each vertex

// Camera
var mvMatrix = mat4.create(); // Model-View matrix
var pMatrix  = mat4.create(); // projection matrix

function initShaderParameters(prg)
{
  prg.vertexPositionAttribute = glContext.getAttribLocation(prg, "aVertexPosition");
  glContext.enableVertexAttribArray(prg.vertexPositionAttribute);
  prg.colorAttribute 			= glContext.getAttribLocation(prg, "aColor");
  glContext.enableVertexAttribArray(prg.colorAttribute);
  prg.pMatrixUniform          = glContext.getUniformLocation(prg, 'uPMatrix');
  prg.mvMatrixUniform         = glContext.getUniformLocation(prg, 'uMVMatrix');
}

function initBuffers()
{
  vertices.push(-3/8, 2/8, 0.0);
  vertices.push( 3/8, 2/8, 0.0);
  vertices.push( 0.0, -3/8, 0.0);
  vertices.push( -2/8, 4/8, 0.0);
  vertices.push( 2/8, 4/8, 0.0);
  colors.push(1.0, 0.0, 0.0, 0.8);
  colors.push(1.0, 0.0, 0.0, 0.8);
  colors.push(1.0, 0.0, 0.0, 0.8);
  colors.push(1.0, 0.0, 0.0, 0.8);
  colors.push(1.0, 0.0, 0.0, 0.8);
  indices.push(0,1,2, 0,1,3, 0,1,4);
  vertexBuffer = getVertexBufferWithVertices(vertices);
  colorBuffer  = getVertexBufferWithVertices(colors);
  indexBuffer  = getIndexBufferWithIndices(indices);
}
var t = 0;
var dt = 0.005
function drawScene()
{
  glContext.clearColor(0.9, 0.9, 0.9, 1.0);
  glContext.enable(glContext.DEPTH_TEST);
  glContext.clear(glContext.COLOR_BUFFER_BIT | glContext.DEPTH_BUFFER_BIT);
  glContext.viewport(0, 0, c_width, c_height);
  //mat4.identity(pMatrix);
  //mat4.identity(mvMatrix);

  mat4.lookAt(mvMatrix, [0,0,1], [0,0,0], [0,1,0]);
  mat4.perspective(pMatrix, glMatrix.toRadian(90), c_width/c_height, 0.1, 1000.0);
  if(t>0.2 || t<0){dt=-dt}
  t += dt;
  mat4.translate(mvMatrix, mvMatrix, [0,0,t]);

  glContext.uniformMatrix4fv(prg.pMatrixUniform, false, pMatrix);
  glContext.uniformMatrix4fv(prg.mvMatrixUniform, false, mvMatrix);

  glContext.bindBuffer(glContext.ARRAY_BUFFER, vertexBuffer);
  glContext.vertexAttribPointer(prg.vertexPositionAttribute, 3, glContext.FLOAT, false, 0, 0);
  glContext.bindBuffer(glContext.ARRAY_BUFFER, colorBuffer);
  glContext.vertexAttribPointer(prg.colorAttribute, 4, glContext.FLOAT, false, 0, 0);
  glContext.bindBuffer(glContext.ELEMENT_ARRAY_BUFFER, indexBuffer);
  glContext.drawElements(glContext.TRIANGLE_STRIP, indices.length, glContext.UNSIGNED_SHORT,0);
}

function initWebGL()
{
  glContext = getGLContext("webgl-canvas");
  initProgram();
  initBuffers();
  renderLoop();
}

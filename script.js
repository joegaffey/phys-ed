// import decomp from './poly-decomp.js';
import Matter from './matter.js';

const ta = document.querySelector('textarea');
const can = document.querySelector('canvas');
const canTest = document.querySelector('#testCanvas');
const testBg = document.querySelector('.testBg');
const clsControl = document.querySelector('#cls');
const testControl = document.querySelector('#testControl');
const scaleControl = document.querySelector('#imgScale');
const ctx = can.getContext('2d');

let points = [{"x":253,"y":12},{"x":238,"y":37},{"x":222,"y":42},{"x":201,"y":54},{"x":157,"y":67},{"x":102,"y":65},{"x":68,"y":59},{"x":43,"y":49},{"x":2,"y":55},{"x":3,"y":68},{"x":11,"y":83},{"x":24,"y":94},{"x":36,"y":103},{"x":17,"y":106},{"x":15,"y":122},{"x":23,"y":140},{"x":41,"y":152},{"x":82,"y":167},{"x":94,"y":185},{"x":115,"y":200},{"x":140,"y":211},{"x":162,"y":214},{"x":196,"y":212},{"x":227,"y":203},{"x":257,"y":189},{"x":280,"y":176},{"x":299,"y":152},{"x":310,"y":136},{"x":316,"y":119},{"x":320,"y":99},{"x":315,"y":78},{"x":309,"y":66},{"x":298,"y":61},{"x":292,"y":45},{"x":287,"y":27},{"x":288,"y":19},{"x":287,"y":11},{"x":274,"y":4},{"x":267,"y":2},{"x":260,"y":6}];
ta.value = JSON.stringify(points);
let scale = 1;

let img = new Image();
img.src = 'https://cdn.glitch.me/f1488ce6-5a65-47dd-a741-6e6d90249fe1%2FBananas.png?v=1639083988282';
img.onload = () => {
  draw();
}

can.onpointerdown = (e) => {
  let x = e.clientX - can.offsetLeft;
  let y = e.clientY - can.offsetTop;
  if(img) {
    x = (x - img.bb[0]) / scale;
    y = (y - img.bb[1]) / scale;
  }
  points.push({x: Math.round(x), 
               y: Math.round(y)});
  ta.value = JSON.stringify(points);
  draw();
}

scaleControl.onchange = (e) => {
  scale = scaleControl.value;
  draw();
} 

ta.onchange = (e) => {
  points = JSON.parse(ta.value);
  draw();
} 

clsControl.onclick = () => { cls(); };
testControl.onclick = () => { runTest() };

testBg.onpointerdown = (e) => {
  canTest.classList.toggle('invisible');
  testBg.classList.toggle('invisible');
}

                             
const imageLoader = document.getElementById('imageLoader');
imageLoader.onchange = (e) => { loadImage(e); }

function loadImage(e) {
  var reader = new FileReader();
  reader.onload = (e) => {
    img = new Image();
    img.onload = () => { draw(); };
    img.src = e.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}

function setImageBB() {
  const w = img.width * scale,
        h = img.height * scale,
        x = can.width / 2 - w / 2,
        y = can.height / 2 - h / 2; 
  img.bb = [x, y, w, h];
}

function drawPoints() {
  let sPoints = scaledPoints();
  ctx.strokeStyle = '#000';
  ctx.moveTo(sPoints[0].x, sPoints[0].y);
  ctx.beginPath();
  points.forEach((point, i) => {
    if(i < sPoints.length) {
      ctx.lineTo(sPoints[i].x, sPoints[i].y);
    }
  });
  ctx.closePath();
  if(sPoints.length > 2) {
    ctx.fillStyle = 'red';
    ctx.globalAlpha = 0.2;
    ctx.fill(); 
    ctx.globalAlpha = 1;
    ctx.stroke();
  }      
  else if(sPoints.length > 1) 
    ctx.stroke();
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 1;
  sPoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI); 
    ctx.fill();
  });
}

function scaledPoints() {
  const sPoints = [];
  points.forEach((point) => {
    if(img) {
      sPoints.push({ 
        x: img.bb[0] + point.x * scale,
        y: img.bb[1] + point.y * scale
      });
    }
    else {
      sPoints.push({ 
        x: point.x * scale,
        y: point.y * scale
      });
    }
  });
  return sPoints;
}

function draw() {
  ctx.clearRect(0, 0, can.width, can.height);
  if(img) {
    setImageBB();
    ctx.drawImage(img, ...img.bb);
    ctx.strokeStyle = '#0000ff';
    ctx.strokeRect(...img.bb);
  }
  if(points.length > 0) 
    drawPoints();
}

function cls() {
  ctx.clearRect(0, 0, can.width, can.height);
  points = [];
  ta.value = '';
  scale = 1;
  scaleControl.value = 1;
  imageLoader.form.reset();
  img = null;
}

let engine = null;

canTest.onpointerdown  = (e) => {
  let x = e.clientX - canTest.offsetLeft;
  let y = e.clientY - canTest.offsetTop;
  addObj(x, y);
}

function runTest() {
  canTest.classList.toggle('invisible');
  testBg.classList.toggle('invisible');
  
  engine = Matter. Engine.create();
  engine.timing.isFixed = true;

  const render = Matter.Render.create({
    canvas: canTest,
    engine: engine,
    options: {
      width: 800,
      height: 600,
      wireframes: false
    }
  });

  Matter.Render.run(render);
  const runner = Matter.Runner.create();
  
  const ground = Matter.Bodies.rectangle(400, 580, 720, 20, {
    label: 'ground',
    isStatic: true,
    render: { 
      fillStyle: 'darkgray'
    }
  });
  
  Matter.Composite.add(engine.world, [ground]);
  addObj(400, 0);
  Matter.Runner.run(runner, engine);  
}

function addObj(x, y) {
  let render = {};
  if(img) {
    render = { 
      sprite: {
        texture: img.src,
        xScale: 0.5,
        yScale: 0.5
      }
    }
  }
  else 
    render = { fillStyle: 'red' };
    
  const obj = Matter.Bodies.fromVertices(x, y, points, {
    label: 'obj',
    render: render
  }); 
  Matter.Body.scale(obj, 0.5, 0.5);
  Matter.Composite.add(engine.world, [obj]);
}

function resize() {
  can.width = can.offsetWidth;
  can.height = can.offsetHeight;
  canTest.width = canTest.offsetWidth;
  canTest.height = canTest.offsetHeight;
  draw();
}
resize();
window.onresize = resize;
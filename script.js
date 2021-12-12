import Matter from './matter-jg.js';

const decomp = window.decomp;
const ta = document.querySelector('.ta');
const can = document.querySelector('#editor');
const canTest = document.querySelector('#testCanvas');
const testBg = document.querySelector('.testBg');
const clsControl = document.querySelector('#cls');
const testControl = document.querySelector('#testControl');
const scaleControl = document.querySelector('#imgScale');
const decompControl = document.querySelector('#decomp');
const imageControl = document.querySelector('#image');
const wireControl = document.querySelector('#wire');
const ctx = can.getContext('2d');

let points = [{"x":39,"y":115},{"x":20,"y":145},{"x":10,"y":181},{"x":15,"y":220},{"x":15,"y":220},{"x":26,"y":246},{"x":41,"y":269},{"x":8,"y":279},{"x":3,"y":298},{"x":7,"y":329},{"x":23,"y":354},{"x":44,"y":359},{"x":62,"y":354},{"x":44,"y":410},{"x":40,"y":438},{"x":58,"y":458},{"x":88,"y":467},{"x":117,"y":465},{"x":137,"y":453},{"x":137,"y":434},{"x":134,"y":425},{"x":159,"y":434},{"x":183,"y":431},{"x":187,"y":454},{"x":196,"y":473},{"x":243,"y":482},{"x":280,"y":474},{"x":288,"y":454},{"x":287,"y":429},{"x":276,"y":370},{"x":293,"y":375},{"x":313,"y":378},{"x":338,"y":368},{"x":357,"y":342},{"x":361,"y":311},{"x":355,"y":296},{"x":336,"y":286},{"x":314,"y":280},{"x":348,"y":242},{"x":359,"y":208},{"x":357,"y":180},{"x":354,"y":155},{"x":349,"y":141},{"x":362,"y":122},{"x":374,"y":104},{"x":376,"y":74},{"x":369,"y":53},{"x":354,"y":35},{"x":332,"y":24},{"x":297,"y":24},{"x":272,"y":35},{"x":258,"y":54},{"x":252,"y":64},{"x":207,"y":53},{"x":151,"y":54},{"x":138,"y":30},{"x":118,"y":12},{"x":93,"y":5},{"x":68,"y":6},{"x":46,"y":19},{"x":30,"y":40},{"x":26,"y":74},{"x":30,"y":97}];
let dPoints = [];
ta.value = JSON.stringify(points);
let scale = 0.5;
scaleControl.value = scale;

let img = new Image();
//https://commons.wikimedia.org/wiki/File:Little_Bear_Toy.svg
img.src = 'https://cdn.glitch.me/22db1ff7-3ea8-4eab-9f25-9ca603a01e31%2FBear.png?v=1639170061996';
img.onload = () => { draw(); };

can.onpointerdown = (e) => {
  let x = e.clientX - can.offsetLeft;
  let y = e.clientY - can.offsetTop;
  if(img) {
    x = (x - img.bb[0]) / scale;
    y = (y - img.bb[1]) / scale;
  }
  points.push({x: Math.round(x), 
               y: Math.round(y)});
  draw();
};

scaleControl.onchange = (e) => {
  scale = scaleControl.value;
  draw();
};

ta.onchange = (e) => {
  if(decompControl.checked)
    dPoints = JSON.parse(ta.value);
  else 
    points = JSON.parse(ta.value);  
  draw();
};

decompControl.onchange = (e) => { draw(); };
imageControl.onchange = (e) => { draw(); };
                                 
clsControl.onclick = () => { cls(); };
testControl.onclick = () => { runTest() };

testBg.onpointerdown = (e) => {
  e.stopPropagation();
  e.preventDefault();
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
  let sPoints = scaledPoints(points);
  if(decompControl.checked)
    drawDecomp();
  else
    drawPoly(sPoints);  
  ctx.fillStyle = '#000';
  ctx.globalAlpha = 1;
  sPoints.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI); 
    ctx.fill();
  });
}

function drawDecomp() {
  dPoints = [];
  const ary2D = points.map((point) => {
    return [point.x, point.y];
  });
  decomp.makeCCW(ary2D);
  const decomposed = decomp.quickDecomp(ary2D);
  decomposed.forEach(poly => {
    poly = poly.map((point) => {
      return {x: Math.round(point[0]), y: Math.round(point[1])};
    });
    drawPoly(scaledPoints(poly));
    dPoints.push(poly);
  });
}

function drawPoly(poly) {
  ctx.strokeStyle = '#000';
  ctx.moveTo(poly[0].x, poly[0].y);
  ctx.beginPath();
  poly.forEach((point, i) => {
    if(i < poly.length) {
      ctx.lineTo(poly[i].x, poly[i].y);
    }
  });
  ctx.closePath();
  if(poly.length > 2) {
    ctx.fillStyle = 'red';
    ctx.globalAlpha = 0.2;
    ctx.fill(); 
    ctx.globalAlpha = 1;
    ctx.stroke();
  }      
  else if(poly.length > 1) 
    ctx.stroke();
}

function scaledPoints(uPoints) {
  const sPoints = [];
  uPoints.forEach((point) => {
    if(img) {
      sPoints.push({ 
        x: Math.round(img.bb[0] + point.x * scale),
        y: Math.round(img.bb[1] + point.y * scale)
      });
    }
    else {
      sPoints.push({ 
        x: Math.round(point.x * scale),
        y: Math.round(point.y * scale)
      });
    }
  });
  return sPoints;
}

function draw() {
  ctx.clearRect(0, 0, can.width, can.height);
  if(img) {
    setImageBB();
    if(imageControl.checked)
      ctx.drawImage(img, ...img.bb);
    ctx.strokeStyle = '#0000ff';
    ctx.strokeRect(...img.bb);
  }
  if(points.length > 0) 
    drawPoints();
  if(decompControl.checked)
    ta.value = JSON.stringify(dPoints);
  else 
    ta.value = JSON.stringify(points);
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

canTest.onpointerdown = (e) => {
  let x = e.clientX - canTest.offsetLeft;
  let y = e.clientY - canTest.offsetTop;
  addObj(x, y);
  e.stopPropagation();
}

function runTest() {
  testBg.classList.toggle('invisible');
  (decompControl.checked) ? window.decomp = decomp : window.decomp = null;
  
  if(engine) {
    Matter.World.clear(engine.world);
    Matter.Engine.clear(engine);
  }
  engine = Matter.Engine.create();

  const render = Matter.Render.create({
    canvas: canTest,
    engine: engine,
    options: {
      width: 800,
      height: 600,
      wireframes: false
    }
  });
  if(wireControl.checked)
    render.options.wireframes = true;

  Matter.Render.run(render);
  const runner = Matter.Runner.create();
  Matter.Runner.run(runner, engine);  
  
  const ground = Matter.Bodies.rectangle(400, 580, 720, 20, {
    label: 'ground',
    isStatic: true,
    render: { 
      fillStyle: 'darkgray'
    }
  });
  
  Matter.Composite.add(engine.world, [ground]);
  addObj(400, 0);
}

function addObj(x, y) {
  let render = {};
  if(img && imageControl.checked) {
    render.sprite = { 
      texture: img.src,
      xScale: scale * 0.5,
      yScale: scale * 0.5
    };
  }
    
  const myObject = Matter.Bodies.fromVertices(x, y, points, {
    label: 'myObject',
    render: render
  }); 
  
  // console.log(myObject)
  
  // myObject.render.sprite.texture = 'https://cdn.glitch.me/22db1ff7-3ea8-4eab-9f25-9ca603a01e31%2FBear.png?v=1639170061996'//img.src;
  // myObject.render.sprite.texture = img.src;
  // myObject.render.sprite.xScale = myObject.render.sprite.yScale = scale * 0.5;
  
  Matter.Body.scale(myObject, scale * 0.5, scale * 0.5);
  Matter.Composite.add(engine.world, [myObject]);
}

const resizeObserver = new ResizeObserver(entries => {
  resize();
});
resizeObserver.observe(can);

function resize() {
  can.width = can.offsetWidth;
  can.height = can.offsetHeight;
  canTest.width = canTest.offsetWidth;
  canTest.height = canTest.offsetHeight;
  draw();
}
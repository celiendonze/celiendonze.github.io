
let canvas;
let context;

const NUMBER_OF_CIRCLES = 4000;
const RADIUS_OF_CIRCLES = 2;

function setup()
{
  if(context == undefined)
  {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
  }

  main();
}

function main()
{
  document.getElementById("displayInfiniteFraction").innerHTML = (1 + oneOverOnePlus(40));
  document.getElementById("displayFibonacci").innerHTML = (1 + getGoldenRatioWithFibonacci(40));
  document.getElementById("displaySqrt5").innerHTML = ((1 + Math.sqrt(5)) / 2);
  document.getElementById("displaySinus54").innerHTML = (2 * Math.sin(54 * (Math.PI/180)));

  drawGoldenFlower(context, oneOverOnePlus(40), NUMBER_OF_CIRCLES, RADIUS_OF_CIRCLES);
}

// generator for fibonacci numbers
function* fibonacci(range)
{
  let cmpt = 0;
  let previous = 0;
  let current  = 1;
  while(cmpt < range)
  {
    let tmp = previous + current;
    previous = current;
    current = tmp;
    yield current;
    cmpt++;
  }
}

// uses fibonacci to calcutate the golden ratio
function* goldenRatioWithFibonacci(range)
{
  let previous = 1;
  for(let n of fibonacci(range))
  {
    yield n/previous;
    previous = n;
  }
}

globalNumber = 0;
globalCmpt = 0;
function autoMoveToGoldenRatio()
{
  updateRangeDisplay(globalNumber);
  writeFormula(globalCmpt);
  drawGoldenFlower(context, globalNumber, NUMBER_OF_CIRCLES, RADIUS_OF_CIRCLES);
  globalNumber = 1 / (1 + globalNumber);
  globalCmpt++;
  if (globalCmpt > 40) {
    //reset of the global variables
    resetGolbalVariables();
    return;
  }
  setTimeout(function() {
    autoMoveToGoldenRatio();
    //window.requestAnimationFrame(autoMoveFlower);
  }, 1000);
}

function resetGolbalVariables()
{
  globalNumber = 0;
  globalCmpt = 0;
}

function updateRangeDisplay(number)
{
  document.getElementById("goldenRationDisplay").innerHTML = 1 + parseFloat(number);
  document.getElementById("inputGoldenRatio").value = number;
}

function fromAtoBwithStep(a,b,step)
{
  if(a < b)
  {
    updateRangeDisplay(a);
    drawGoldenFlower(context, a, NUMBER_OF_CIRCLES, RADIUS_OF_CIRCLES);
    window.requestAnimationFrame(function(){fromAtoBwithStep(a+step,b,step)});
  }
}

function onClickButtonGo()
{
  let start = parseFloat(document.getElementById("start").value);
  let end = parseFloat(document.getElementById("end").value);
  let step = parseFloat(document.getElementById("step").value);

  fromAtoBwithStep(start, end, step);
}

function writeFormula(step)
{
  formulaIncr = " + {1 \\over {1";
  formulaBase = "\\( \\phi \\approx 1 + { 1 \\over {1 ";
  formulaEnd = "}}";
  formula = "";
  if(step > 0)
  {
    formula = formulaBase;
    for (var i = 1; i < step; i++) {
      formula += formulaIncr;
      formulaEnd += "}}";
    }
    formula += formulaEnd + "\\)";
  }
  document.getElementById("mathFormula").innerHTML = formula;
  document.getElementById("mathFormula").style.visibility = "hidden";
  document.getElementById("mathFormula").style.fontSize = (50-step)+"px";
  MathJax.Hub.Queue(["Typeset",MathJax.Hub,"mathFormula"]);
  MathJax.Hub.Queue(function () {
    document.getElementById("mathFormula").style.visibility = "visible";
  });
}


function actionOnRangeMove()
{
  let newNumber = document.getElementById("inputGoldenRatio").value;
  drawGoldenFlower(context, newNumber, NUMBER_OF_CIRCLES, RADIUS_OF_CIRCLES);
  document.getElementById("goldenRationDisplay").innerHTML = (1 + parseFloat(newNumber)).toFixed(3);
}

function drawGoldenFlower(ctx, number, range, radius)
{
  ctx.save();
  ctx.clearRect(0 ,0 ,canvas.width, canvas.height);
  ctx.translate(canvas.width/2, canvas.height/2)
  let n = 1;
  let angle = 0;
  while(range > 0)
  {
    let c = 1.618*radius
    let dr = c*Math.sqrt(n);

    let centerX = dr*Math.cos(angle);
    let centerY = dr*Math.sin(angle);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.lineWidth = 0.3;
    ctx.strokeStyle = '#003300';
    ctx.stroke();

    angle += number*Math.PI*2;
    n++;
    range--;
  }
  ctx.restore();
}

function drawGoldenRatioGraph(ctx, range)
{
  if(ctx != undefined)
  {
    let index = 0;
    ctx.beginPath();
    //ctx.moveTo(0,0);
    for(let n of goldenRatioFraction(range))
    {
      n*=200;
      ctx.lineTo(index, n);
      ctx.moveTo(index, n);

      index += canvas.width/range;
    }
    ctx.stroke();
  }
}

function* goldenRatioFraction(range)
{
  let x = 1
  while(range > 0)
  {
    range--;
    x = 1/(1+x);
    yield x;
  }
}

function getGoldenRatioWithFibonacci(steps)
{
  let n = 0;
  for (n of goldenRatioFraction(steps)){}
  return n;
}

//if range == 40, precise enough
function oneOverOnePlus(range)
{
  if(range > 0)
  {
    return 1 / (1 + oneOverOnePlus(--range));
  }
  else
  {
    return 0;
  }
}

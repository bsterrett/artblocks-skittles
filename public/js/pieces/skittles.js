/*********************EXTERNAL LIBRARIES********************************************/
function genTokenData(projectNum) {
  let data = {};
  let hash = "0x";
  for (var i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  data.hash = hash;
  data.tokenId = (
    projectNum * 1000000 +
    Math.floor(Math.random() * 1000)
  ).toString();
  return data;
}


/*******************************Math Functions **********************************/
function update_nonconstants(){
  m = mm[current_index];
  n = nn[current_index];
  console.log(`m:${m} n:${n}`)
  KX = (m * Math.PI) / plate_length;
  KY = (n * Math.PI) / plate_length;
  KXL = KX / L;
  KYL = KY / L;
  w = velocity * Math.sqrt((KX ^ 2) + (KY ^ 2));
  console.log(w)
  if(++current_index >= max_index) current_index = 0;
}


/*******************************Drawing Functions **********************************/
const color_variances = {
  "hue": 42,
  "saturation": 4,
  "lightness": 4,
}

const color_definitions = [
  {
    // Pastel Yellow
    "hue": 60,
    "saturation": 93,
    "lightness": 83,
  },
  {
    // Pastel Red
    "hue": 350,
    "saturation": 93,
    "lightness": 83,
  },
  {
    // Pastel Blue
    "hue": 200,
    "saturation": 93,
    "lightness": 83,
  },
  {
    // Pastel Green
    "hue": 140,
    "saturation": 93,
    "lightness": 83,
  },
  {
    // Pastel Orange
    "hue": 20,
    "saturation": 93,
    "lightness": 83,
  },
  {
    // Pastel Purple
    "hue": 260,
    "saturation": 93,
    "lightness": 83,
  },
];

function impose_min_max(min, max, val) {
  if(val > max) {
    return max;
  }
  if(val < min) {
    return min;
  }
  return val;
}

function get_fuzzed_color_definition(color_definition_iter) {
  color_definition = color_definitions[color_definition_iter];
  return {
    "hue": impose_min_max(0, 359, color_definition["hue"] + random(-1 * color_variances["hue"], color_variances["hue"])),
    "saturation": impose_min_max(0, 99, color_definition["saturation"] + random(-1 * color_variances["saturation"], color_variances["saturation"])),
    "lightness": impose_min_max(0, 99, color_definition["lightness"] + random(-1 * color_variances["lightness"], color_variances["lightness"])),
  }
}

function transition_value(start, target, percentage) {
  offset = Math.floor(percentage * (target - start));
  return start + offset;
}

color_definition_iter = 1;
function draw_dots(time) {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (element in particle_coords_x) {
    ctx.beginPath();

    if(element % Math.floor(particle_count / 20) == 0) {
      color_definition = get_fuzzed_color_definition(color_definition_iter);
      hue = color_definition["hue"];
      saturation = color_definition["saturation"];
      lightness = color_definition["lightness"];
    }

    if(collision[element] == false) {
      ctx.fillStyle = `hsla(${hue},${saturation}%,${lightness}%,1)`;
      ctx.strokeStyle = `hsla(${hue},${saturation}%,${lightness}%,1)`;
      if(time > 0.8) {
        time = t = 0;
        color_definition_iter = (color_definition_iter + 1) % color_definitions.length;
      }
    } else {
      ctx.fillStyle = `hsla(${hue},${saturation}%,${lightness}%,1)`;
      ctx.strokeStyle = `hsla(${hue},${saturation}%,${lightness}%,1)`;
    }

    ctx.moveTo(particle_coords_x[element], particle_coords_y[element]);
    ctx.lineTo(particle_coords_x[element] + (random(0,6) - 3), particle_coords_y[element] + (random(0,6) - 3));
    // ctx.arc(particle_coords_x[element], particle_coords_y[element], Diameter, 0, 2 * Math.PI);

    ctx.fill();
    ctx.stroke();
  }
}


/******************************* Position Functions **********************************/
var t = 0;
collisions = true;

function shake_table() {
  t += .01
  t = t % 1000

  draw_dots(t);

  if(t % .8 < .01) {
    //collisions = false;
    update_nonconstants();
  }

  // if ( t % .2 < .01){
  //   particle_coords_x = Array.from({ length: particle_count }, (_, index) => L * R.random_dec());
  //   particle_coords_y = Array.from({ length: particle_count }, (_, index) => L * R.random_dec());
  // }

  // Move particles according to gradient
  for (i = 0; i < particle_count; i++) {
    dx = KXL * A * Math.cos(particle_coords_x[i] * KXL) * Math.sin(particle_coords_y[i] * KYL) + B * KYL * Math.cos(particle_coords_x[i] * KYL) * Math.sin(particle_coords_y[i] * KYL); // BUG
    dy = KYL * A * Math.sin(particle_coords_x[i] * KXL) * Math.cos(particle_coords_y[i] * KYL) + B * KXL * Math.cos(particle_coords_x[i] * KYL) * Math.cos(particle_coords_y[i] * KXL);
    x_next = particle_coords_x[i] - dx * L ;
    y_next = particle_coords_y[i] - dy * L;
    collision[i] = false;

    if(collisions){
      for (j = 0; j < particle_count; j++) {
        if (i != j) {
          if (Math.pow(x_next - particle_coords_x[j], 2) + Math.pow(y_next - particle_coords_y[j], 2) < Math.pow(Diameter, 2)) {
            // x_next = particle_coords_x[i] + (x_next - particle_coords_x[j]) * 10 * Diameter;
            // y_next = particle_coords_y[i] + (y_next - particle_coords_y[j])  * 10 * Diameter;
            x_next = L * random();
            y_next = L * random();
            collision[i] = true;
            break;
          }
        }
      }
    }

    if(Math.abs(particle_coords_x[i]) > L || Math.abs(particle_coords_y[i]) > L){
      x_next = L * random();
      y_next = L * random();
    }

    particle_coords_x[i] = x_next;
    particle_coords_y[i] = y_next;
  }

  requestAnimationFrame(shake_table);
};


/*******************************Test **********************************/
function setup() {
  // window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 5000;
  var DEFAULT_SIZE = 1000;
  // var WIDTH = window.innerWidth;
  // var HEIGHT = window.innerHeight;
  var WIDTH = 800;
  var HEIGHT = 800;
  var DIM = Math.min(WIDTH, HEIGHT);
  var SCALE = DIM / DEFAULT_SIZE; /// USE THIS FOR SCALING OBJECTS TO SET SIZE
  // let tokenData = genTokenData(666);

  canvas = createCanvas(800, 800);
  console.log(canvas);
  ctx = canvas.drawingContext;

  // Canvas Setup
  // const canvas = document.getElementById("canvas1");
  // const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.fillStyle='rgb(25, 25, 25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Constants for Equasions
  plate_length = 1;
  velocity = 100;
  m = Math.floor(random(1, 3));
  n = Math.floor(random(1, 3));
  A = 1;
  B = 1;
  L = 1000;
  KX = (m * Math.PI) / plate_length;
  KY = (n * Math.PI) / plate_length;
  KXL = KX / L;
  KYL = KY / L;
  w = velocity * Math.sqrt((KX ^ 2) + (KY ^ 2));

  particle_count = 100;
  Diameter = 1

  // Particle coordinates
  particle_coords_x = Array.from({ length: particle_count }, (_, index) => L * random());
  particle_coords_y = Array.from({ length: particle_count }, (_, index) => L * random());
  collision = Array.from({ length: particle_count }, (_, index) => false);
  space = L;
  // gradient randomness
  current_index = 0;
  max_index = 13;
  mm = Array.from({length:max_index}, (_, index) => Math.floor(random(1, 10)))
  nn = Array.from({length:max_index}, (_, index) => Math.floor(random(1, 10)))

  shake_table();
}

let steps_per_segment = 4


// Eyebrows
let eyebrow_spline_point_count = 30


let splines = []
let rays = []
let hidden_shape_points = []


x_offset = 100

function Point(x, y) {
  this.x = x;
  this.y = y;
}


let hidden_shape = [
  new Point(300, 100),
  new Point(500, 100),
  new Point(500, 400),
  new Point(300, 400),
  new Point(300, 100)
]

class Ray {
  constructor(point_array, center_point, lerp_width , rubbing_shape=false, taper=false){
    this.point_array = point_array
    this.center_point = center_point
    this.count = 0
    this.rubbing_shape = rubbing_shape
    this.lerp_width = lerp_width
    this.taper = taper
  }

  find_closest_rubbing_shape_point(x, y){
    let distance = Infinity
    let p = new Point(0,0)
    if (this.rubbing_shape){
      this.rubbing_shape.forEach((point) => {
        if (dist(x,y, point.x, point.y) < distance ) {
          distance = dist(x,y, point.x, point.y)
          p =  new Point(point.x,point.y)
        }
    });
      return p
    }
    return null
  }

  draw_next(){
    if (this.count < this.point_array.length) {
      let from = color("black");
      let to = color("white");
      let lerp_color = color("blue");
      if(this.rubbing_shape){
        let lerp_point = this.find_closest_rubbing_shape_point(this.point_array[this.count].x, this.point_array[this.count].y)
        lerp_color = lerpColor(from, to, (this.taper ? (this.count/(this.point_array.length*2)) : 0) + Math.abs(Math.sqrt(Math.pow(lerp_point.x - this.point_array[this.count].x,2) + Math.pow(lerp_point.y - this.point_array[this.count].y,2) ) / this.lerp_width))
      }else {
        lerp_color = lerpColor(from, to, Math.abs(this.center_point.x - this.point_array[this.count].x) / this.lerp_width)
      }

      noStroke();
      beginShape();
      stroke(lerp_color);
      circle(this.point_array[this.count].x, this.point_array[this.count].y, .1);
      endShape()
      this.count ++
    }
  }
}

var catmullRomFitting = function (data,alpha, steps) {

    if (alpha == 0 || alpha === undefined) {
      return false;
    } else {
      var p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
      var d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
      var d = Math.round(data[0].x) + ',' + Math.round(data[0].y) + ' ';
      var length = data.length;
      let point_arr = []
      for (var i = 0; i < length - 1; i++) {

        p0 = i == 0 ? data[0] : data[i - 1];
        p1 = data[i];
        p2 = data[i + 1];
        p3 = i + 2 < length ? data[i + 2] : p2;

        d1 = Math.sqrt(Math.pow(p0.x - p1.x, 2) + Math.pow(p0.y - p1.y, 2));
        d2 = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
        d3 = Math.sqrt(Math.pow(p2.x - p3.x, 2) + Math.pow(p2.y - p3.y, 2));

        d3powA = Math.pow(d3, alpha);
        d3pow2A = Math.pow(d3, 2 * alpha);
        d2powA = Math.pow(d2, alpha);
        d2pow2A = Math.pow(d2, 2 * alpha);
        d1powA = Math.pow(d1, alpha);
        d1pow2A = Math.pow(d1, 2 * alpha);

        A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
        B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
        N = 3 * d1powA * (d1powA + d2powA);
        if (N > 0) {
          N = 1 / N;
        }
        M = 3 * d3powA * (d3powA + d2powA);
        if (M > 0) {
          M = 1 / M;
        }

        bp1 = { x: (-d2pow2A * p0.x + A * p1.x + d1pow2A * p2.x) * N,
          y: (-d2pow2A * p0.y + A * p1.y + d1pow2A * p2.y) * N };

        bp2 = { x: (d3pow2A * p1.x + B * p2.x - d2pow2A * p3.x) * M,
          y: (d3pow2A * p1.y + B * p2.y - d2pow2A * p3.y) * M };

        if (bp1.x == 0 && bp1.y == 0) {
          bp1 = p1;
        }
        if (bp2.x == 0 && bp2.y == 0) {
          bp2 = p2;
        }

        for (let i = 0; i <= steps; i++) {
            let t = i / steps;
            let x = bezierPoint(p1.x, bp1.x, bp2.x, p2.x, t);
            let y = bezierPoint(p1.y, bp1.y, bp2.y, p2.y, t);
            point_arr.push(new Point(x,y))
        }
      }

      return point_arr;
    }
};


function animate_splines() {
  rays.forEach((ray) => {
    ray.draw_next()
  });
  setTimeout(animate_splines, 1);
}

function setup() {
    createCanvas(800, 500);
    //make_gradient()
    background("hsl(57, 100%, 96%)");
    //background("grey");
    noFill();
    let brows = make_eyebrows(400, 45,450,Math.PI/64,.2,'arched', 'curved', 3)
    generate_iterations_from_spline(brows[0], 10, 40, true)
    generate_iterations_from_spline(brows[1], 10, 40, true)

    brows = make_eyebrows(400, 35,350,Math.PI/64,.5,'arched', 'arched', 3)
    generate_iterations_from_spline(brows[0], 10, 40, true)
    generate_iterations_from_spline(brows[1], 10, 40, true)

    brows = make_eyebrows(400, 25,250,.5,.3,'none', 'none', 3)
    generate_iterations_from_spline(brows[0], 10, 40, true)
    generate_iterations_from_spline(brows[1], 10, 40, true)

    //draw_catmul_spline()
    animate_splines()

}

function generate_iterations_from_spline(spline_array, iterations, randomness, taper=false) {
  let iteration = []
  for (let k = 0; k < iterations ; k ++) {
    let spline = []
    for (let j = 0; j < spline_array.length; j ++) {
      if(spline.length){
        spline.push(new Point(((Math.random()-.5)*randomness + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((Math.random()-.5)*randomness + spline.slice(-1)[0].y + spline_array[j].y )/ 2))
      }else {
        spline.push(new Point((Math.random()-.5)*20 + spline_array[j].x, spline_array[j].y))
      }

    }
    iteration.push(spline)
    rays.push(new Ray(catmullRomFitting(spline, 1, 10), new Point(0,0),30, spline_array, taper))
  }
  

}



function draw_shape(array) {

  beginShape();
  array.forEach((points) => {
    point(points.x, points.y)
  });
  endShape()

}

function eyebrow_type(brow_type, i_value) {
  if(brow_type == 'curved') {
    return  (i_value - 20)*(i_value - 2)*.0125
  }
  else if (brow_type == 'arched') {
    return  (i_value - 20)*(i_value - 2)*.05
  } else {
    return 0
  }
}

function make_eyebrows(center_line, x_offset, base_height, tilt_angle_left, tilt_angle_right, left_type, right_type, length) {
  let left_brow_ = []
  let right_brow_ = []
  for (let i = 0; i < eyebrow_spline_point_count; i++){
    left_brow_.push(new Point( center_line - x_offset - i*Math.cos(tilt_angle_left) * length, base_height - i*Math.sin(tilt_angle_left)* length + eyebrow_type(left_type, i)))
    right_brow_.push(new Point( center_line + x_offset + i*Math.cos(tilt_angle_right)* length, base_height - i*Math.sin(tilt_angle_right)* length + eyebrow_type(right_type, i)))
  }

  return [catmullRomFitting(left_brow_, 1, 4) , catmullRomFitting(right_brow_, 1, 4)]
}


function draw_catmul_spline(){
    splines.forEach((line) => {
        line.forEach((iteration) => {
            rays.push(new Ray(catmullRomFitting(iteration, 1, steps_per_segment), new Point(iteration[0].x, iteration[0].y), lerp_width_g))
        });
    });

}


////////////////////////////
//// CODE GRAVEYARD
////////////////////////////
// let iteration_scale = 5
// let randomness_scale = .2
// let line_count = 20
// let line_offset = 30
// let lerp_width_g = 10
// let spline_segment_count = 100
// let segment_skew_factor = .5
// let spline_length = 500

// function make_gradient() {
//   for(let i = 0; i < line_count; i++){
//       let iteration = []
//       for(let k = 0; k < i*iteration_scale; k++){
//           let spline = []
//           let segment_count_skew = (Math.random()-.5)*spline_segment_count*segment_skew_factor
//           let current_segment_count = spline_segment_count + segment_count_skew 
//           for (let j = 0; j < current_segment_count; j++) {
//               if (spline.length){
//                   spline.push(new Point(spline.slice(-1)[0].x  + (Math.random()-.5)*randomness_scale*k ,j*spline_length/current_segment_count))
//               } else {
//                   spline.push(new Point(i*line_offset +(Math.random()-.5)*randomness_scale*i + x_offset, j*spline_length/current_segment_count + (Math.random()-.5)*randomness_scale*i))
//               }

//               //spline.push(new Point(i*line_offset +(Math.random()-.5)*randomness_scale*i + x_offset, j*spline_length/current_segment_count + (Math.random()-.5)*randomness_scale*i))
//           }
//           iteration.push(spline)
//       }
//       splines.push(iteration)
//       iteration = [];
//   }
// }
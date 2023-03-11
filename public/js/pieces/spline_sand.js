let iteration_scale = 5
let randomness_scale = .2
let line_count = 20
let line_offset = 30
let spline_segment_count = 100
let segment_skew_factor = .5
let spline_length = 500
let steps_per_segment = 4

let splines = []
let rays = []


x_offset = 100

function Point(x, y) {
  this.x = x;
  this.y = y;
}

class Ray {
  constructor(point_array, center_point){
    this.point_array = point_array
    this.center_point = center_point
    this.count = 0
  }
  draw() {
    noStroke();
    beginShape();
    this.point_array.forEach((point) => {
      let from = color("black");
      let to = color("white");
      let lerp_color = lerpColor(from, to, Math.abs(this.center_point.x - point.x) / line_offset)
      stroke(lerp_color);
      circle(point.x, point.y, .04);
    });
    endShape()
  }
  draw_next(){
    if (this.count < this.point_array.length) {
      let from = color("black");
      let to = color("white");
      let lerp_color = lerpColor(from, to, Math.abs(this.center_point.x - this.point_array[this.count].x) / line_offset)
      noStroke();
      beginShape();
      stroke(lerp_color);
      circle(this.point_array[this.count].x, this.point_array[this.count].y, .04);
      endShape()
      this.count ++
    }
  }
}

var catmullRomFitting = function (data,alpha) {

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

        d += 'C' + bp1.x + ',' + bp1.y + ' ' + bp2.x + ',' + bp2.y + ' ' + p2.x + ',' + p2.y + ' ';
        // noStroke();
        // beginShape();
        // stroke('black');
        //bezier(p1.x, p1.y, bp1.x, bp1.y , bp2.x, bp2.y, p2.x,p2.y)
        for (let i = 0; i <= steps_per_segment; i++) {
            let t = i / steps_per_segment;
            let x = bezierPoint(p1.x, bp1.x, bp2.x, p2.x, t);
            let y = bezierPoint(p1.y, bp1.y, bp2.y, p2.y, t);
            // circle(x, y, .4);
            point_arr.push(new Point(x,y))
        }
        // endShape();
        
      }

      return point_arr;
    }
};


function animate_splines() {
  rays.forEach((ray) => {
    ray.draw_next()
  });
  setTimeout(animate_splines, 100);
}

function setup() {
    createCanvas(800, 500);
    make_gradient()
    background("hsl(57, 100%, 96%)");
    noFill();
    draw_catmul_spline()
    animate_splines()
}

function make_gradient() {
    for(let i = 0; i < line_count; i++){
        let iteration = []
        for(let k = 0; k < i*iteration_scale; k++){
            let spline = []
            let segment_count_skew = (Math.random()-.5)*spline_segment_count*segment_skew_factor
            let current_segment_count = spline_segment_count + segment_count_skew 
            for (let j = 0; j < current_segment_count; j++) {
                if (spline.length){
                    spline.push(new Point(spline.slice(-1)[0].x  + (Math.random()-.5)*randomness_scale*k ,spline.slice(-1)[0].y  + (Math.random()-.5)*randomness_scale*k))
                } else {
                    spline.push(new Point(i*line_offset +(Math.random()-.5)*randomness_scale*i + x_offset, j*spline_length/current_segment_count + (Math.random()-.5)*randomness_scale*i))
                }

                //spline.push(new Point(i*line_offset +(Math.random()-.5)*randomness_scale*i + x_offset, j*spline_length/current_segment_count + (Math.random()-.5)*randomness_scale*i))
            }
            iteration.push(spline)
        }
        splines.push(iteration)
        iteration = [];
    }
}


function draw_catmul_spline(){
    splines.forEach((line) => {
  
        line.forEach((iteration) => {
            rays.push(new Ray(catmullRomFitting(iteration, 1), new Point(iteration[0].x, iteration[0].y)))
        });
    });

}



function draw() {

    //draw_points_from_iterations()
}

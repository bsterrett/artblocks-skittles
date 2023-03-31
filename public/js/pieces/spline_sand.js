// Eyebrows
let eyebrow_spline_point_count = 30
let steps_per_segment = 4

let splines = []
let rays = []

x_offset = 100

function Point(x, y) {
  this.x = x;
  this.y = y;
}

class Ray {
  constructor(point_array, center_point, lerp_width , rubbing_shape=false, taper=false, highlight=false){
    this.point_array = point_array
    this.center_point = center_point
    this.count = 0
    this.rubbing_shape = rubbing_shape
    this.lerp_width = lerp_width
    this.taper = taper
    this.highlight = highlight
    this.done = false
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

  draw() {
    for (let i = 0; i < this.point_array.length; i++) {

        let from = color("black");
        let to = color(this.brown_color);
        let lerp_color = color("blue");
        if(this.rubbing_shape){
          let lerp_point = this.find_closest_rubbing_shape_point(this.point_array[this.count].x, this.point_array[this.count].y)
          let lerp_pctn = (this.taper ? (this.count/(this.point_array.length*2)) : 0) + Math.abs(Math.sqrt(Math.pow(lerp_point.x - this.point_array[this.count].x,2) + Math.pow(lerp_point.y - this.point_array[this.count].y,2) ) / this.lerp_width)
          if (this.highlight && .445 < lerp_pctn && lerp_pctn < .475) {
            lerp_color = color(this.highlight);
          } else {
            lerp_color = lerpColor(from, to, lerp_pctn)
          }
  
        }else {
          lerp_color = lerpColor(from, to, Math.abs(this.center_point.x - this.point_array[this.count].x) / this.lerp_width)
        }
  
        noStroke();
        beginShape();
        stroke(lerp_color);
        circle(this.point_array[i].x, this.point_array[i].y, .08);
        endShape()
      }
  }

  brown_color = "#cea86c"
	torqoise = "#b3e7bf"
  
  pink = "#ff79c6"
  off_black = "#282a36"
  yellow_gold = "#feff00"

  draw_next(){
    if (this.count < this.point_array.length) {
      let from = color("black");
      let to = color(this.torqoise);
      let lerp_color = color("blue");
      if(this.rubbing_shape){
        let lerp_point = this.find_closest_rubbing_shape_point(this.point_array[this.count].x, this.point_array[this.count].y)
        let lerp_pctn = (this.taper ? (this.count/(this.point_array.length*2)) : 0) + Math.abs(Math.sqrt(Math.pow(lerp_point.x - this.point_array[this.count].x,2) + Math.pow(lerp_point.y - this.point_array[this.count].y,2) ) / this.lerp_width)
        if (this.highlight && .445 < lerp_pctn && lerp_pctn < .475) {
          lerp_color = color(this.highlight);
        } else {
          lerp_color = lerpColor(from, to, lerp_pctn)
        }

      }else {
        lerp_color = lerpColor(from, to, Math.abs(this.center_point.x - this.point_array[this.count].x) / this.lerp_width)
      }

      noStroke();
      beginShape();
      stroke(lerp_color);
      circle(this.point_array[this.count].x, this.point_array[this.count].y, .08);
      endShape()
      this.count ++
    } else {
      this.done = true
    }
  }


}

class FaceSculpture {
  constructor(center_line) {
    this.left_brow_ = null
    this.right_brow_ = null
    this.crown_ = null
    this.left_burn_ = null
    this.right_burn = null
    this.hair_ = null
    this.brow_point_count = 30
    this.center_line = center_line
  }

  generate_face() {

  }

  make_eyebrows(center_line, x_offset, base_height, tilt_angle_left, tilt_angle_right, left_type, right_type, length) {
    let left_brow_ = []
    let right_brow_ = []
    for (let i = 0; i < eyebrow_spline_point_count; i++){
      left_brow_.push(new Point( center_line - x_offset - i*Math.cos(tilt_angle_left) * length, base_height - i*Math.sin(tilt_angle_left)* length + eyebrow_type(left_type, i)))
      right_brow_.push(new Point( center_line + x_offset + i*Math.cos(tilt_angle_right)* length, base_height - i*Math.sin(tilt_angle_right)* length + eyebrow_type(right_type, i)))
    }
    this.left_brow_ = catmullRomFitting(left_brow_, 1, 4)
    this.right_brow_ =  catmullRomFitting(right_brow_, 1, 4)
    return [this.left_brow_ , this.right_brow_]
  }

  make_sideburns(center_line, x_offset, base_height, tilt_angle_left, tilt_angle_right, left_type, right_type, length) {
    let left_brow_ = []
    let right_brow_ = []
    for (let i = 0; i < eyebrow_spline_point_count; i++){
      left_brow_.push(new Point( center_line - x_offset - i*Math.cos(tilt_angle_left) * length, base_height - i*Math.sin(tilt_angle_left)* length + burn_type(left_type, i)))
      right_brow_.push(new Point( center_line + x_offset + i*Math.cos(tilt_angle_right)* length, base_height - i*Math.sin(tilt_angle_right)* length + burn_type(right_type, i)))
    }
    this.left_burn_ = catmullRomFitting(left_brow_, 1, 4)
    this.right_burn =  catmullRomFitting(right_brow_, 1, 4)
    return [this.left_burn_ , this.right_burn]
  }


  make_crown(center_line, base_height, tilt_angle_left, tilt_angle_right, left_type, right_type, length) {
    let crown = []
    let right_side = []
    for (let i = 0; i < this.brow_point_count; i++){
      crown.push(new Point( center_line - i*Math.cos(tilt_angle_left) * length, base_height - i*Math.sin(tilt_angle_left)* length + eyebrow_type(left_type, i)))
      crown.push(new Point( center_line + i*Math.cos(tilt_angle_right)* length, base_height - i*Math.sin(tilt_angle_right)* length + eyebrow_type(right_type, i)))
    }

    this.crown_ = catmullRomFitting( crown, 1, 4)

    return this.crown_
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

function animate_braids(){
  let done = true
  rays.forEach((ray) => {
    ray.draw_next()
    if (ray.done = false) {
      done = false
    }
  });
  setTimeout(animate_braids, 2);
}

function animate_splines() {
  let done = true
  rays.forEach((ray) => {
    ray.draw_next()
    if (ray.done == false) {
      done = false
    }
  });
  if(done) {
    rays = []
    splines = []
    let scale_factor = 1
    braids.forEach((braid) => {
      generate_iterations_from_spline(braid, 50, 100* scale_factor, false, 90, false, true )
      scale_factor += .5
    })
    console.log("starting animate braids")
    animate_braids()
  } else {
    setTimeout(animate_splines, 2);
  }

}


let exit_area = 500
let major_scale_down = 50
let minor_scale_down = 30
function generate_ellipse_points(major_axis, minor_axis, divisions, points, rotation = 1, x= 0, y = 0){

  for (let i = 0; i < 2*Math.PI; i = i + 2*Math.PI/ divisions) {
      points.push(new Point(major_axis*Math.cos(i * rotation) + x , minor_axis*Math.sin(i * rotation) + 250 - y))
  }
  if(Math.PI*major_axis*minor_axis < exit_area){
      return points
  } else {
      let minor_set = Math.random()* minor_scale_down
      let major_set = Math.random()*major_scale_down
      if(Math.random() < 1){
        
        generate_ellipse_points (  minor_axis - minor_set,major_axis - major_set, 50, points, rotation, x + minor_set ,y + major_set)
      } else {
        rotation += 1
        generate_ellipse_points (  major_axis - major_set,minor_axis - minor_set, 50, points, rotation,x + major_set,y + minor_set)
      }

  }
}

let color_rect = 0
let braids = []
function drawRect(x, y, w, h)
{
  // first draw a rectangle


  // then figure out if we need to draw another
  var splitWidth = random(1) > 0.5;
  var splitWhere = random(0.3, 0.8);

  // if we're splitting the width
  if(splitWidth && w > 400)
  {
    drawRect(x, y, w * splitWhere, h);
    drawRect(x + (w * splitWhere), y, w * (1 - splitWhere), h);
  }
  // else if we're splitting the height
  else if(h > 200)
  {
    drawRect(x, y, w, h * splitWhere);
    drawRect(x, y + (h * splitWhere), w, h * (1 - splitWhere));
  }
  else {
    let points = []
    // noFill();
    let color = color_rect % 360
    color_rect = color_rect + 30
    console.log("drawing")
    generate_iterations_from_spline(get_rectangle_array(x,y,w/2 ,h - h/2 ), 16, 40, false, 60, false  )//`hsl(${color}, 96%, 54%)` )

    return
  }
}

function get_lock_array(x1,y1,x_a, y_a, x2,y2, width=0, steps=32) {
  let arr  = []
  for (let i = 0 ; i < steps; i++){
    let t = i / steps;
    let x_s = curvePoint(x_a,x1, 1.5*x2, x1, t);
    let y_s = curvePoint(y_a,y1, 1.5*y2, 5*y2, t);
    arr.push (new Point(x_s,y_s))
    // noStroke();
    // beginShape();
    // stroke('red');
    // circle(x_s, y_s, 5);
    // endShape()
  }
  return arr
}

let braid = false;

function get_rectangle_array(x,y,w,h) {
  let arr =  []
  arr.push(new Point(x,y))
  arr.push(new Point(x+w,y))
  arr.push(new Point(x+w,y+h))
  arr.push(new Point(x,y+h))
  arr.push(new Point(x,y))
  let rect_pts = catmullRomFitting( arr, 1,  (w+h)/32)
  // rect_pts.forEach((point) => {
  //   noStroke();
  //   beginShape();
  //   stroke('white');
  //   circle(point.x, point.y, 5);
  //   endShape()
  // })

  // noStroke();
  // beginShape();
  // stroke('red');
  // circle((x + w/2), (y + h/2 ), 5);
  // endShape()
  let steps = 6
  arr = []

    // SPIRALS
    // for (let i = 0; i <= steps; i++) {
    // rect_pts.forEach((point) => {

    //     let t = i / steps;
    //   let x_s = curvePoint(point.x, point.x, x + w/2, x + w/2, t);
    //   let y_s = curvePoint(point.y, point.y, y + h/2, y + h/2, t);
    //   arr.push (new Point(x_s,y_s))
    //   //       noStroke();
    //   // beginShape();
    //   // stroke('black');
    //   // circle(x_s, y_s, 5);
    //   // endShape()
    // })
    // }

    if (!braid){
      braids.push(get_lock_array(x + w/2, y + h/2 + 10, x +10, y + 10, x+w + 10, y+h +30))
      braids.push(get_lock_array(x + w/2 + 15, y + h/2, x , y, x+w, y+h))
      braids.push(get_lock_array(x + w/2, y + h/2, x , y, x+w, y+h))
      braids.push(get_lock_array(x + w/2, y + h/2 -10, x - 10, y -10, x+w -10, y+h + 30))
      braids.push(get_lock_array(x + w/2 - 15, y + h/2, x , y, x+w, y+h))
      braid = true
    }else {
      //braid = false
    }


    // RAYS
    rect_pts.forEach((point) => {
      for (let i = 0; i <= steps; i++) {
        let t = i / steps;
      let x_s = curvePoint(point.x, point.x, x + w/2, x + w/2, t);
      let y_s = curvePoint(point.y, point.y, y + h/2, y + h/2, t);
      arr.push (new Point(x_s,y_s))
      // noStroke();
      // beginShape();
      // stroke('white');
      // circle(x_s, y_s, 5);
      // endShape()
      }
    })

  rect_pts = catmullRomFitting( arr, 1,  2)
  return rect_pts
}

function setup() {
    let width = 500
    let height = 500
    createCanvas(width, height);
    //background("hsl(57, 100%, 96%)");
    background("#b4e7e0");
    noFill();
    //drawRect(100, 100, width - 200, height - 200);
    // middle
    generate_iterations_from_spline(get_rectangle_array(100,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // right
    generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // top middle
    generate_iterations_from_spline(get_rectangle_array(100,100 - (height - height/2) - 50,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // bottom middle
    generate_iterations_from_spline(get_rectangle_array(100,100 + (height - height/2) +50,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // left
    generate_iterations_from_spline(get_rectangle_array(100 - width/2 - 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )

    // generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )






    //generate_iterations_from_spline(get_rectangle_array(100,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    //get_rectangle_array(100,100,width/2 ,height - height/2 )
    // f = new FaceSculpture(400)
    // let brows = f.make_eyebrows(400, 45,450,Math.PI/64,Math.PI/64,'arched', 'arched', 3)
    // generate_iterations_from_spline(brows[0], 10, 40, true)
    // generate_iterations_from_spline(brows[1], 10, 40, true)

    //generate_iterations_from_spline(get_rectangle_array(100,100,50,100), 5, 20, false, 10)

    // let crown = f.make_crown(400,375,Math.PI/64,Math.PI/64,'arched', 'arched', 6)
    // generate_iterations_from_spline(crown, 30, 100, true)

    // let burns = f.make_sideburns(400, 160,450,Math.PI/4,Math.PI/4,'arched', 'arched', 2)
    // generate_iterations_from_spline(burns[0], 10, 40, true)
    // generate_iterations_from_spline(burns[1], 10, 40, true)
    // let points = []
    // generate_ellipse_points(150, 200, 20, points)
    // generate_iterations_from_spline(points, 20, 40, true)
    // brows = f.make_eyebrows(400, 25,250,.5,.3,'none', 'none', 3)
    // generate_iterations_from_spline(brows[0], 10, 40, true)
    // generate_iterations_from_spline(brows[1], 10, 40, true)

    // draw_catmul_spline()
    // rays.forEach((ray) => {
    //   ray.draw()
    // });


    // rays = []
    // splines = []

    animate_splines()

    // rays = []
    // splines = []

    // draw_catmul_spline()

}

function generate_iterations_from_spline(spline_array, iterations, randomness, taper=false,color_line=30,  highlight='hsl(180, 96%, 54%)',randomness_taper=false ) {
  let iteration = []

  for (let k = 0; k < iterations ; k ++) {
    let spline = []
    for (let j = 0; j < spline_array.length; j ++) {
      if(spline.length){
        if(randomness_taper) {
          console.log(Math.min(200,Math.max(4*randomness/(spline_array.length - j), 1)))
          spline.push(new Point(((Math.random()-.5)*Math.min(40,Math.max(4*randomness/(spline_array.length - j), 1)) + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((Math.random()-.5)*Math.min(40,Math.max(4*randomness/(spline_array.length - j), 1)) + spline.slice(-1)[0].y + spline_array[j].y )/ 2))
        } else {
          spline.push(new Point(((Math.random()-.5)*randomness + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((Math.random()-.5)*randomness + spline.slice(-1)[0].y + spline_array[j].y )/ 2))          
        }

      }else {
        spline.push(new Point((Math.random()-.5)*20 + spline_array[j].x, spline_array[j].y))
      }

    }
    iteration.push(spline)
    rays.push(new Ray(catmullRomFitting(spline, 1, 10), new Point(0,0),color_line, spline_array, taper, highlight))
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

function burn_type(brow_type, i_value) {
  if(brow_type == 'curved') {
    return  (i_value - 20)*(i_value - 2)*.0125
  }
  else if (brow_type == 'arched') {
    return  -(i_value - 20)*(i_value - 2)*.5
  } else {
    return 0
  }
}


let lerp_width_g = 10

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

// let spline_segment_count = 100
// let segment_skew_factor = .5
// let spline_length = 500

// let hidden_shape_points = []
// let hidden_shape = [
//   new Point(300, 100),
//   new Point(500, 100),
//   new Point(500, 400),
//   new Point(300, 400),
//   new Point(300, 100)
// ]

function make_gradient(line_count,iteration_scale, line_offset, randomness_scale, spline_length, x_start, y_start) {
  let spline_segment_count = 100
  let segment_skew_factor = .5
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
                  spline.push(new Point(i*line_offset +(Math.random()-.5)*randomness_scale*i + x_start, j*spline_length/current_segment_count + (Math.random()-.5)*randomness_scale*i + y_start))
              }

              //spline.push(new Point(i*line_offset +(Math.random()-.5)*randomness_scale*i + x_offset, j*spline_length/current_segment_count + (Math.random()-.5)*randomness_scale*i))
          }
          iteration.push(spline)
      }
      splines.push(iteration)
      iteration = [];
  }
}


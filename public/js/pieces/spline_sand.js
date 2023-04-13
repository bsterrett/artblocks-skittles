// Eyebrows
let eyebrow_spline_point_count = 30
let steps_per_segment = 4

let splines = []
let rays = []
let braids = []

x_offset = 100

let width = 500
let height = 500

function Point(x, y) {
  this.x = x;
  this.y = y;
}

class Ray {
  constructor(point_array, center_point, lerp_width , rubbing_shape=false, taper=false, highlight=false, invert = false){
    this.point_array = point_array
    this.center_point = center_point
    this.count = 0
    this.rubbing_shape = rubbing_shape
    this.lerp_width = lerp_width
    this.taper = taper
    this.highlight = highlight
    this.done = false
    this.invert = invert
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
  
        // noStroke();
        // beginShape();
        // stroke(lerp_color);
        // circle(this.point_array[i].x, this.point_array[i].y, .08);
        // endShape()
      }
  }

  brown_color = "#cea86c"
	torqoise = "#b3e7bf"
  
  pink = "#ff79c6"
  off_black = "#282a36"
  yellow_gold = "#feff00"

  draw_next(){
    if (this.count < this.point_array.length) {
      let from = color("#0d235f");
      let to = color("b0cdcb");
      if (this.invert){
        to = color("#0d235f");
        from = color("b0cdcb");
      }
      let lerp_color = color("#0d235f");
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



class ScalpFactory {
  // this class needs to take in differentiating types for each piece
  // and generate the relevant hair blocks and locs
  // Box braids or corn rows or zig braids
  hair_type = null
  // total number of boxes or interlocking zags or corn rows displayed in the piece
  hair_number = null
  // shape of boxes or interlocking zig zags
  hair_shape = null
  // how big are my box braids / how much space in between zig zags / corn rows
  hair_size = null 
  // loc or braid
  braid_type = null
  // background color framing the piece
  background_color = null
  // the color of the hair
  base_color = null
  // linear interpolation color creating highlights in hair
  highlight_color = null

  width = 500
  height = 500
  offset = 50


  constructor( hair_type, hair_number, hair_shape, hair_size, braid_type, base_color, highlight_color, background_color ) {
  // Box braids or corn rows or zig braids
  this.hair_type = hair_type
  this.hair_number = hair_number
  this.hair_shape = hair_shape
  this.hair_size = hair_size 
  this.braid_type = braid_type
  this.background_color = background_color
  this.base_color = base_color
  this.highlight_color = highlight_color
  this.hairigon_list = []
  this.make_hair()
}
  make_hair() {
      for (let i = 0; i < this.hair_number; i++) {
        switch(this.hair_type) {
          case "box":
            break;
          case "zig":
            // for zigg zagg pattern, the spacing is dictated by the number o zigg
            this.hairigon_list.push(new ZigZag(new Point ((i % 2 == 0 ? this.width/2 - this.offset : this.offset) , this.offset + i*(this.height - this.offset)/this.hair_number ), (this.width - this.offset)/2 , 50, this.braid_type, i % 2 == 0 ? true:false))
            
            break;
          case "cornrows":
            let source_point = new Point (this.offset + i*(this.width - this.offset)/this.hair_number , 0)
            switch(this.hair_shape) {
              case "up":
                source_point.x = this.offset + i*(this.width - this.offset)/this.hair_number
                source_point.y = height
                break
              case "right":
                source_point.x = 0
                source_point.y = this.offset + i*(this.height - this.offset)/this.hair_number
                break
              case "left":
                source_point.x = width
                source_point.y = this.offset + i*(this.height - this.offset)/this.hair_number
                break
              default:
                // We want to default to the down case
                // this is very dangerous but I swear
                // I know what I'm doing ...
              case "down":
                source_point.x = this.offset + i*(this.width - this.offset)/this.hair_number
                source_point.y = 0
                break
            }

            this.hairigon_list.push(new Cornrow(source_point, 30, this.hair_shape,this.braid_type))
            break
          default:
            console.log(`ERROR: ${this.hair_type} not valid type`)
        }
      }

  }

}
class Hairigon {
  backbone = []
  constructor( base_point, braid_type=false) {
    this.base_point = base_point
    this.braid_type = braid_type
  }
}

class Box extends Hairigon {
  constructor(base_point, braid_type=false, width, height) {
    super(base_point, braid_type)
    this.width = width
    this.height = height
  }
}

class Cornrow extends Hairigon {
  constructor(base_point, width, direction, braid_type=false) {
    super(base_point, braid_type)
    this.direction = direction
    this.width = width

    this.backbone = this.build_array()

  }

  build_array() {
    let destination_point = new Point(0,0)
    console.log(this.direction)
    switch(this.direction) {
      case "up":
        destination_point.x = this.base_point.x
        destination_point.y = 0
        break
      case "left":
        destination_point.x = 0
        destination_point.y = this.base_point.y
        break
      case "right":
        destination_point.x = width
        destination_point.y = this.base_point.y
        break
      default:
        // We want to default to the down case
        // this is very dangerous but I swear
        // I know what I'm doing ...
      case "down":
        destination_point.x = this.base_point.x
        destination_point.y = height
        break
    }



    let split_length = 16

    braids.push(weave_braid_along_line(get_lock_array(this.base_point.x ,this.base_point.y,this.base_point.x ,this.base_point.y, destination_point.x,  destination_point.y, 0, split_length), 20, false))
    braids.push(weave_braid_along_line(get_lock_array(this.base_point.x, this.base_point.y,this.base_point.x ,this.base_point.y,  destination_point.x, destination_point.y, 0, split_length), 20, true))
    braids.push(weave_braid_along_line(get_lock_array(this.base_point.x,this.base_point.y, this.base_point.x ,this.base_point.y, destination_point.x,  destination_point.y, 0, split_length), 20, true, true))
    braids.push(weave_braid_along_line(get_lock_array(this.base_point.x, this.base_point.y, this.base_point.x ,this.base_point.y, destination_point.x,  destination_point.y, 0, split_length), 20, false, true))
  }

}

class ZigZag extends Hairigon {
  constructor(base_point, width, height, braid_type=false, flipped) {
    super(base_point, braid_type)
    this.width = width
    this.height = height
    console.log(flipped)
    this.backbone = this.build_array(base_point.x,base_point.y,width ,height, true, flipped )
    //generate_iterations_from_spline(this.backbone, 16, 40, false, 60, false )
  }

  build_array(x,y,w,h, braid=true, flip = false) {
    let arr =  []
  
    arr.push(new Point(x,y))
    arr.push(new Point(x+w,y))
    arr.push(new Point(x+w,y+h ))
    arr.push(new Point(x,y+h))
    arr.push(new Point(x,y))
    let rect_pts = catmullRomFitting( arr, 1,  (w+h)/32)
  
    let steps = 2
    arr = []
  
      if (braid){
        let split_length = 16
        if (!flip){
          braids.push(weave_braid_along_line(get_lock_array(x + w , y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x - w/2,  y - h + split_length/4, 0, split_length), 20, false))
          braids.push(weave_braid_along_line(get_lock_array(x + w, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x -  w/2,  y - h + split_length/4, 0, split_length), 20, true))
          braids.push(weave_braid_along_line(get_lock_array(x + w, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x -  w/2,  y - h + split_length/4, 0, split_length), 20, true, true))
          braids.push(weave_braid_along_line(get_lock_array(x + w, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x -  w/2,  y - h + split_length/4, 0, split_length), 20, false, true))
        } else {
          braids.push(weave_braid_along_line(get_lock_array(x , y + h , x , y , x+w + split_length/2, y - h, 0, split_length), 20, false))
          braids.push(weave_braid_along_line(get_lock_array(x , y + h, x , y , x+w + split_length/2, y - h, 0, split_length), 20, true))
          braids.push(weave_braid_along_line(get_lock_array(x , y + h, x , y , x+w + split_length/2, y -h, 0, split_length), 20, true, true))
          braids.push(weave_braid_along_line(get_lock_array(x , y + h, x , y , x+w + split_length/2, y -h , 0, split_length), 20, false, true))
        }
  
      }
  
      // RAYS
      //steps = 1
      rect_pts.forEach((point) => {
        for (let i = 0; i <= steps; i++) {
          let t = i / steps;
        let x_s = curvePoint(point.x, point.x, x + w/2, x + w/2, t);
        let y_s = curvePoint(point.y, point.y, y + h/2, y + h/2, t);
        arr.push (new Point(x_s,y_s))
        noStroke();
        beginShape();
        stroke('white');
        circle(x_s, y_s, 5);
        endShape()
        }
      })
  
    rect_pts = catmullRomFitting( arr, 1,  2)
    return rect_pts
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
    let scale_factor = 10
    let invert = false
    braids.forEach((braid) => {
      generate_iterations_from_spline(braid, 20, 100, false, 20, false, true, invert )
      invert = !invert
      scale_factor += .5
    })
    console.log("starting animate braids")
    animate_braids()
  } else {
    setTimeout(animate_splines, 2);
  }

}

function get_lock_array(x1,y1,x_a, y_a, x2,y2, width=0, steps=32) {
  let arr  = []
  for (let i = 0 ; i < steps; i++){
    let t = i / steps;
    let x_s = curvePoint(x_a,x1, 1.5*x2, x1, t);
    let y_s = curvePoint(y_a,y1, 1.5*y2, 5*y2, t);
    arr.push (new Point(x_s,y_s))
    noStroke();
    beginShape();
    stroke('red');
    circle(x_s, y_s, 5);
    endShape()
  }
  return arr
}

function weave_braid_along_line(loc_array, scale = 1, invert = false, offset = false) {
  // here we build a sin wave along a cuve using polyno

  let alernate = invert ? 1 : -1
  let ret_array = []
  for(let i = 0; i < loc_array.length -1; i++) {
    let midpoint = new Point((loc_array[i].x + loc_array[i+1].x) /2, (loc_array[i].y + loc_array[i+1].y) /2)
    let magnitude = Math.sqrt( Math.pow(loc_array[i + 1].x - loc_array[i].x, 2)  + Math.pow(loc_array[i + 1].y - loc_array[i].y, 2))

      if (offset) {
        let mid_point_x = loc_array[i].x - scale * alernate*(loc_array[i+1].x -loc_array[i].x)/ magnitude
        let mid_point_y = loc_array[i].y + scale * alernate*(loc_array[i+1].y -loc_array[i].y)/ magnitude
        ret_array.push(new Point(mid_point_x, mid_point_y))
        ret_array.push(midpoint)

      } else {
        
        let mid_point_x = midpoint.x - scale * alernate*(loc_array[i+1].x -loc_array[i].x)/ magnitude
        let mid_point_y = midpoint.y + scale * alernate*(loc_array[i+1].y -loc_array[i].y)/ magnitude
        // console.log(new Point(mid_point_x, mid_point_y))
        // console.log(midpoint)
        ret_array.push(new Point(loc_array[i].x, loc_array[i].y))
        ret_array.push(new Point(mid_point_x, mid_point_y))
      }
  }

  let sin_spline = catmullRomFitting( ret_array, 1, 4)

  sin_spline.forEach((point) => { 
    noStroke();
    beginShape();
    stroke('green');
    circle(point.x, point.y , 2);
    alernate = alernate * -1
    endShape()   
  })
  return sin_spline
}

function get_rectangle_array(x,y,w,h, braid=true) {
  let arr =  []

  arr.push(new Point(x,y))
  arr.push(new Point(x+w,y))
  arr.push(new Point(x+w,y+h ))
  arr.push(new Point(x,y+h))
  arr.push(new Point(x,y))
  let rect_pts = catmullRomFitting( arr, 1,  (w+h)/32)

  let steps = 5
  arr = []

    if (braid){
      let split_length = 15
      braids.push(weave_braid_along_line(get_lock_array(x + w/2, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x+w + split_length/2, y+h +split_length/2, 0, split_length), 10, false))
      braids.push(weave_braid_along_line(get_lock_array(x + w/2, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x+w + split_length/2, y+h +split_length/2, 0, split_length), 10, true))
      braids.push(weave_braid_along_line(get_lock_array(x + w/2, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x+w + split_length/2, y+h +split_length/2, 0, split_length), 10, true, true))
      braids.push(weave_braid_along_line(get_lock_array(x + w/2, y + h/2 + split_length/4, x +split_length/4, y + split_length/4, x+w + split_length/2, y+h +split_length/2, 0, split_length), 10, false, true))
    }

    // RAYS
    //steps = 1
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

    createCanvas(width, height);
    //background("hsl(57, 100%, 96%)");
    background("#d56d6e");
    noFill();
    //drawRect(100, 100, width - 200, height - 200);
    // middle
    //generate_iterations_from_spline(get_rectangle_array(100,100,width/2 ,height - height/2 ), 16, 40, false, 80, false )
    // // right
    // //generate_iterations_from_spline(get_rectangle_array(100 + width/2 + 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // // top middle
    // generate_iterations_from_spline(get_rectangle_array(100,100 - (height - height/2) - 50,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // // bottom middle
    // generate_iterations_from_spline(get_rectangle_array(100,100 + (height - height/2) +50,width/2 ,height - height/2 ), 16, 40, false, 60, false )
    // // left
    // generate_iterations_from_spline(get_rectangle_array(100 - width/2 - 50,100,width/2 ,height - height/2 ), 16, 40, false, 60, false )

    let s = new ScalpFactory("cornrows", 5, 'left', "small", "braid", "black", "white", "torquoise")

    animate_splines()

    // rays = []
    // splines = []

    // draw_catmul_spline()

}

function generate_iterations_from_spline(spline_array, iterations, randomness, taper=false,color_line=30,  highlight='hsl(180, 96%, 54%)',randomness_taper=false, invert = false ) {
  let iteration = []

  for (let k = 0; k < iterations ; k ++) {
    let spline = []
    for (let j = 0; j < spline_array.length; j ++) {
      if(spline.length){
        if(randomness_taper) {
          //console.log(Math.min(200,Math.max(4*randomness/(spline_array.length - j), 1)))
          spline.push(new Point(((Math.random()-.5)*Math.min(40,Math.max(2*randomness/(spline_array.length - j), 20)) + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((Math.random()-.5)*Math.min(40,Math.max(2*randomness/(spline_array.length - j), 20)) + spline.slice(-1)[0].y + spline_array[j].y )/ 2))
        } else {
          spline.push(new Point(((Math.random()-.5)*randomness + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((Math.random()-.5)*randomness + spline.slice(-1)[0].y + spline_array[j].y )/ 2))          
        }

      }else {
        spline.push(new Point((Math.random()-.5)*20 + spline_array[j].x, spline_array[j].y))
      }

    }
    iteration.push(spline)
    rays.push(new Ray(catmullRomFitting(spline, 1, 10), new Point(0,0),color_line, spline_array, taper, highlight, invert))
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

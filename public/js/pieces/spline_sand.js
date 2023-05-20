// Eyebrows
let eyebrow_spline_point_count = 30
let steps_per_segment = 4

let splines = []
let rays = []
let hair_piece = []
var timeouts = [];

x_offset = 100

var DEFAULT_SIZE = 500;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var DIM = Math.min(WIDTH, HEIGHT);
var M = DIM / DEFAULT_SIZE;

function Point(x, y) {
  this.x = x;
  this.y = y;
}

class Random {
  constructor() {
    this.useA = false;
    let sfc32 = function (uint128Hex) {
      let a = parseInt(uint128Hex.substring(0, 8), 16);
      let b = parseInt(uint128Hex.substring(8, 16), 16);
      let c = parseInt(uint128Hex.substring(16, 24), 16);
      let d = parseInt(uint128Hex.substring(24, 32), 16);
      return function () {
        a |= 0;
        b |= 0;
        c |= 0;
        d |= 0;
        let t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    // seed prngA with first half of tokenData.hash
    this.prngA = new sfc32(tokenData.hash.substring(2, 34));
    // seed prngB with second half of tokenData.hash
    this.prngB = new sfc32(tokenData.hash.substring(34, 66));
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }
  // random number between 0 (inclusive) and 1 (exclusive)
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }
  // random number between a (inclusive) and b (exclusive)
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }
  
  random_choice(list) {
    return list[this.random_int(0, list.length - 1)];
  }

}

let R = new Random();



class Ray {
  constructor(point_array, center_point, lerp_width , rubbing_shape=false, taper=false, highlight=false, invert = false, base_color="black", highlight_color='white'){
    this.point_array = point_array
    this.center_point = center_point
    this.count = 0
    this.rubbing_shape = rubbing_shape
    this.lerp_width = lerp_width
    this.taper = taper
    this.highlight = highlight
    this.done = false
    this.invert = invert

    this.base_color = base_color
    this.highlight_color = highlight_color
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
      }
  }

  draw_next_simple(){
    if(this.count == 0){
      this.count = 32
    }
    if (this.count < this.point_array.length) {
      stroke(color(this.highlight_color));
      circle(this.point_array[this.count].x, this.point_array[this.count].y, .04 * M);
      this.count ++
    } else {
      this.done = true
    }
  }

  out_of_bounds(){
    if(this.count >= this.point_array.length || (this.point_array[this.count].x > DIM || this.point_array[this.count].y > DIM)) {
      return true
    }
    else {
      return false
    }
  }

  draw_next(){
    if(this.out_of_bounds())  {
      this.done = true
    }
    if (this.count < this.point_array.length) {
      //console.log(this.base_color, this.highlight_color)
      let from = color(this.base_color);
      let to = color(this.highlight_color);
      if (this.invert){
        to = color(this.base_color);
        from = color(this.highlight_color);
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
      circle(this.point_array[this.count].x, this.point_array[this.count].y, .04* M);
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
  // number of hairs in a row
  grid_width = null
  
  size_ref = {
    "tiny" : 80 * M,
    "small" : 180* M,
    "medium" : 255* M,
    "large" : 300* M,
  }

  width = WIDTH
  height = HEIGHT
  offset = 1
  




  constructor( hair_type, hair_number, grid_width , hair_shape, hair_size, direction, braid_type, base_color, highlight_color, background_color ) {
  // Box braids or corn rows or zig braids
  this.hair_type = hair_type
  this.hair_number = hair_number
  this.hair_shape = hair_shape
  this.hair_size = hair_size 
  this.direction = direction
  this.braid_type = braid_type
  this.background_color = background_color
  this.base_color = base_color
  this.highlight_color = highlight_color
  this.grid_width = grid_width
  this.hairigon_list = [[]]
  this.make_hair()
  this.push_to_hairigon_list = true
}

  are_you_above_me (current_x, current_size, row){
    let test_x = 0;//this.size_ref[current_size]

    for(let i = 0; i < row.length; i++){
      if (current_x <= (test_x + this.size_ref[row[i].size_txt] ) ) {
        // if the current shape is bigger than the shape above it we space from the next shape
        if (this.size_ref[row[i].size_txt] < this.size_ref[current_size] && (i + 1 != row.length) ) {
          print(row[i].size_txt ,row[i + 1].size_txt,  current_size  )
          if(this.size_ref[row[i].size_txt] > this.size_ref[row[i +1].size_txt]){
            this.push_to_hairigon_list = true
            return this.size_ref[row[i].size_txt] 
          }
          this.push_to_hairigon_list = false
          return this.size_ref[row[i + 1].size_txt]
        }
        this.push_to_hairigon_list = true
        return this.size_ref[row[i].size_txt] 
      } else {
        test_x += this.size_ref[row[i].size_txt]
      }
    }
    this.push_to_hairigon_list = true
    return 0
  }

  biggest_in_row (row) {
    let biggest_size =0;
    if(row){
      row.forEach((box) => { 
        if (this.size_ref[box.size_txt] > biggest_size) {
          biggest_size = this.size_ref[box.size_txt]
        }
      })
    }
    return biggest_size
  }

  what_is_above_me(current_x, current_size) {
    let y_offset = 0
    // for each row I'm not in
    
    for (let i = 0; i < this.hairigon_list.length; i++) {
      let current_biggest = this.biggest_in_row(this.hairigon_list[i-1])
      // if we have room to fit it we shove it in and pop it out the row
      if(this.size_ref[current_size] + y_offset < current_biggest){
        return y_offset
      } else {
        // if(i > 0){
        //   y_offset += current_biggest - this.are_you_above_me(current_x,current_size, this.hairigon_list[i-1])
        // }
        y_offset += this.are_you_above_me(current_x,current_size, this.hairigon_list[i])
      }
    }
    // Figure out if there is a box ave me and add its height to mine
    return y_offset
  }

  make_hair() {
      let x_offset = this.offset
      let y_offset = 0
      let current_row = 0
      for (let i = 0; i < this.hair_number; i++) {
        switch(this.hair_type) {
          case "box":
            if(x_offset > width || y_offset != 0) {
              y_offset = this.what_is_above_me((x_offset % width),this.hair_size[i])
              if(x_offset > width){
                x_offset =  this.offset 
                current_row += 1
                this.hairigon_list.push([])
              }
            }
            let box_point = new Point ( x_offset  ,  this.offset + y_offset )
            if(this.offset + y_offset >= HEIGHT){
              console.log("exiting early")
              return
            }
            x_offset = (this.size_ref[this.hair_size[i]] + x_offset)            
            if (this.hair_size[i] != "none"){
              this.hairigon_list[current_row].push(new Box(box_point, this.braid_type, this.hair_size[i] ,this.hair_size[i], this.base_color, this.highlight_color))
            }
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
  braids = []
  constructor( base_point, braid_type=false, base_color = "black", highlight_color = "white") {
    this.base_point = base_point
    this.braid_type = braid_type
    this.base_color = base_color
    this.highlight_color = highlight_color
    this.braids  = []
  }
}

class Box extends Hairigon {

  size = {
    "tiny" : 50* M,
    "small" : 150* M,
    "medium" : 200* M,
    "large" : 300* M,
  }

  constructor(base_point, braid_type=false, width, height , base_color , highlight_color) {
    super(base_point, braid_type, base_color, highlight_color)
    this.size_txt = width
    this.width = this.size[width]
    this.height = this.size[height]
    this.backbone = this.build_array()
    if(this.size_txt == "tiny"){

      generate_iterations_from_spline(this.backbone, 7, 35, false, 80, false, false, false, base_color, base_color )
    } else {
      generate_iterations_from_spline(this.backbone, 10, 40, false, 80, false, false, false, base_color, base_color )
    }

  }

  rotate_parametric(x , y , theta) {
    // Get the mag of the vector from the center of the object
    // rotate it around zero 
    // add it to the point 
    let v0 = createVector(x, y);
    v0.rotate(theta)
    //return new Point(v0.x , v0.y  )
    return new Point(v0.x  + (this.base_point.x + this.width) / 2, v0.y + (this.base_point.y + this.height)/2 )

  }


  build_array() {
    let arr =  []
    let theta = 0
    let rotated_bp = 0
    let rect_pts = 0
    arr.push(new Point(this.base_point.x,this.base_point.y))
    arr.push(new Point(this.base_point.x+this.width,this.base_point.y))
    arr.push(new Point(this.base_point.x+this.width,this.base_point.y+this.height ))
    arr.push(new Point(this.base_point.x,this.base_point.y+this.height))
    arr.push(new Point(this.base_point.x,this.base_point.y))
    rect_pts = catmullRomFitting( arr, 1,  (this.width+this.height)/32)


    
    rotated_bp = this.rotate_parametric(this.base_point.x+ this.width/2 , this.base_point.y + this.height/2, Math.PI/4)

    let steps = 4 
    print(M)
    arr = []

    let scale_braid = 2 * M
    switch(this.size_txt ){
      case "tiny":
        break;
      case "small":
        scale_braid +=2
        break;
      case "medium":
        scale_braid +=2
    }
      

      if (this.braid_type == "loc"){
        let split_length = 25 * M
        this.braids.push(get_lock_array(rotated_bp.x + this.width/2, rotated_bp.y + this.height/2 - split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, 30, split_length))
        this.braids.push(get_lock_array(rotated_bp.x + this.width/2, rotated_bp.y + this.height/2 - split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, 30, split_length))
        this.braids.push(get_lock_array(rotated_bp.x + this.width/2, rotated_bp.y + this.height/2 - split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, 30, split_length))
        this.braids.push(get_lock_array(rotated_bp.x + this.width/2, rotated_bp.y + this.height/2 - split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, 30, split_length))
        hair_piece.push(this)
      } else if(this.braid_type == "braid") {
        let split_length = 10* M
        this.braids.push(weave_braid_along_line(get_lock_array(this.base_point.x + this.width/2, this.base_point.y + this.height/2 + split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, (this.width == this.size["tiny"]) ? false: false, split_length), scale_braid, false))
        this.braids.push(weave_braid_along_line(get_lock_array(this.base_point.x + this.width/2, this.base_point.y + this.height/2 + split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, (this.width == this.size["tiny"]) ? false: false, split_length),scale_braid, true))
        this.braids.push(weave_braid_along_line(get_lock_array(this.base_point.x + this.width/2, this.base_point.y + this.height/2 + split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, (this.width == this.size["tiny"]) ? false: false, split_length), scale_braid, true, true))
        this.braids.push(weave_braid_along_line(get_lock_array(this.base_point.x + this.width/2, this.base_point.y + this.height/2 + split_length/4, rotated_bp.x +split_length/4, rotated_bp.y + split_length/4, rotated_bp.x+this.width + split_length/2, rotated_bp.y+this.height +split_length/2, (this.width == this.size["tiny"]) ? false: false, split_length), scale_braid, false, true))
        hair_piece.push(this)
      }
  
      // RAYS

      rect_pts.forEach((point) => {
        for (let i = 0; i <= steps; i++) {
          let t = i / steps;
        let x_s = curvePoint(point.x, point.x, this.base_point.x + this.width/2, this.base_point.x + this.width/2, t);
        let y_s = curvePoint(point.y, point.y, this.base_point.y + this.height/2, this.base_point.y + this.height/2, t);
        arr.push (new Point(x_s,y_s))
        // noStroke();
        // beginShape();
        // stroke('white');
        // circle(x_s, y_s, 5);
        // endShape()
        }
      })
    let cat_step = 1
    switch(this.size_txt ){
      case "tiny":
        break;
      case "small":
        cat_step +=2
        break;
      case "medium":
        cat_step +=3
    }
    
    rect_pts = catmullRomFitting( arr, 1,  cat_step)
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
    if (ray.done == false) {
      ray.draw_next()
      done = false
    }
  });
  if(~done){
    setTimeout(animate_braids, .01);
    setTimeout(animate_braids, .02);
  }

}

function animate_splines() {

  let done = true
  noStroke();
  beginShape();
  rays.forEach((ray) => {
    ray.draw_next_simple()
    if (ray.done == false) {
      done = false
    }
  });
  endShape()
  if(done) {
    timeouts.forEach((timeout) => {
      clearTimeout(timeout)
    })
    rays = []
    splines = []
    let scale_factor = 10
    let invert = false
    hair_piece.forEach((piece) => {
      piece.braids.forEach((braid)=> {
        if(piece.braid_type == "braid"){
          console.log("starting animate braids")
          let scale_braid = 5 * M
          switch(piece.size_txt ){
            case "tiny":
              scale_braid = 5 * M
              break;
            case "small":
              scale_braid = 10* M 
              break;
            case "medium":
              scale_braid = 20*M
          }
            
          generate_iterations_from_spline(braid, 20, 50*M, false, 20, false, true, invert, piece.base_color, piece.highlight_color,scale_braid )
        } else if (piece.braid_type == "loc"){
          console.log("starting animate loc")
          generate_iterations_from_spline(braid, 30, 200*M, false, 20, false, true, invert, piece.base_color, piece.highlight_color,scale_braid )
        }

        invert = !invert
        scale_factor += .5

      })
    })

    animate_braids()
  } else {
    timeouts.push(setTimeout(animate_splines, .1));
    timeouts.push(setTimeout(animate_splines, .1));

  }

}

function get_lock_array(x1,y1,x_a, y_a, x2,y2, small=false, steps=32) {
  let arr  = []
  let x_s , y_s = 0

  for (let i = 0 ; i < steps; i++){
    let t = i / steps;
    if(small){
      x_s = curvePoint(x_a,x1, 1.5*x2, x1, t);
      y_s = curvePoint(y_a,y1, 1.5*y2, 5*y2, t);
      if (i > steps /4){
        return arr
      }
    } else {
      x_s = curvePoint(x_a,x1, 1.15*x2, x1, t);
      y_s = curvePoint(y_a,y1, 1.15*y2, 3*y2, t);
    }

    arr.push (new Point(x_s,y_s))
    // noStroke();
    // beginShape();
    // stroke('red');
    // circle(x_s, y_s, 5);
    // endShape()
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
        ret_array.push(new Point(loc_array[i].x, loc_array[i].y))
        ret_array.push(new Point(mid_point_x, mid_point_y))
      }
  }

  let sin_spline = catmullRomFitting( ret_array, 1, 4)

  // sin_spline.forEach((point) => { 
  //   noStroke();
  //   beginShape();
  //   stroke('green');
  //   circle(point.x, point.y , 2);
  //   alernate = alernate * -1
  //   endShape()   
  // })
  return sin_spline
}



class Pallette {
  background_ = null
  hair_ = null
  braid_1_ = null
  braid_2_ = null

  constructor(background, hair, braid_1, braid_2){
    this.background_ = background
    this. hair_ = hair
    this.braid_1_ = braid_1
    this.braid_2_ = braid_2
  }
}

let pallettes = {
  "fantasticfox" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  //"grandbudapest" : new Pallette("#f94b55","#481212", "#cb5d28", "#ecad66" ),
  //"moonrise1" : new Pallette("#8a863c", "#eda6ae", "#f6cf66","#75cbdc" ),
  //"moonrise1a" : new Pallette("#edda5a","#c29e0c", "#cbcbc9", "#191f15" ),
  //"royal1" : new Pallette("#788c93","#b92010", "#f8ecc6", "#d4712e" ),
  //"moonrise2" : new Pallette("#677c75","#b3692c", "#c0ba7e", "#1f1a17" ),

  // "cavalcanti" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  // "royal2" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  // "grandbudapest2" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  // "moonrise3" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  // "chevalier" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  // "zissou" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" ),
  // "darjeeling" : new Pallette("#d47821","#d9cd07", "#3a9bbb", "#a30119" )
}

function get_pallettes() {
  var keys = [];
  for (var key in pallettes) {
    if (pallettes.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys
}

let piece_data

function renderPiece(){
  splines = []
  rays = []
  hair_piece = []
  print(piece_data["pallette"])
  background(pallettes[piece_data["pallette"]].background_);
  noFill();
  window.addEventListener("resize", resizePiece);

  let direction = null

  let s = new ScalpFactory("box", piece_data["box_count"], 3, 'down', piece_data["sizes"],direction,  "braid", pallettes[piece_data["pallette"]].braid_2_ , pallettes[piece_data["pallette"]].braid_1_, pallettes[piece_data["pallette"]].braid_2_)
  //new ScalpFactory("box", 14, 3, 'down', size, "braid", "#0d235f", "#b0cdcb", "#d56d6e")
  //let s = new ScalpFactory("box", 1, 'down', "small", "loc", "#0d235f", "#b0cdcb", "torquoise")

  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
  animate_splines()
}

function resizePiece(){
  timeouts.forEach((timeout) => {
    clearTimeout(timeout)
  })
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight ;
  DIM = Math.min(WIDTH, HEIGHT);
  M = DIM / DEFAULT_SIZE
  print(DIM)
  print(M)
  resizeCanvas(DIM,  DIM, true)
  renderPiece()
}

function calculateFeatures(tokenData) {
  /**
   * Implement me. This function should return a set of features in the format of key-value pair notation.
   *
   * For example, this should return `{"Palette": "Rosy", "Scale": "Big", "Tilt": 72}` if the desired features for a mint were:
   * - Palette: Rosy
   * - Scale: Big
   * - Tilt: 72
   */
  let hash = tokenData.hash;
  let box_number = R.random_int(10, 50)
  let sizes = []
  if(R.random_dec() < .1) {
    box_number = 50
    for(let i = 0; i < box_number; i++){
      sizes.push("tiny")
    }
  } else {
    for (let i = 0; i < box_number; i++){
      let weighted_choice =  R.random_dec()
      if(weighted_choice < 2/box_number){
        sizes.push("medium")
      } else if(weighted_choice < 1/4){
        sizes.push("small")
      } else {
        sizes.push("tiny")
      }
  
    }
  }

  let pallet_choice = get_pallettes()

  

  return {"box_count": box_number, "sizes": sizes, "pallette": R.random_choice(pallet_choice)}
}

function setup() {


    piece_data = calculateFeatures(tokenData)
    print(tokenData)
    print (piece_data)
    createCanvas(DIM, DIM);
    renderPiece()
    filter(BLUR, 3);
}

function generate_iterations_from_spline(spline_array, iterations, randomness, taper=false,color_line=30,  highlight='hsl(180, 96%, 54%)',randomness_taper=false, invert = false, base_color="black", highlight_color="black", min_randomness_taper=10 ) {
  let iteration = []
  for (let k = 0; k < iterations ; k ++) {
    let spline = []
    for (let j = 0; j < spline_array.length; j ++) {
      if(spline.length){
        if(randomness_taper) {
          spline.push(new Point(((R.random_dec()-.5)*Math.min(300*M,Math.max(randomness/(spline_array.length - j), min_randomness_taper*M)) + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((R.random_dec()-.5)*Math.min(300*M,Math.max(randomness/(spline_array.length - j), min_randomness_taper*M)) + spline.slice(-1)[0].y + spline_array[j].y )/ 2))
        } else {
          spline.push(new Point(((R.random_dec()-.5)*randomness + spline.slice(-1)[0].x + spline_array[j].x )/ 2, ((R.random_dec()-.5)*randomness + spline.slice(-1)[0].y + spline_array[j].y )/ 2))          
        }

      }else {
        spline.push(new Point((R.random_dec()-.5)*20 + spline_array[j].x, spline_array[j].y))
      }

    }
    iteration.push(spline)
    rays.push(new Ray(catmullRomFitting(spline, 1, 10), new Point(0,0),color_line, spline_array, taper, highlight, invert, base_color,highlight_color))
  }
  

}





function draw_shape(array) {

  beginShape();
  array.forEach((points) => {
    point(points.x, points.y)
  });
  endShape()

}

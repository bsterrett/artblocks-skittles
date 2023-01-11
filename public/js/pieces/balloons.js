let camera, scene, renderer;
let plane;
let pointer, raycaster, isShiftDown = false;

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;


// randomness;
let dots_per_circle ;
let rotation ;
let initial_diameter ;
let final_diameter;

// constants
let sphere_count = 100;
let color = 0

let objects = []

function randomness () {
    dots_per_circle = Math.floor(random(1,10))
    rotation = Math.PI * random()
    initial_diameter = 100 * random(1, 1)
    final_diameter = 10 * random(1, 1)
    return dots_per_circle , rotation , initial_diameter ,final_diameter
}



function draw_spheres(scene, z_factor, x_factor, color_line, offset_z=0, offset_y=0, offset_x=0,invert=false) {
    // should just replace the sheres by the actual geometry math because what I am doing is helariously cost inefficient
    let curve = new THREE.SplineCurve( [])
    dots_per_circle , rotation , initial_diameter ,final_diameter = randomness ()
    radius_shift_per_sphere = (initial_diameter - final_diameter) / sphere_count
    for (let i = 0; i < sphere_count ; i++){
        const geometry_s = new THREE.SphereGeometry( initial_diameter - radius_shift_per_sphere*i, 32, 16 , Math.PI, Math.PI, Math.PI/2);
        const material = new THREE.MeshBasicMaterial( { color: `rgba(${(color + 20*i) % 255 }, ${(color + 20*i)% 255 }, ${(color + 20*i)% 255 })`,
        side: THREE.DoubleSide } );
        const sphere = new THREE.Mesh( geometry_s, material );
        sphere.position.x -= (initial_diameter - radius_shift_per_sphere*i*i*.009)*x_factor[i % 4]
        sphere.position.z += (initial_diameter - radius_shift_per_sphere*i*i*.009)*z_factor[i % 4]
        if (invert){
            sphere.position.y += (initial_diameter - radius_shift_per_sphere*i)*-1
        } else {
            sphere.position.y += (initial_diameter - radius_shift_per_sphere*i)
        }
        curve.points.push(new THREE.Vector3(sphere.position.x + offset_x, -sphere.position.y +initial_diameter + offset_y, sphere.position.z + offset_z))

    
        const geometry_l = new THREE.BufferGeometry().setFromPoints( curve.points );
        const material_l = new THREE.LineBasicMaterial( { color: color_line } );

        // Create the final object to add to the scene
        const splineObject = new THREE.Line( geometry_l, material_l );
        scene.add( splineObject );

    }
}

function make_balloon(vector, color){
    draw_spheres(scene,  [1,1,-1,-1], [-1,1,1,-1], color,vector.x,vector.y ,vector.z , false)
    draw_spheres(scene,  [1,-1,-1,-1], [-1,1,1,-1], color,vector.x,vector.y ,vector.z , false)
    draw_spheres(scene,  [1,1,-1,-1], [-1,1,1,-1], color,vector.x,vector.y-200 ,vector.z, true)
    draw_spheres(scene,   [1,-1,-1,-1], [-1,1,1,-1], color,vector.x,vector.y-200 ,vector.z, true)
 }


function setup() {

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 0, 3000, 0 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color(  'white' );

    
    make_balloon(new THREE.Vector3(180,300,100), 0x000000)
    make_balloon(new THREE.Vector3(90,400,-60), 0x000000)
    make_balloon(new THREE.Vector3(0,250,100), 0x000000)
    make_balloon(new THREE.Vector3(-50,300,-50), 0x000000)


    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( render )
    document.body.appendChild( renderer.domElement );

    document.addEventListener( 'pointermove', onPointerMove );

}

function onPointerMove( event ) {

    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( mouseY - camera.position.y ) * 0.05;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );

}


function render() {
    camera.lookAt( scene.position );
    renderer.render( scene, camera );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}
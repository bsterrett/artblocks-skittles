// import * as THREE from 'three';

let container;

let camera, scene, renderer;

let mouseX = 0, mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let skittleGeometry;

const skittleRadius = 50;
const skittlePallet = [
    [ 230, 72,  8  ],
    [ 241, 190, 2  ],
    [ 4,   130, 7  ],
    [ 68,  19,  73 ],
    [ 192, 4,   63 ],
];

let skittles = [];

const gravity = true;
const gravitational_acceleration = [0, -1, 0];

init();

function setColors( frame ) {
    color = new THREE.Color();
    positions1 = geometry1.attributes.position;
    positions2 = geometry2.attributes.position;
    positions3 = geometry3.attributes.position;
    colors1 = geometry1.attributes.color;
    colors2 = geometry2.attributes.color;
    colors3 = geometry3.attributes.color;

    for ( let i = 0; i < position_count; i ++ ) {

        hue_offset = (frame % 10)

        hue1 = (( positions1.getY( i ) / radius + 1 ) / 2);
        // hue1 += (frame % 10) / 10;
        // hue1 %= 1;
        // console.log(hue1);
        color.setHSL( hue1 , 1.0, 0.5 );
        colors1.setXYZ( i, color.r, color.g, color.b );

        color.setHSL( 0, ( positions2.getY( i ) / radius + 1 ) / 2, 0.5 );
        colors2.setXYZ( i, color.r, color.g, color.b );

        color.setRGB( 1, 0.8 - ( positions3.getY( i ) / radius + 1 ) / 2, 0 );
        colors3.setXYZ( i, color.r, color.g, color.b );

    }
}

function makeNewSkittleColor( paletteIndex ) {
    return new THREE.Color( skittlePallet[paletteIndex][0], skittlePallet[paletteIndex][1], skittlePallet[paletteIndex][2] );
}

function makeNewSkittle( paletteIndex, x, y, z, xVel, yVel, zVel, xRot, yRot, xRotVel, yRotVel) {
    const clonedGeometry = skittleGeometry.clone();
    skittleColor = makeNewSkittleColor( paletteIndex );
    console.log(skittleColor);
    const newMaterial = new THREE.MeshPhongMaterial( {
        color: skittleColor,
        flatShading: false,
        vertexColors: false,
        shininess: 0
    } );
    // const newMaterial = new THREE.MeshNormalMaterial;
    // const wireframeMaterial = new THREE.MeshBasicMaterial( { color: skittleColor.getHex(), wireframe: true, transparent: true } );
    const skittleMesh = new THREE.Mesh( clonedGeometry, newMaterial );
    // let wireframe = new THREE.Mesh( clonedGeometry, wireframeMaterial );
    // skittleMesh.add( wireframe );
    skittleMesh.position.x = x;
    skittleMesh.position.y = y;
    skittleMesh.position.z = z;
    skittleMesh.rotation.x = xRot;
    skittleMesh.rotation.y = yRot;
    skittleMesh.xVel = xVel;
    skittleMesh.yVel = yVel;
    skittleMesh.zVel = zVel;
    skittleMesh.xRotVel = xRotVel;
    skittleMesh.yRotVel = yRotVel;

    return skittleMesh;
}

function init() {

    container = document.body;

    camera = new THREE.PerspectiveCamera( 20, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1800;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    // const light1 = new THREE.DirectionalLight( 0xffffff );
    // light1.position.set( 0, 0, 1 );
    // scene.add( light1 );

    const light2 = new THREE.DirectionalLight( 0x020202 );
    light2.position.set( 0, 100, 300 );
    scene.add( light2 );

    const canvas = document.createElement( 'canvas' );
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext( '2d' );
    const gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0.1, 'rgba(210,210,210,1)' );
    gradient.addColorStop( 1, 'rgba(255,255,255,1)' );

    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );

    skittleGeometry = new THREE.IcosahedronBufferGeometry( skittleRadius, 1 );
    skittleGeometry.applyMatrix4(new THREE.Matrix4().makeScale( 1, 0.7, 1 ));
    
    for (i = 0; i < 5; i++) {
        s = makeNewSkittle( i, -200 + (100*i), 0, 0, 0, (6*i), 0, 0, 0, (10*i), (15*i) );
        skittles.push(s);
        scene.add(s);
    }

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setAnimationLoop( animation )
    container.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove );

    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event ) {

    mouseX = ( event.clientX - windowHalfX );
    mouseY = ( event.clientY - windowHalfY );

}

function updateSkittlePositions() {

    for (i = 0; i < skittles.length; i++ ) {
        skittle = skittles[i];
        skittle.position.x += skittle.xVel;
        skittle.position.y += skittle.yVel;
        skittle.position.z += skittle.zVel;
    }

}

function updateSkittleVelocities() {

    for (i = 0; i < skittles.length; i++ ) {
        skittle = skittles[i];
        skittle.xVel += gravitational_acceleration[0];
        skittle.yVel += gravitational_acceleration[1];
        skittle.zVel += gravitational_acceleration[2];
    }

}

function updateSkittleRotations() {

    for (i = 0; i < skittles.length; i++ ) {
        skittle = skittles[i];
        skittle.rotation.x += skittle.xRotVel;
        skittle.rotation.y += skittle.yRotVel;
    }

}

//

function animation( frame ) {

    updateSkittlePositions();
    updateSkittleRotations();
    if ( gravity ) {
        updateSkittleVelocities();
    }

    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

    camera.lookAt( scene.position );

    renderer.render( scene, camera );

}
import * as THREE from 'https://threejs.org/build/three.module.js';

import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';

import { STLLoader } from 'https://threejs.org/examples/jsm/loaders/STLLoader.js';

import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'

import { Reflector } from 'https://threejs.org/examples/jsm/objects/Reflector.js';

import { TransformControls } from 'https://threejs.org/examples/jsm/controls/TransformControls.js';

import gsap from 'https://cdn.skypack.dev/gsap';

import $ from 'https://cdn.skypack.dev/jquery';

class Draggable extends EventTarget {

    constructor(element, options) {
        super();
        this.position = {
            current: new THREE.Vector2(),
            start: new THREE.Vector2(),
            delta: new THREE.Vector2(),
            previous: new THREE.Vector2(),
            drag: new THREE.Vector2(),
        };

        this.options = Object.assign({
            convert: true
        }, options || {});

        this.element = element;
        this.touch = null;

        this.drag = {

            start: (event) => {

                if (event.type == 'mousedown' && event.which != 1) return;
                if (event.type == 'touchstart' && event.touches.length > 1) return;

                this.setCurrentPosition(event);

                this.position.start = this.position.current.clone();
                this.position.delta.set(0, 0);
                this.position.drag.set(0, 0);

                this.touch = (event.type == 'touchstart');

                this._trigger('drag:start')

                window.addEventListener((this.touch) ? 'touchmove' : 'mousemove', this.drag.move, false);
                window.addEventListener((this.touch) ? 'touchend' : 'mouseup', this.drag.end, false);
            },

            move: (event) => {


                this.position.previous = this.position.current.clone();


                this.setCurrentPosition(event);

                this.position.delta = this.position.current.clone().sub(this.position.previous);
                this.position.drag = this.position.current.clone().sub(this.position.start);


                this._trigger('drag:move')

            },

            end: (event) => {

                this.setCurrentPosition(event);

                this._trigger('drag:end')

                window.removeEventListener((this.touch) ? 'touchmove' : 'mousemove', this.drag.move, false);
                window.removeEventListener((this.touch) ? 'touchend' : 'mouseup', this.drag.end, false);

            },

        };

        this.enable();

        return this;

    }

    enable() {

        this.element.addEventListener('touchstart', this.drag.start, false);
        this.element.addEventListener('mousedown', this.drag.start, false);

        return this;

    }

    disable() {

        this.element.removeEventListener('touchstart', this.drag.start, false);
        this.element.removeEventListener('mousedown', this.drag.start, false);

        return this;

    }

    setCurrentPosition(event) {

        const dragEvent = event.touches
            ? (event.touches[0] || event.changedTouches[0])
            : event;

        this.position.current.set(dragEvent.pageX, dragEvent.pageY);
        if (this.options.convert) {
            this.convertPosition(this.position.current)
        }

    }

    convertPosition(position) {

        position.x = (position.x / this.element.offsetWidth) * 2 - 1;
        position.y = - ((position.y / this.element.offsetHeight) * 2 - 1);

        return position;

    }

    _trigger(name) {
        this.dispatchEvent(new CustomEvent(name, { detail: this.position }));
    }

}

var container, stats, controls;

var camera, cameraTarget, scene, renderer;

var world = {
    width: 9,
    height: 7.2
}

var colors = {
    C: 0x999999, // core piece
    D: 0xfff7ff, // white
    U: 0xffff41, // yellow
    R: 0xff1836, // red
    F: 0x00b6ff, // blue
    L: 0xffA500, // orange
    B: 0x00fd55, // green
}


function move(objs, to) {
    // #attach removes the object from its existing parent, thus modifying its children. 
    // therefore, if `objs` is the children array, it will be modified during iteration.
    // so must copy it using #slice 
    objs.slice().forEach(o => to.attach(o))
}

let needRender = false;

init();
render();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 1000 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd1d5db);
    //scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

    // Lights
    var ambient = new THREE.AmbientLight( 0xffffff, 0.7)
    var front = createShadowedLight(6, 6, 6, 0xeeeece, 0.35)
    var back = createShadowedLight(-6, 0, -4, 0xeeeece, 0.35)

    var lights = new THREE.Group()
    lights.add(ambient, front, back)
    window.lights = lights;

    scene.add(lights)

    
    // mirror
    var geometry = new THREE.PlaneBufferGeometry(3, 3);
    var leftMirror = new Reflector( geometry, {
        clipBias: 0.003,
        textureWidth: window.innerWidth * window.devicePixelRatio,
        textureHeight: window.innerHeight * window.devicePixelRatio,
        color: 0x777777
    } );
    leftMirror.position.set(-3.2, 1.2, 1.4);
    leftMirror.rotation.y = Math.PI / 2;
    leftMirror.name = "mirror"
    scene.add( leftMirror );
    
    let backMirror = leftMirror.clone
    


    // renderer

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.outputEncoding = THREE.sRGBEncoding;

    //renderer.shadowMap.enabled = true;

    container.appendChild( renderer.domElement );

    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.rotateSpeed = 0.2;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    // controls.autoRotate = true;
    controls.autoRotateSpeed = .75;
    controls.addEventListener('change', _ => animate());
    window.controls = controls ;
    controls.enabled = false;


    let transform = new TransformControls(camera, renderer.domElement );
    transform.addEventListener( 'change', animate );
    scene.add(transform)

    // stats

    stats = new Stats();
    container.appendChild( stats.dom );
    
    window.addEventListener( 'resize', onWindowResize, false );

    onWindowResize();

    let tl = gsap.timeline({onUpdate: animate});

    var loader = new STLLoader();

    async function load(url) {
        return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        })
    };

    function cssColor(str){
        var ctx = document.createElement("canvas").getContext("2d");
        ctx.fillStyle = str;
        return ctx.fillStyle;
    }
    Promise.all(['resources/corner.stl', 'resources/edge.stl', 'resources/center.stl', 'resources/core.stl'].map(load)).then(([corner_g, edge_g, center_g, core_g]) => {
        corner_g.scale(0.5, 0.5, 0.5);
        edge_g.scale(0.5, 0.5, 0.5);
        center_g.scale(0.5, 0.5, 0.5);
        core_g.scale(0.5, 0.5, 0.5);

        let core = new THREE.Mesh(core_g);
        core.name = 'core'

                            
        let face = new THREE.Group();

        let center = new THREE.Mesh(center_g);
        center.name = 'center'

        let corner_facelet = new THREE.Mesh(corner_g);
        corner_facelet.name = 'corner_facelet'

        let edge_facelet = new THREE.Mesh(edge_g);
        edge_facelet.name = 'edge_facelet'

        face.add(center)

        /*
        let drag_g = new THREE.PlaneBufferGeometry(1,1)
        drag_g.computeFaceNormals();
    
        let dragTarget = new THREE.Mesh(drag_g, transparent_m);
        dragTarget.name = "dragTarget";
        dragTarget.position.set(0, 0, -0.6)
        dragTarget.rotation.set(0, Math.PI, 0) // only one site intersects with raycaster
        // center.add(dragTarget);
        
        // corner_facelet.add(dragTarget.clone())

        // edge_facelet.add(dragTarget.clone())
        */

        for (let i = 0; i < 4; i++) {                        
            let corner_facelet2 = corner_facelet.clone()
            let edge_facelet2 = edge_facelet.clone()
            corner_facelet2.position.set(1, 1, 0);
            edge_facelet2.position.set(0, 1, 0);
            face.attach(corner_facelet2)
            face.attach(edge_facelet2)
            face.rotateZ(Math.PI/2)
        }

        let start = new THREE.Vector3(0, 0, -1)
        face.position.copy(start)
        let faces = [];
        for(let i = 0; i < 3; i++) {
            for (let s = -1; s < 2; s += 2) {
                let axis = new THREE.Vector3().setComponent(i, s);
                let q = new THREE.Quaternion().setFromUnitVectors(start, axis);
                let another = face.clone()
                another.quaternion.copy(q);
                another.position.copy(axis)
                faces.push(another)
            }
        }
        let cube = new THREE.Group();
        cube.add(...faces)
        cube.add(core)
        scene.add(cube)

        // attach to scene so it updates position to world
        faces.forEach(face => move(face.children, cube ))
        cube.remove(...faces)
        window.cube = cube;

        let pieces = new Array(3).fill().map(_ => new Array(3).fill().map(_ => new Array(3).fill().map(_ => new THREE.Group())))

        cube.children.slice().forEach(facelet => {
            if (facelet.type == "Group")  {
                return;
            }
            facelet.position.round();
            // position is -1,0,1
            let piece = pieces[facelet.position.x + 1][facelet.position.y + 1][facelet.position.z + 1]

            piece.position.set(facelet.position.x, facelet.position.y, facelet.position.z);
            cube.add(piece) // will not really add multiple times (otherwise can use pieces.flat().forEach...)

            piece.attach(facelet)
            piece.name = facelet.name


        })

        let coder = new THREE.Vector3(1, 2, 3); // to code faces
        let direction = new THREE.Vector3()
        window.meshes = [];
        let dragTargets = []
        cube.traverse(mesh => {
            if ( mesh instanceof THREE.Mesh) {
                if (mesh.name == 'dragTarget') {
                    dragTargets.push(mesh)
                    return;
                }
                mesh.material =  new THREE.MeshPhysicalMaterial({metalness:0, roughness: 0.7, reflectivity: 0.5, transmission: 0.5})
                mesh.updateWorldMatrix(true);
                mesh.getWorldDirection(direction).round()
                let face = direction.dot(coder);
                if (mesh.name == 'core') face = 0;
                let color = {0: colors.C, '1': colors.L, '-1': colors.R, '2': colors.D, '-2': colors.U, '3': colors.B, '-3': colors.F }[face]
                mesh.material.color.set(color)
                window.meshes.push(mesh)

            }
        })

        const helper_m = new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff } );
        //const helper_m = new THREE.MeshBasicMaterial( { depthWrite: true, transparent: false, opacity: 1, side: THREE.DoubleSide, color: 0x0033ff } );

        let helpers = new THREE.Group()
        helpers.name = "helpers"

        let rotation = new THREE.Group();
        rotation.name = "rotation";
        helpers.add(rotation)

        let envelope =  new THREE.Mesh(
            new THREE.BoxBufferGeometry(3, 3, 3),
            helper_m,
        );
        envelope.name = "envelope"
        helpers.add(envelope)

        let dragged =  new THREE.Mesh(
            new THREE.PlaneBufferGeometry(200, 200),
            helper_m
        );
        dragged.name = "dragged"
        helpers.add(dragged);

        scene.add(helpers);

        const raycaster = new THREE.Raycaster();
        function intersect(position, object) {
            raycaster.setFromCamera(position, camera);

            let multiple = Array.isArray(object)
            const intersect = (multiple)
                ? raycaster.intersectObjects(object)
                : raycaster.intersectObject(object);

            return (intersect.length > 0) ? intersect[0] : false;
        }

        Array.prototype.minBy = function (fn) { return this.extremumBy(fn, Math.min); };

        Array.prototype.maxBy = function (fn) { return this.extremumBy(fn, Math.max); };

        Array.prototype.extremumBy = function (pluck, extremum) {
            return this.reduce(function (best, next) {
                var pair = [pluck(next), next];
                if (!best) {
                    return pair;
                } else if (extremum.apply(null, [best[0], pair[0]]) == best[0]) {
                    return best;
                } else {
                    return pair;
                }
            }, null)[1];
        }

        function roundAngle(x) {
            const half = Math.PI / 2
            return Math.round( x  / half ) * half;
        }

        function roundRotation(rotation) {
            return rotation.set(roundAngle(rotation.x), roundAngle(rotation.y), roundAngle(rotation.z))
            
        }

        let draggable = new Draggable(renderer.domElement) 
        
        // done -> selecting -> rotating -> finishing -> done 
        //                                            - (drag start) -> selecting_next
        // selecting_next - (finish animation) -> selecting 

        let drag = {state: 'done'}

        tl.then(_ => {
            drag.tween = undefined;
        })
        let moves = []
        function rotateGroup(to, duration, no_undo, onComplete2) {
            to = roundAngle(to)

            if (to != 0 && no_undo == undefined) {
                let axis = [0,1,2].maxBy(i => Math.abs(drag.axis.getComponent(i)))
                let layer = rotation.children.length == 27 ? undefined : (rotation.children[0].position.getComponent(axis) + 1);
                let counter = to > 0;
                moves.push({axis: drag.axis, layer: layer, turns: Math.round(to / (Math.PI / 2))})
            }

            let onComplete = _ => {
                let selected = rotation.children.slice()
                move(rotation.children, cube)
                selected.forEach(piece => {
                    roundRotation(piece.rotation)
                    piece.position.round();
                });
                if (drag.state == 'preparing_next') {
                    drag.state = 'preparing'
                } else {
                    drag.state = 'done'
                }

                if(onComplete2) onComplete2()

            }

            if (duration === 0 && drag.state == "rotating") {
                rotation.rotateOnAxis(drag.axis, to)
                animate();
                onComplete();
                return;
            }

            let proxy = {
                target: to,
                current: drag.angle,
                previous: drag.angle
            }
            if (duration === undefined) {
                duration = Math.abs(proxy.target - proxy.current) / 3; // full Math.PI/2 should take 0.5 seconds.
            } 

            let tweener = tl;
            if (drag.tween !== undefined) {
                tweener = drag.tween   
            }

            drag.tween = tweener.to(proxy, duration, {
                current: proxy.target,
                ease: "power3.out",
                onUpdate: _ => {
                    const delta = proxy.current - proxy.previous
                    rotation.rotateOnAxis(drag.axis, delta)
                    proxy.previous = proxy.current
                },
                onComplete: onComplete
            })
    
        }

        $(draggable).on('drag:start', event => {
            if (['selecting', 'rotating'].includes(drag.state)) return;
            let intersection = intersect(event.target.position.current, envelope)

            /** 
             * cube rotation: if the intersection is on the center piece, then it's a cube rotation.
             * 
             * alternative: if the intersection is empty, position dragged facing the camera (rotated 45 on y)
             * then any 'x' movement in dragged is rotating the cube on its y axis, and 'y' movement on the right is 
             * rotating on z (so the right hand side goes up/down) and 'y' movement on left is rotation on 'x'. right
             * and left are determined based on being above / below the half width of the screen
             */
            let meshes = cube.children.flatMap(c => c.type == 'Group' ? c.children : [c]); // intersection doesn't work on groups
            let mesh = intersect(event.target.position.current, meshes).object
            if (mesh == undefined){
                return;
            }
            drag.piece = mesh.parent;
            drag.current = dragged.worldToLocal(intersection.point.clone())
            drag.total = new THREE.Vector3();
            drag.normal = intersection.face.normal
            drag.momentum = []

            envelope.attach(dragged);
            dragged.rotation.set( 0, 0, 0 ); 
            dragged.position.set( 0, 0, 0 );
            dragged.lookAt(intersection.face.normal.round());
            dragged.translateZ(1.5)
            dragged.updateMatrixWorld();

            scene.attach(dragged);
            drag.state = (drag.state == 'finishing') ? 'selecting_next' : 'selecting'
        }).on('drag:move', event => {
            if (['done', 'finishing'].includes(drag.state)) return;
            let intersection = intersect(event.target.position.current, dragged);

            /* trag target local system */
            const point = dragged.worldToLocal(intersection.point.clone());
            drag.delta = point.clone().sub(drag.current).setZ(0); // only measure in the xy plane (that is facing the camera)
            drag.total.add(drag.delta);
            drag.current = point;
            const time = Date.now();
            drag.momentum = drag.momentum.filter( moment => time - moment.time < 500 );
            let delta = drag.delta
            drag.momentum.push( { delta, time } )
            if (drag.state == 'selecting' && drag.total.length() > 0.03) {
                // choose an axis
                drag.main = [0,1,2].maxBy(i => Math.abs(drag.total.getComponent(i)))
                let direction = new THREE.Vector3();
                direction.setComponent(drag.main, 1);
                direction = dragged.localToWorld(direction).sub(dragged.position); // relative to dragged in world 
                direction = envelope.worldToLocal(direction).round();

                drag.axis = direction.cross(drag.normal).negate();
                drag.rotated = drag.piece.name == 'center' ? cube.children : cube.children.filter(p => p.position.dot(drag.axis) == drag.piece.position.dot(drag.axis));
                rotation.rotation.set(0,0,0)
                move(drag.rotated, rotation)
                drag.angle = 0;
                drag.state = 'rotating'
            } else if (drag.state == "rotating") { // flipping
                let delta = drag.delta.getComponent(drag.main) / 3;
                rotation.rotateOnAxis(drag.axis, delta)
                drag.angle += delta;
                animate();
            }
        }).on('drag:end', event => {
            if (['done', 'selecting'].includes(drag.state)) {// small touch not enough to create a rotation
                drag.state = 'done'
                return;
            }

            if (drag.state == 'selecting_next') {
                drag.state = 'finishing'
                return;
            }
            
            drag.state = 'finishing'

            const time = Date.now();
            drag.momentum = drag.momentum.filter( moment => time - moment.time < 500 );
            let momentum = drag.momentum.reduce((acc, cur, idx) => {
                return acc.add( cur.delta.multiplyScalar( idx / drag.momentum.length ) );
            }, new THREE.Vector2())

            if( Math.abs( momentum ) > 0.05 && Math.abs( drag.angle ) < Math.PI / 2 ) {
                drag.angle += Math.sign(drag.angle) * ( Math.PI / 4 )
            }

            rotateGroup(roundAngle(drag.angle))
            
        })
        

        let rotationQueue = []
        // TODO: proper action queuing. Incl. replacing 'preparing_next. may require helpers per rotation action (or do the calculation with matrixes)'
        // need to support aborting (cleanup queue)
        function rotate(axis, turns, layer, no_undo) {
            if (drag.state == 'selecting') return;
            if (drag.state == 'rotating') {
                rotationQueue.push({axis: axis, turns: turns, layer: layer, no_undo: no_undo});
                return;
            }

            rotation.rotation.set(0,0,0)
            drag.state = 'rotating'
            drag.axis = axis;
            if (typeof axis === 'string') {
                let index = {x: 0, y: 1, z: 2}[axis]
                drag.axis = new THREE.Vector3().setComponent(index, 1)
            }
            let index = drag.axis.dot(new THREE.Vector3(0, 1, 2));
            drag.angle = 0
            if (layer !== undefined) {
                layer -= 1
            }
            let angle = turns * Math.PI/2
            let selected = cube.children.filter(p => layer === undefined || p.position.getComponent(index) == layer);
            
            move(selected, rotation);
            rotateGroup(angle, 0.5 * Math.abs(angle / (Math.PI / 2)), no_undo, _ => {
                let move = rotationQueue.pop();
                if (move === undefined) {
                    return;
                }
                rotate(move.axis, move.turns, move.layer, move.no_undo)
            })

        }

        function abortRotation(){
            rotationQueue = []
        }

        function undoRotation() {
            let move = moves.pop();
            window.rotate(move.axis, -move.turns, move.layer, true);
        }
        /** rotation experiments **/
        /*
        let rotated = cube.children.filter(p => p.position.x == 1)
        
        move(cube, rotation, rotated)

        

        tl.to(rotation.rotation, 3, {x: Math.PI/2}).then(_ => {
            move(rotation, cube, rotated)
            rotated.forEach(p => {
                p.position.round()
                roundRotation(p.rotation)
            })
            rotation.rotation.set(0,0,0)
            
            rotated = cube.children.filter(p => p.position.y == 0)
            move(cube, rotation, rotated)

            tl.to(rotation.rotation, 3, {y: Math.PI/2, onComplete: _ => {
                rotated.forEach(p => roundRotation(p.rotation));
            }});
        })*/


        window.THREE = THREE;
        window.scene = scene;
        window.render = render;
        window.transform = transform; 
        window.camera = camera;


        render();
    })

    //


}

function createShadowedLight( x, y, z, color, intensity ) {

    var light = new THREE.SpotLight( color, intensity );
    light.position.set( x, y, z );

    light.castShadow = true;

    var d = 2;
    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.near = 1;
    light.shadow.camera.far = 4;

    light.shadow.bias = - 0.002;
    
    return light;

}

function onWindowResize() {

    let width = renderer.domElement.offsetWidth;
    let height = renderer.domElement.offsetHeight;

    renderer.setSize( width, height );

    camera.fov = 10;
    camera.aspect = width / height;

    const aspect = world.width / world.height;
    const fovRad = 10 * THREE.Math.DEG2RAD;

    let distance = ( aspect < camera.aspect )
        ? ( world.height / 2 ) / Math.tan( fovRad / 2 )
        : ( world.width / camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );

    distance *= 0.5;

    camera.position.set(distance, distance * 0.8, distance)
    camera.lookAt(-1.5, 0, 0);
    //camera.lookAt( -1, 0.4, 0.7 /* 0.3, -8/3, 2*/ /*scene.position*/ );

      camera.updateProjectionMatrix();

    animate();

}

function animate() {
    if (!needRender) {
        needRender = true;
        requestAnimationFrame( render );
    }
}

function render() {
    needRender = false;
    stats.begin();

    if (controls.enabled) controls.update();

    renderer.render( scene, camera );
    stats.end();

    if(window.animate) animate();
}

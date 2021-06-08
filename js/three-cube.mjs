import * as THREE from 'https://threejs.org/build/three.module.js';

import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';

import { STLLoader } from 'https://threejs.org/examples/jsm/loaders/STLLoader.js';

import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'

import { Reflector } from 'https://threejs.org/examples/jsm/objects/Reflector.js';

import { TransformControls } from 'https://threejs.org/examples/jsm/controls/TransformControls.js';

import gsap from 'https://cdn.skypack.dev/gsap';

import $ from 'https://cdn.skypack.dev/jquery';

import documentReadyPromise from 'https://cdn.skypack.dev/document-ready-promise';

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

        this.element.removeEventListener('touchstart', thisdrag.start, false);
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

let world = {
    width: 9,
    height: 7.2
}

let colors = {
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

function roundAngle(x) {
    const half = Math.PI / 2
    return Math.round( x  / half ) * half;
}

class ThreeCube {
    #needRender = false;
    #container;
    #camera
    #scene
    #renderer;
    #rotation;
    #raycaster = new THREE.Raycaster();
    #drag = {state: 'done'}
    #tl;
    #cube;
    #moves = [];
    #rotationQueue = []
    

    #onContainerResize() {

        let width = this.#container.width() // this.#renderer.domElement.offsetWidth;
        let height = this.#container.height() // this.#renderer.domElement.offsetHeight;

        this.#renderer.setSize( width, height );
    
        this.#camera.fov = 10;
        this.#camera.aspect = width / height;
    
        const aspect = world.width / world.height;
        const fovRad = 10 * THREE.Math.DEG2RAD;
    
        let distance = ( aspect < this.#camera.aspect )
            ? ( world.height / 2 ) / Math.tan( fovRad / 2 )
            : ( world.width / this.#camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );
    
        distance *= 0.5;
    
        this.#camera.position.set(distance, distance * 0.8, distance)
        this.#camera.lookAt(-1.5, 0, 0);
        //this.#camera.lookAt( -1, 0.4, 0.7 /* 0.3, -8/3, 2*/ /*this.#scene.position*/ );
    
        this.#camera.updateProjectionMatrix();
    
        this.#animate();
    
    }
    
    #animate() {
        if (!this.#needRender) {
            this.#needRender = true;
            requestAnimationFrame( this.#render.bind(this) );
        }
    }
    
    #render() {
        this.#needRender = false;
        // stats.begin();
    
        this.#renderer.render( this.#scene, this.#camera );
        // stats.end();
    
    }
    
    constructor(container) {
        this.#container = $(container)
        this.#camera = new THREE.PerspectiveCamera( 10, this.#container.innerWidth() / this.#container.innerHeight(), 1, 1000 );
        
        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color(0xd1d5db);
        //this.#scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

        // Lights
        let ambient = new THREE.AmbientLight( 0xffffff, 0.7)
        let front = createShadowedLight(6, 6, 6, 0xeeeece, 0.35)
        let back = createShadowedLight(-6, 0, -4, 0xeeeece, 0.35)

        let lights = new THREE.Group()
        lights.add(ambient, front, back)

        this.#scene.add(lights)

        
        // mirror
        let geometry = new THREE.PlaneBufferGeometry(3, 3);
        let leftMirror = new Reflector( geometry, {
            clipBias: 0.003,
            textureWidth: window.innerWidth * window.devicePixelRatio,
            textureHeight: window.innerHeight * window.devicePixelRatio,
            color: 0x777777
        } );
        leftMirror.position.set(-3.2, 1.2, 1.4);
        leftMirror.rotation.y = Math.PI / 2;
        leftMirror.name = "mirror"
        this.#scene.add( leftMirror );
        
        let backMirror = leftMirror.clone
        


        // renderer

        this.#renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        this.#renderer.setPixelRatio( window.devicePixelRatio );
        this.#renderer.setSize( container.innerWidth, container.innerHeight );
        // renderer.outputEncoding = THREE.sRGBEncoding;

        //renderer.shadowMap.enabled = true;

        this.#container.append( this.#renderer.domElement );

        // stats
        // stats = new Stats();
        // container.appendChild( stats.dom );
        
        new ResizeObserver(this.#onContainerResize.bind(this)).observe(this.#container[0])

        this.#onContainerResize();

    }

    async load() {
        var loader = new STLLoader();

        async function load(url) {
            let resource = await new Promise((resolve, reject) => {
                loader.load(url, resolve, undefined, reject);
            })
            resource.scale(0.5, 0.5, 0.5)
            return resource;
        };

        let corner_g = await load('resources/corner.stl')
        let edge_g = await load('resources/edge.stl')
        let center_g = await load('resources/center.stl')
        let core_g = await load('resources/core.stl')
        
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
        this.#cube = new THREE.Group();
        this.#cube.add(...faces)
        this.#cube.add(core)
        this.#scene.add(this.#cube)

        // attach to scene so it updates position to world
        faces.forEach(face => move(face.children, this.#cube ))
        this.#cube.remove(...faces)
    
        let pieces = new Array(3).fill().map(_ => new Array(3).fill().map(_ => new Array(3).fill().map(_ => new THREE.Group())))

        this.#cube.children.slice().forEach(facelet => {
            if (facelet.type == "Group")  {
                return;
            }
            facelet.position.round();
            // position is -1,0,1
            let piece = pieces[facelet.position.x + 1][facelet.position.y + 1][facelet.position.z + 1]

            piece.position.set(facelet.position.x, facelet.position.y, facelet.position.z);
            this.#cube.add(piece) // will not really add multiple times (otherwise can use pieces.flat().forEach...)

            piece.attach(facelet)
            piece.name = facelet.name
        })

        let coder = new THREE.Vector3(1, 2, 3); // to code faces
        let direction = new THREE.Vector3()
    
        this.#cube.traverse(mesh => {
            if ( mesh instanceof THREE.Mesh) {
                mesh.material =  new THREE.MeshPhysicalMaterial({metalness:0, roughness: 0.7, reflectivity: 0.5, transmission: 0.5})
                mesh.updateWorldMatrix(true);
                mesh.getWorldDirection(direction).round()
                let face = direction.dot(coder);
                if (mesh.name == 'core') face = 0;
                let color = {0: colors.C, '1': colors.L, '-1': colors.R, '2': colors.D, '-2': colors.U, '3': colors.B, '-3': colors.F }[face]
                mesh.material.color.set(color)
            }
        })

        const helper_m = new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff } );
        //const helper_m = new THREE.MeshBasicMaterial( { depthWrite: true, transparent: false, opacity: 1, side: THREE.DoubleSide, color: 0x0033ff } );

        let helpers = new THREE.Group()
        helpers.name = "helpers"

        this.#rotation = new THREE.Group();
        this.#rotation.name = "rotation";
        helpers.add(this.#rotation)

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

        this.#scene.add(helpers);    

        let draggable = new Draggable(this.#renderer.domElement) 
        
        // done -> selecting -> rotating -> finishing -> done 
        //                                            - (drag start) -> selecting_next
        // selecting_next - (finish animation) -> selecting 

        this.#tl = gsap.timeline({onUpdate: this.#animate.bind(this)});

        this.#tl.then(_ => {
            this.#drag.tween = undefined;
        })

        $(draggable).on('drag:start', event => {
            if (['selecting', 'rotating'].includes(this.#drag.state)) return;
            let intersection = this.#intersect(event.target.position.current, envelope)

            /** 
             * cube rotation: if the intersection is on the center piece, then it's a cube rotation.
             * 
             * alternative: if the intersection is empty, position dragged facing the camera (rotated 45 on y)
             * then any 'x' movement in dragged is rotating the cube on its y axis, and 'y' movement on the right is 
             * rotating on z (so the right hand side goes up/down) and 'y' movement on left is rotation on 'x'. right
             * and left are determined based on being above / below the half width of the screen
             */
            let meshes = this.#cube.children.flatMap(c => c.type == 'Group' ? c.children : [c]); // intersection doesn't work on groups
            let mesh = this.#intersect(event.target.position.current, meshes).object
            if (mesh == undefined){
                return;
            }
            this.#drag.piece = mesh.parent;
            this.#drag.current = dragged.worldToLocal(intersection.point.clone())
            this.#drag.total = new THREE.Vector3();
            this.#drag.normal = intersection.face.normal
            this.#drag.momentum = []

            envelope.attach(dragged);
            dragged.rotation.set( 0, 0, 0 ); 
            dragged.position.set( 0, 0, 0 );
            dragged.lookAt(intersection.face.normal.round());
            dragged.translateZ(1.5)
            dragged.updateMatrixWorld();

            this.#scene.attach(dragged);
            this.#drag.state = (this.#drag.state == 'finishing') ? 'selecting_next' : 'selecting'
        }).on('drag:move', event => {
            if (['done', 'finishing'].includes(this.#drag.state)) return;
            let intersection = this.#intersect(event.target.position.current, dragged);

            /* trag target local system */
            const point = dragged.worldToLocal(intersection.point.clone());
            this.#drag.delta = point.clone().sub(this.#drag.current).setZ(0); // only measure in the xy plane (that is facing the camera)
            this.#drag.total.add(this.#drag.delta);
            this.#drag.current = point;
            const time = Date.now();
            this.#drag.momentum = this.#drag.momentum.filter( moment => time - moment.time < 500 );
            let delta = this.#drag.delta
            this.#drag.momentum.push( { delta, time } )
            if (this.#drag.state == 'selecting' && this.#drag.total.length() > 0.03) {
                // choose an axis
                this.#drag.main = [0,1,2].maxBy(i => Math.abs(this.#drag.total.getComponent(i)))
                let direction = new THREE.Vector3();
                direction.setComponent(this.#drag.main, 1);
                direction = dragged.localToWorld(direction).sub(dragged.position); // relative to dragged in world 
                direction = envelope.worldToLocal(direction).round();

                this.#drag.axis = direction.cross(this.#drag.normal).negate();
                this.#drag.rotated = this.#drag.piece.name == 'center' ? this.#cube.children : this.#cube.children.filter(p => p.position.dot(this.#drag.axis) == this.#drag.piece.position.dot(this.#drag.axis));
                this.#rotation.rotation.set(0,0,0)
                move(this.#drag.rotated, this.#rotation)
                this.#drag.angle = 0;
                this.#drag.state = 'rotating'
            } else if (this.#drag.state == "rotating") { // flipping
                let delta = this.#drag.delta.getComponent(this.#drag.main) / 3;
                this.#rotation.rotateOnAxis(this.#drag.axis, delta)
                this.#drag.angle += delta;
                this.#animate();
            }
        }).on('drag:end', event => {
            if (['done', 'selecting'].includes(this.#drag.state)) {// small touch not enough to create a rotation
                this.#drag.state = 'done'
                return;
            }

            if (this.#drag.state == 'selecting_next') {
                this.#drag.state = 'finishing'
                return;
            }
            
            this.#drag.state = 'finishing'

            const time = Date.now();
            this.#drag.momentum = this.#drag.momentum.filter( moment => time - moment.time < 500 );
            let momentum = this.#drag.momentum.reduce((acc, cur, idx) => {
                return acc.add( cur.delta.multiplyScalar( idx / this.#drag.momentum.length ) );
            }, new THREE.Vector2())

            if( Math.abs( momentum ) > 0.05 && Math.abs( this.#drag.angle ) < Math.PI / 2 ) {
                this.#drag.angle += Math.sign(this.#drag.angle) * ( Math.PI / 4 )
            }

            this.#rotateGroup(roundAngle(this.#drag.angle))
                
    
        })                

        this.#render();  
        
        return this;
    }


    // axis: 0 - x, 1 - y, 2 - z
    // turns
    // layers: 0 left, 1 middle, 2 right (for x rotation)
    rotate(axis, turns, layers, no_undo) {
        if (this.#drag.state == 'selecting') return;
        if (this.#drag.state == 'rotating') {
            this.#rotationQueue.push({axis: axis, turns: turns, layers: layers, no_undo: no_undo});
            return;
        }

        this.#rotation.rotation.set(0,0,0)
        this.#drag.state = 'rotating'
        this.#drag.axis = new THREE.Vector3().setComponent(axis, 1)
        
        let index = this.#drag.axis.dot(new THREE.Vector3(0, 1, 2));
        this.#drag.angle = 0
        
        let angle = -turns * Math.PI/2
        let selected = this.#cube.children.filter(p => layers === undefined || layers.includes(p.position.getComponent(index) +1));
        
        move(selected, this.#rotation);
        this.#rotateGroup(angle, 0.5 * Math.abs(angle / (Math.PI / 2)), no_undo, _ => {
            let move = this.#rotationQueue.pop();
            if (move === undefined) {
                return;
            }
            this.rotate(move.axis, move.turns, move.layers, move.no_undo)
        })

    }

    abortRotation() {
        this.#rotationQueue = []
    }

    undoRotation() {
        let move = this.#moves.pop();
        rotate(move.axis, -move.turns, move.layer, true);
    }

    #intersect(position, object) {
        this.#raycaster.setFromCamera(position, this.#camera);

        let intersect = (Array.isArray(object))
            ? this.#raycaster.intersectObjects(object)
            : this.#raycaster.intersectObject(object);

        return (intersect.length > 0) ? intersect[0] : false;
    }

    #rotateGroup(to, duration, no_undo, onComplete2) {
        to = roundAngle(to)

        if (to != 0 && no_undo == undefined) {
            let axis = [0,1,2].maxBy(i => Math.abs(this.#drag.axis.getComponent(i)))
            let layer = this.#rotation.children.length == 27 ? undefined : (this.#rotation.children[0].position.getComponent(axis) + 1);
            let counter = to > 0;
            this.#moves.push({axis: this.#drag.axis, layer: layer, turns: Math.round(to / (Math.PI / 2))})
        }

        let onComplete = _ => {
            let selected = this.#rotation.children.slice()
            move(this.#rotation.children, this.#cube)
            selected.forEach(piece => {
                piece.rotation.set(roundAngle(piece.rotation.x), roundAngle(piece.rotation.y), roundAngle(piece.rotation.z))
                piece.position.round();
            });
            if (this.#drag.state == 'preparing_next') {
                this.#drag.state = 'preparing'
            } else {
                this.#drag.state = 'done'
            }

            if(onComplete2) onComplete2()

        }

        if (duration === 0 && this.#drag.state == "rotating") {
            this.#rotation.rotateOnAxis(this.#drag.axis, to)
            this.#animate();
            onComplete();
            return;
        }

        let proxy = {
            target: to,
            current: this.#drag.angle,
            previous: this.#drag.angle
        }
        if (duration === undefined) {
            duration = Math.abs(proxy.target - proxy.current) / 3; // full Math.PI/2 should take 0.5 seconds.
        } 

        let tweener = this.#tl;
        if (this.#drag.tween !== undefined) {
            tweener = this.#drag.tween   
        }

        this.#drag.tween = tweener.to(proxy, duration, {
            current: proxy.target,
            ease: "power3.out",
            onUpdate: _ => {
                const delta = proxy.current - proxy.previous
                this.#rotation.rotateOnAxis(this.#drag.axis, delta)
                proxy.previous = proxy.current
            },
            onComplete: onComplete
        })

    }

}

export default ThreeCube;



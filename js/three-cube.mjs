import * as THREE from 'https://threejs.org/build/three.module.js';

import Stats from 'https://threejs.org/examples/jsm/libs/stats.module.js';

import { STLLoader } from 'https://threejs.org/examples/jsm/loaders/STLLoader.js';

import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'

import { Reflector } from 'https://threejs.org/examples/jsm/objects/Reflector.js';

import { TransformControls } from 'https://threejs.org/examples/jsm/controls/TransformControls.js';

import {gsap, Linear, Sine} from 'https://cdn.skypack.dev/gsap';

import $ from 'https://cdn.skypack.dev/jquery';

// import documentReadyPromise from 'https://cdn.skypack.dev/document-ready-promise';

import {GPUPicker} from /*'https://rawcdn.githack.com/ittayd/three_js_gpu_picking/e22cb7fc9ed0a10d6e01edf2f1e44eff957c499b/gpupicker.js'*/ 'https://raw.githack.com/ittayd/three_js_gpu_picking/master/gpupicker.js';


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

class ThreeCube {
    #needRender = false;
    #container;
    #camera
    #scene
    #renderer;
    #cube;
    #rotation = {state: "", group: undefined, queue: [], tl: undefined}
    #pieces = new Array(3).fill().map(_ => new Array(3).fill().map(_ => new Array(3).fill().map(_ => new THREE.Group())))

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
        let aspect = this.#container.innerWidth() / this.#container.innerHeight();
/*        this.#camera = new THREE.OrthographicCamera(-1.5*aspect, 1.5*aspect, 1.5, -1.5, 0.1, 20)
        this.#camera.position.x = 3
        this.#camera.lookAt(0,0,0)
*/        this.#camera = new THREE.PerspectiveCamera( 10, aspect, 1, 40 );
        this.#scene = new THREE.Scene();
        this.#scene.background = new THREE.Color(0xd1d5db);
        //this.#scene.fog = new THREE.Fog( 0x72645b, 2, 15 );

        // Lights
/*
        let ambient = new THREE.AmbientLight( 0xffffff, 0.7)
        let front = createShadowedLight(6, 6, 6, 0xeeeece, 0.35)
        let back = createShadowedLight(-6, 0, -4, 0xeeeece, 0.35)
*/
        let ambient = new THREE.AmbientLight( 0xffffff, 0.5 )
        let front = new THREE.DirectionalLight( 0xffffff, 0.3 )
        let right = new THREE.DirectionalLight( 0xffffff, 0.3 )
        let up = new THREE.DirectionalLight( 0xffffff, 0.3 )
        let left = new THREE.DirectionalLight( 0xffffff, 0.4 )
        
        front.position.set( 0, 0, 5 );
        right.position.set( 5, 0, 0 );
        up.position.set( 0, 5, 0 );
        left.position.set( -5, 0, 0 );
        
        let lights = new THREE.Group()
        lights.add(ambient, front, right, up, left)

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
        // let core_g = await load('resources/core.stl')
        
        // let core = new THREE.Mesh(core_g);
        // core.name = 'core'
                    
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
        //this.#cube.add(core)
        this.#scene.add(this.#cube)

        // attach to scene so it updates position to world
        faces.forEach(face => move(face.children, this.#cube ))
        this.#cube.remove(...faces)
    
        this.#cube.children.slice().forEach(facelet => {
            if (facelet.type == "Group")  {
                return;
            }
            facelet.position.round();
            // position is -1,0,1
            let piece = this.#pieces[facelet.position.x + 1][facelet.position.y + 1][facelet.position.z + 1]

            piece.position.set(facelet.position.x, facelet.position.y, facelet.position.z);
            this.#cube.add(piece) // will not really add multiple times (otherwise can use pieces.flat().forEach...)

            piece.attach(facelet)
            piece.name = facelet.name
        })

        let coder = new THREE.Vector3(1, 2, 3); // to code faces
        let direction = new THREE.Vector3()
    
        this.#cube.traverse(mesh => {
            if ( mesh instanceof THREE.Mesh) {
                mesh.material =  new THREE.MeshLambertMaterial()//MeshPhysicalMaterial({metalness:0, roughness: 0.7, reflectivity: 0.5, transmission: 0.5})
                mesh.updateWorldMatrix(true);
                mesh.getWorldDirection(direction).round()
                let face = direction.dot(coder);
                if (mesh.name == 'core') face = 0;
                let color = {0: colors.C, '1': colors.L, '-1': colors.R, '2': colors.D, '-2': colors.U, '3': colors.B, '-3': colors.F }[face]
                mesh.material.color.set(color)
            }
        })

        //const helper_m = new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff } );
        //const helper_m = new THREE.MeshBasicMaterial( { depthWrite: true, transparent: false, opacity: 1, side: THREE.DoubleSide, color: 0x0033ff } );

        let helpers = new THREE.Group()
        helpers.name = "helpers"

        this.#rotation.group = new THREE.Group();
        this.#rotation.group.name = "rotation";
        helpers.add(this.#rotation.group)

        this.#scene.add(helpers);  
        
        let picker = new GPUPicker(THREE, this.#renderer, this.#scene, this.#camera);

        // done -> selecting -> rotating -> finishing -> done 
        //                                            - (drag start) -> selecting_next
        // selecting_next - (finish animation) -> selecting 

        this.#rotation.tl = gsap.timeline({onUpdate: this.#animate.bind(this)});

//        this.#rotation.tl.then(_ => this.#rotation.tween = undefined)

        let pick = (ev) => {
            return picker.pick(ev.clientX * window.devicePixelRatio, ev.clientY * window.devicePixelRatio, obj => obj.type === "Mesh")
        }

        let resolve = (id) => {
            if (id === undefined) return
            const faceDot = new THREE.Vector3(0,-1,-2);
            let obj = this.#scene.getObjectById(id)
            if (obj == undefined) return 
            return {
                id: id,
                pid: obj.parent.id,
                // 0 is the face around x (r), 1 is y (u), 2 is z (f)
                face:  obj.getWorldDirection(new THREE.Vector3()).round().dot(faceDot),
                position: obj.parent.position.toArray()
            }
        }

        let and = (a, b) => a.map((e, i) => e == b[i] ? e: 0)
        let xnor = (a, b) => a.map((e, i) => e == b[i] ? 1 : 0) 
        let sub = (a, b) => a.map((e, i) => e - b[i])
        let length_square = (a) => a.reduce((a, e) => a += e*e, 0)

        let downPick 
        let ignore = true;
        $(this.#renderer.domElement).on('pointerdown', ev => {
            ignore = false;
            downPick = undefined;
        }).on('pointermove', ev => {
            if (ignore) return;

            if (downPick == undefined) {
                downPick = resolve(pick(ev))
                return;
            }
            let moveId = pick(ev)
            if (downPick === undefined || moveId == downPick.id || moveId === undefined) return;
            
            let movePick = resolve(moveId)

            if (movePick.pid === downPick.pid) return;

            // if the click is on the face around axis x (right), then it can only rotate y (up) or z (front)
            const axisOptions = [[0,1,1], [1,0,1], [1,1,0]]

            // get the common faces for the down and up events
            let faceAxes = and(axisOptions[downPick.face], axisOptions[movePick.face]);

            // if the move changed the x coordinate, then it can't be a rotation around x. so only pick coordinates that didn't change
            let positionAxes = xnor(downPick.position, movePick.position)

            // combine the above to get an axis that won
            let axes = and(faceAxes, positionAxes)

            let axis = axes.reduce((a,e,i) => a += e*i, 0)

            if (axis == 0 && axes[0] == 0) return // no candidate axis

            let delta = sub(movePick.position, downPick.position)

            let direction = delta[(axis+1) % 3] > 0 || delta[(axis+2)%3] < 0 ? 1 : -1;

            let layers = [movePick.position[axis] + 1]
            if (length_square(downPick.position) == 1) // [1,0,0] or [0,1,0] or [0,0,1] which are for the center piece
                layers = [0,1,2]

            ignore = true;
            this.rotate(axis, direction, layers)
        })

        this.#render();  
        
        return this;
    }

    reset() {
        for(let i = 0; i < 3; i++)
            for(let j = 0; j < 3; j++)
                for(let k = 0; k < 3; k++) {
                    let piece = this.#pieces[i][j][k]
                    piece.position.set(i - 1, j - 1, k - 1)
                    piece.rotation.set(0,0,0)
                }
        this.#render();
    }

    // axis: 0 - x, 1 - y, 2 - z
    // turns
    // layers: 0 left, 1 middle, 2 right (for x rotation)
    async rotate(axis, turns, layers, options = {duration: 0.1}) {
        if (turns == 0) {
            return;
        }

        if (this.#rotation.state == 'rotating') {
            this.#rotation.queue.push({axis: axis, turns: turns, layers: layers, options: options});
            return;
        }

        this.#rotation.group.rotation.set(0,0,0)
        this.#rotation.state = 'rotating'

        let angle = -turns * Math.PI/2
        let selected = this.#cube.children.filter(p => layers === undefined || layers.includes(p.position.getComponent(axis) +1));
        
        move(selected, this.#rotation.group);
        
        let onComplete = _ => {
            const round = (x) => {
                const half = Math.PI / 2
                return Math.round( x  / half ) * half;
            }

            let selected = this.#rotation.group.children.slice() // after move, positions change
            move(this.#rotation.group.children, this.#cube)

            selected.forEach(piece => {
                piece.rotation.set(round(piece.rotation.x), round(piece.rotation.y), round(piece.rotation.z))
                piece.position.round();
            });
            
            this.#rotation.state = 'done'
            //this.#duration = Math.min(0.5, 0.1 * gsap.ticker.deltaRatio(20))
            let next = this.#rotation.queue.shift();
            if (next === undefined) {
                return;
            }
            this.rotate(next.axis, next.turns, next.layers, next.options)
        }

        let axisv = new THREE.Vector3().setComponent(axis, 1)
        if (!options.duration) {
            this.#rotation.group.rotateOnAxis(axisv, angle)
            this.#animate();
            onComplete();
            return ;
        }
    
        let proxy = {
            target: angle,
            current: 0,
            previous: 0
        }

        

        let tweener = this.#rotation.tl;
        return tweener.to(proxy, options.duration, {
            current: proxy.target,
            ease: Linear.easeNone,
            onUpdate: _ => {
                this.#rotation.group.rotateOnAxis(axisv, proxy.current - proxy.previous)
                proxy.previous = proxy.current
            },
            onComplete: onComplete
        })   

    }

    abortRotation() {
        this.#rotation.queue = []
    }
}

export default ThreeCube;



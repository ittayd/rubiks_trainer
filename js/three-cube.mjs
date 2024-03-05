import * as THREE from 'https://unpkg.com/three@0.144.0/build/three.module.js';
import Stats from 'https://unpkg.com/three@0.144.0/examples/jsm/libs/stats.module.js';
import { STLLoader } from 'https://unpkg.com/three@0.144.0/examples/jsm/loaders/STLLoader.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.144.0/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://unpkg.com/three@0.144.0/examples/jsm/controls/OrbitControls.js'
import { TransformControls } from 'https://unpkg.com/three@0.144.0/examples/jsm/controls/TransformControls.js';
import Dat from 'https://cdn.skypack.dev/dat.gui';
import initThreeDatGui from 'https://cdn.skypack.dev/three-dat.gui';
initThreeDatGui(Dat)

import {gsap, Linear, Sine} from 'https://cdn.skypack.dev/gsap@3.5.0';
import $ from './jquery-global.mjs'

// import documentReadyPromise from 'https://cdn.skypack.dev/document-ready-promise';

import {GPUPicker} from 'https://ittayd.github.io/three_js_gpu_picking/gpupicker.js' /*'https://rawcdn.githack.com/ittayd/three_js_gpu_picking/e22cb7fc9ed0a10d6e01edf2f1e44eff957c499b/gpupicker.js' */ /* 'https://raw.githack.com/ittayd/three_js_gpu_picking/master/gpupicker.js';*/


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
    width: 7.7,
    height: 7.2
}

let colors = {
    C: 0x999999, // core piece
    D: 0xf0f0f0, // white
    U: 0xFFFF4E, // yellow
    R: 0xFD354D, // red
    F: 0x00b6ff, // blue
    L: 0xFF992D, // orange
    B: 0x59eE68, // green
}


function move(objs, to) {
    // #attach removes the object from its existing parent, thus modifying its children. 
    // therefore, if `objs` is the children array, it will be modified during iteration.
    // so must copy it using #slice 
    objs.slice().forEach(o => to.attach(o))
}

const stlLoader = new STLLoader();
const gltfLoader = new GLTFLoader();

async function loadStl(url) {
    const resource = await new Promise((resolve, reject) => {
        stlLoader.load(url, resolve, undefined, reject);
    })
    resource.scale(0.5, 0.5, 0.5)
    resource.normalizeNormals();
    resource.computeVertexNormals();
    return resource;
};

async function loadGltf(url) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(url, resolve, undefined, reject);
    })   
};

const model = await loadGltf('resources/pieces.glb')

const corner_m = model.scene.children[0]
corner_m.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2)
corner_m.position.set(-1, -1, 1)

const edge_m = model.scene.children[1]
edge_m.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2)
edge_m.position.set(0, -1, 1)

const center_m = model.scene.children[2]
center_m.rotateOnAxis(new THREE.Vector3(0,1,0), Math.PI/2)
center_m.position.set(0,0,1)

class ThreeCube {
    #needRender = false;
    #container;
    #camera
    #scene
    #renderer;
    #mirrorTarget;
    #mirror;
    #mirrorCamera;
    #cube;
    #rotation = {state: "", group: undefined, queue: [], tl: undefined}
    #pieces = new Array(3).fill().map(_ => new Array(3).fill().map(_ => new Array(3).fill().map(_ => new THREE.Group())))

    rotateAll = false;
    
    constructor(container, {mirror = true} = {}) {
        this.#container = $(container)
        const aspect = this.#container.innerWidth() / this.#container.innerHeight();
        this.#camera = new THREE.PerspectiveCamera( 10, aspect, 1, 50 );

        this.#scene = new THREE.Scene();
        this.#scene.background = null; //new THREE.Color(0,0,0); 

        // Lights
        const lights = new THREE.Group()
        this.#scene.add(lights)
        let ambient = new THREE.AmbientLight( 0xffffff, 1)
        lights.add(ambient)
        
        // mirror
        if (mirror) {
            this.#mirrorCamera = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.1, 20)
            this.#mirrorCamera.position.x = -3
            this.#mirrorCamera.lookAt(0,0,0)
            this.#mirrorTarget = new THREE.WebGLRenderTarget( 512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat } )
            const geometry = new THREE.PlaneBufferGeometry(2, 2);
            // first line in main is to mirror
            const fragmentShader = `
                uniform sampler2D tDiffuse;
                varying vec2 vUv;
                void main() {
                    vec2 mvUv = vec2(1.-vUv.x, vUv.y);
                    gl_FragColor = texture2D( tDiffuse, mvUv );
                }
            ` 
            const vertexShader = `
                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }
            `

            let material = new THREE.ShaderMaterial( {
                uniforms: {tDiffuse: {value: this.#mirrorTarget.texture}} , // this is where we pass the rendered content to this material
                fragmentShader: fragmentShader,
                vertexShader: vertexShader
            });

            this.#mirror = new THREE.Mesh(geometry, material)        
            this.#mirror.position.set(-2.4, 1.2, 1.4)
            this.#mirror.rotation.y = Math.PI/2;
            this.#mirror.name = "mirror"
            this.#scene.add( this.#mirror )
        }
        

        // Build the cube
        let face = new THREE.Group();

        const pick_g = new THREE.PlaneGeometry(1,1)

        // transparent "stickers" that will capture user touch/drag events
        //DEBUG: const pick_m = new THREE.MeshBasicMaterial( { depthWrite: true, transparent: false, opacity: 1, side: THREE.DoubleSide, color: 0x0033ff } );
        const pick_m = new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff } );
        let pickTarget = new THREE.Mesh(pick_g, pick_m);
        pickTarget.name = "pick"
        pickTarget.position.set(0, 0, -0.5)
        pickTarget.rotateY(Math.PI)
       
        // a facelet is one face of a cublet
        function createFacelet(mesh, name) {
            let facelet = new THREE.Group().add(mesh, pickTarget.clone()); 
            facelet.name = name
            return facelet;
        }

        let center = createFacelet(center_m, 'center') 
        let corner_facelet = createFacelet(corner_m, 'corner_facelet')
        let edge_facelet = createFacelet(edge_m, 'edge_facelet');
        // let core = createFacelet(core_g, 'core')
        
        // build a face. it has a center and then 4 pairs of corner and edge facelets
        face.add(center)

        for (let i = 0; i < 4; i++) { // FIX: iteration start is 0
            let corner_facelet2 = corner_facelet.clone()
            let edge_facelet2 = edge_facelet.clone()
            corner_facelet2.position.set(1, 1, 0);
            edge_facelet2.position.set(0, 1, 0);
            face.attach(corner_facelet2)
            face.attach(edge_facelet2)
            face.rotateZ(Math.PI/2)
        }

        // construct a cube by attaching all faces. 3 pairs (top bottom, left right, front back)
        let start = new THREE.Vector3(0, 0, -1)
        face.position.copy(start)
        let faces = [];
        for(let i = 0; i < 3; i++) { // FIX: iteration start is 0
            for (let s = -1; s < 2; s += 2) { // FIX: iteration start is -1
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

        // now need to build the cubelets. by identifying facelets located in the same position
        // attach to scene so it updates position to world
        faces.forEach(face => move(face.children, this.#cube ))
        this.#cube.remove(...faces)
    
        this.#cube.children.slice().forEach(facelet => {
            facelet.position.round();
            // position coordinates are one of -1,0,1
            let piece = this.#pieces[facelet.position.x + 1][facelet.position.y + 1][facelet.position.z + 1]
    
            piece.position.set(facelet.position.x, facelet.position.y, facelet.position.z);
            this.#cube.add(piece) // will not really add multiple times (otherwise can use pieces.flat().forEach...)

            piece.attach(facelet)
            piece.name = facelet.name
        })

        // here the cube is a group of cubelets
        // color faces by iterating the meshes (facelets) and identifying their direction
        let coder = new THREE.Vector3(1, 2, 3); // to code faces
        let direction = new THREE.Vector3()
    
        this.#cube.traverse(mesh => {
            if ( mesh instanceof THREE.Mesh) {
                mesh.material =  mesh.material.clone();//new THREE.MeshPhongMaterial()
                mesh.parent.updateWorldMatrix(true);
                mesh.parent.getWorldDirection(direction).round()
                let face = direction.dot(coder);
                if (mesh.name == 'core') face = 0;
                let color = {0: colors.C, '1': colors.L, '-1': colors.R, '2': colors.D, '-2': colors.U, '3': colors.B, '-3': colors.F }[face]
                mesh.material.color.set(color)
            }
        })

        let helpers = new THREE.Group()
        helpers.name = "helpers"

        // put cubelets in this group and then rotate it so all cubelets rotate together on a single axis
        this.#rotation.group = new THREE.Group();
        this.#rotation.group.name = "rotation";
        helpers.add(this.#rotation.group)

        this.#scene.add(helpers);  
        
        // add a 'core' to prevent flickering as pieces from the back are seen through the holes
        const geometry = new THREE.SphereGeometry( 0.8, 32, 32 );
        const material = new THREE.MeshBasicMaterial( {color: 0x000000} );
        const sphere = new THREE.Mesh( geometry, material );
        this.#scene.add( sphere );


        // renderer
        this.#renderer = new THREE.WebGLRenderer( { alpha: true } );
        this.#renderer.setPixelRatio( window.devicePixelRatio );
        this.#renderer.setSize( container.innerWidth, container.innerHeight );
        this.#container.append( this.#renderer.domElement );
       
        new ResizeObserver(this.#onContainerResize.bind(this)).observe(this.#container[0])

        this.#onContainerResize();

        let picker = new GPUPicker(THREE, this.#renderer, this.#scene, this.#camera);

        this.#rotation.tl = gsap.timeline({onUpdate: this.#animate.bind(this)});

        let pick = (ev) => {
            let {x: x, y: y} = {x: ev.offsetX, y: ev.offsetY}
            return picker.pick(x * window.devicePixelRatio, y * window.devicePixelRatio, obj => obj.name == "pick" /*obj.type === "Mesh" && obj.name != "mirror"*/)
        }

        let resolve = (id) => {
            if (id === -1) return
            const faceDot = new THREE.Vector3(0,-1,-2);
            let obj = this.#scene.getObjectById(id)
            if (obj == undefined) return 
            obj = obj.parent
            return {
                obj: obj,
                parent: obj.parent,
                id: obj.id,                
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

        let originPick 
        let ignore = true;
        let pointerId
        let multitouch = false
        $(this.#renderer.domElement).on('pointerdown', ev => {
            ev.preventDefault()
            ev.stopPropagation();
            if (pointerId === undefined) {
                pointerId = ev.pointerId
                ignore = false;
                originPick = undefined;
            } else {
                multitouch = true
            }
        }).on('pointermove', ev => {
            ev.preventDefault()
            if (ignore) return;
            if (pointerId != ev.pointerId) return;

            if (originPick == undefined) {
                let id = pick(ev);
                originPick = resolve(id)
                return;
            }
            let targetId = pick(ev)
            if (originPick === undefined || targetId == originPick.id || targetId === -1) return;
            
            let targetPick = resolve(targetId)
            if (targetPick.pid === originPick.pid) return;

            ignore = true; // picked another cubelet, so if it doesn't show an intent in rotation, skip the rest of the drag

            // if the click is on the face around axis x (right), then it can only rotate y (up) or z (front)
            const axisOptions = [[0,1,1], [1,0,1], [1,1,0]]

            // get the common faces for the down and up events
            let faceAxes = and(axisOptions[originPick.face], axisOptions[targetPick.face]);

            // if the move changed the x coordinate, then it can't be a rotation around x. so only pick coordinates that didn't change
            let positionAxes = xnor(originPick.position, targetPick.position)

            // combine the above to get an axis that won
            let axes = and(faceAxes, positionAxes)

            let axis = axes.reduce((a,e,i) => a += e*i, 0)

            if (axis == 0 && axes[0] == 0) return // no candidate axis

            let delta = sub(targetPick.position, originPick.position)

            let direction = delta[(axis+1) % 3] > 0 || delta[(axis+2)%3] < 0 ? 1 : -1;

            let layers = [targetPick.position[axis] + 1]
            if (multitouch || ev.ctrlKey || this.rotateAll /*length_square(originPick.position) == 1*/) // [1,0,0] or [0,1,0] or [0,0,1] which are for the center piece
                layers = [0,1,2]

            if (ev.shiftKey && layers.length == 1 && layers[0] != 1) {
                layers.push(1)
            }
            this.rotate(axis, direction, layers, {duration: 0.1})
        }).on('pointerup pointercancel pointerleave pointerout', ev => {
            if (pointerId == ev.pointerId) {
                ignore = true;
                originPick = undefined;
                pointerId = undefined
                multitouch = false
            } 
        })

        return this;
    }

    reset({trigger = true} = {}) {
        if (this.#rotation.state == 'rotating') {
            this.#rotation.queue = [{reset: true}]
            return;
        }

        if (trigger) $(this).triggerHandler('cube:reset')

        
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
    async rotate(axis, turns, layers, {duration = 0.25, trigger = true} = {}) {
        if (turns == 0) {
            return;
        }

        if (this.#rotation.state == 'rotating') {
            this.#rotation.queue.push({axis: axis, turns: turns, layers: layers, options: {duration: duration, trigger: trigger}});
            return;
        }

        if (trigger) $(this).triggerHandler('cube:rotation', [axis, turns, layers])

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
            let next = this.#rotation.queue.shift();
            if (next === undefined) {
                this.#rotation.tweener = undefined;
                return;
            }
            if (next.reset) {
                this.reset();
            } else {
                this.rotate(next.axis, next.turns, next.layers, next.options)
            }
        }

        let axisv = new THREE.Vector3().setComponent(axis, 1)
        if (!duration) {
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

        this.#rotation.tweener = this.#rotation.tweener || this.#rotation.tl;
        return this.#rotation.tweener = this.#rotation.tweener.to(proxy, duration * Math.abs(turns), {
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

    #onContainerResize() {

        let width = this.#container.innerWidth() // this.#renderer.domElement.offsetWidth;
        let height = this.#container.innerHeight() // this.#renderer.domElement.offsetHeight;

        this.#renderer.setSize( width, height );
    
        const aspect = width / height;
        this.#camera.aspect = aspect;
    
        const x = new THREE.Vector3()
        const y = new THREE.Vector3()
        const z = new THREE.Vector3()
        const pos = new THREE.Vector3(100, 80, 100) // by experimentation. large values so the pos direction and (pos - lookAt) (which is what I set) are very similar.
        const lookAt = new THREE.Vector3(this.#mirror ? -0.5 : 0, -0.1, 0)
        this.#camera.position.copy(pos)
        this.#camera.lookAt(lookAt)
        this.#camera.matrix.extractBasis(x, y, z)

        // the points we want to make sure are in the furstrum
        const extremes = [ // cube
            new THREE.Vector3(-1.5, -1.5, -1.5),
            new THREE.Vector3(-1.5, -1.5, 1.5),
            new THREE.Vector3(-1.5, 1.5, -1.5),
            new THREE.Vector3(-1.5, 1.5, 1.5),
            new THREE.Vector3(1.5, -1.5, -1.5),
            new THREE.Vector3(1.5, -1.5, 1.5),
            new THREE.Vector3(1.5, 1.5, -1.5),
            new THREE.Vector3(1.5, 1.5, 1.5),           
        ].concat(!this.#mirror ? [] :
            this.points = [
            new THREE.Vector3(-2.4, 0.2, 0.4),
            new THREE.Vector3(-2.4, 0.2, 2.4),
            new THREE.Vector3(-2.4, 2.2, 0.4),
            new THREE.Vector3(-2.4, 2.2, 2.4),
        ]).map(p => p.sub(lookAt))

        const tany = Math.tan(THREE.MathUtils.degToRad(this.#camera.fov / 2))

        // to calculate the distance, project each point to the x or y axis of the camera and calculate the distance it'll take to position the camera
        // given its FOV so the point is in its furstrum. 
        // point.dot(y) == length of projection on y
        // point.dot(y)/tany = distance from camera to lookAt 
        // for x, need to divide by aspect
        // the maximum of all of these is the distance we need to set.
        const distance = Math.max(...extremes.flatMap(p => [Math.abs(p.dot(x)/tany/aspect), Math.abs(p.dot(y)/tany)    ]))

        /* IGNORE
          lookAt ---------- origin
                 \         |
                  \        |
                   \       |
                    \      |
            distance \     |
                      \    |
                       \   |
                        \  |
                         \ |
                          \|
                          pos
        */
        /*const lookAtLength = lookAt.length()
        const originAngle = Math.acos(lookAt.dot(pos)/lookAtLength/pos.length())
        const posAngle = Math.asin(lookAtLength/distance*Math.sin(originAngle))
        const lookAtAngle = Math.PI - originAngle - posAngle
        const posLength = Math.sqrt(lookAtLength * lookAtLength + distance * distance - 2 * lookAtLength * distance * Math.cos(lookAtAngle))
        pos.normalize().multiplyScalar(posLength)*/

        // move along the vector from lookAt to pos
        pos.sub(lookAt).normalize().multiplyScalar(distance*1.01) // add a bit to avoid clipping

        this.#camera.matrix.identity()
        this.#camera.position.copy(pos)
        this.#camera.lookAt(lookAt)
        
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

        if (this.#mirror) {
            this.#mirrorTarget.texture.encoding = this.#renderer.outputEncoding;

            const currentXrEnabled = this.#renderer.xr.enabled;
            const currentShadowAutoUpdate = this.#renderer.shadowMap.autoUpdate;

            this.#renderer.xr.enabled = false; // Avoid camera modification
            this.#renderer.shadowMap.autoUpdate = false; // Avoid re-computing shadows

            this.#renderer.setRenderTarget( this.#mirrorTarget );
            this.#renderer.state.buffers.depth.setMask( true ); // make sure the depth buffer is writable so it can be properly cleared, see #18897

            if ( this.#renderer.autoClear === false ) this.#renderer.clear();
            this.#mirror.visible = false
            this.#renderer.render( this.#scene, this.#mirrorCamera );
            this.#mirror.visible = true

            this.#renderer.xr.enabled = currentXrEnabled;
            this.#renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

            this.#renderer.setRenderTarget( null );
        }
        this.#renderer.render( this.#scene, window.testCamera ? this.camera : this.#camera );   
    }
}

export default ThreeCube;



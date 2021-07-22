import $ from 'https://cdn.skypack.dev/jquery';
import pegjs from 'https://cdn.skypack.dev/pegjs';
import * as data from './algos-data.mjs';
import Control from './three-control.mjs'

class LRU {
	constructor(max=10) {
		this.max = max;
		this.cache = new Map();
	}

	get(key) {
		let item = this.cache.get(key);
		if (item) // refresh key
		{
			this.cache.delete(key);
			this.cache.set(key, item);
		}
		return item;
	}

	set(key, val) {
		if (this.cache.has(key)) // refresh key
			this.cache.delete(key);
		else if (this.cache.size == this.max) // evict oldest
			this.cache.delete(this._first());
		this.cache.set(key, val);
	}

	_first(){
		return this.cache.keys().next().value;
	}
}


var parse;

var notationpeg = $.ajax('resources/notation.pegjs')

var classes = (function(){

	// LCM - least common multiplier, AKA LCD.
	function lcm(n1, n2) {
		//Find the smallest and biggest number from both the numbers
		let lar = Math.max(n1, n2);
		let small = Math.min(n1, n2);
		
		//Loop till you find a number by adding the largest number which is divisble by the smallest number
		let i = lar;
		while(i % small !== 0){
			i += lar;
		}
		
		//return the number
		return i;
	}

	function cycles(array, base = 0) {
		let result = []
		let temp = [...array]
		for (var i = base; i < base + temp.length; i++) {
			if (temp[i - base] == -1) continue;
			let cycle = []
			let current = i 
			do {
				cycle.push(current)
				let prev = current
				current = temp[prev - base]
				if (current === undefined) 
					throw new Error(`${prev - base} is not a source in the current array [${array.join(',')}]`)
				temp[prev - base] = -1
			} while (current != cycle[0])
			if (cycle.length > 1) {
				result.push(cycle)
			}
		}
		return result;
	}

	class Permutation {
		// visual studio code doesn't recognize '#'...
		constructor(array) {
			if (array === undefined) this.array = Array.from({length: 54}, (_, i) => i);
			else if (typeof(array[0]) === 'number') this.array = array
			else this.array = array.map(f => f.toArray()).flat()
		}

		get inverted() {
			let arr = []
			for (let i = 0; i < this.array.length; i++) {
				arr[this.array[i]] = i
			}
			return new Permutation(arr)
		}

		clone() {
			return new Permutation([...this.array])
		}

		equals(other) {
			for (let i = 0; i < this.array.length; i++) {
				if (this.array[i] != other.array[i]) return false
			}
			return true;
		}

		composeWith(other) { // applying other first then tself
			for (var i = 0; i < this.array.length; i++) {
				this.array[i] = other.array[this.array[i]];
			}
			return this;
		}

		then(other) {
			return other.clone().composeWith(this)
		}


		get order() {
			return this.cycles.reduce((lcma, cycle) => lcm(lcma, cycle.length), 1)
		}

		get cycles() {return cycles(this.array)}

		static faceOrder = "ULFRBD".split("")

		toString() {
			let str = `
			         +--------+
			         |00 01 02|
			         |03 U  05|
			         |06 07 08|
			+--------+--------+--------+--------+
			|09 10 11|18 19 20|27 28 29|36 37 38|
			|12 L  14|21 F  23|30 R  32|39 B  41|
			|15 16 17|24 25 26|33 34 35|42 43 44|
			+--------+--------+--------+--------+
			         |45 46 47|
			         |48 D  50|
			         |51 52 53|
			         +--------+
			`.replace(/\t/gi,"")
			
			for(let i = 0; i < 54; i++) {
				str = str.replace(new RegExp((i < 10 ? "0" : "") + i ), (Permutation.faceOrder[Math.floor(this.array[i]/9)]) + (this.array[i]%9));
			}
			return str;
		}
	}

	

	class Face {
		constructor(name, arr) {
			this.name = name;
			if (arr === undefined) {
				arr = Array.from({length: 9}, (_, j) => j + this.base)
			}
			([this.tl, this.tm, this.tr, this.el, this.em, this.er, this.bl, this.bm, this.br] = arr)
		}

		get clockwise() {
			return new Face(this.name, [this.bl, this.el, this.tl, this.bm, this.em, this.tm, this.br, this.er, this.tr])
		}

		get counter() {
			return new Face(this.name, [this.tr, this.er, this.br, this.tm, this.em, this.bm, this.tl, this.el, this.bl])
		}

		get double() {// two clockwise
			return new Face(this.name, [this.br, this.bm, this.bl, this.er, this.em, this.el, this.tr, this.tm, this.tl])
		}

		top(idxs) {return idxs == undefined ? [this.tl, this.tm, this.tr] : new Face(this.name, [...idxs, this.el, this.em, this.er, this.bl, this.bm, this.br]) }
		equator(idxs) {return idxs == undefined ? [this.el, this.em, this.er] : new Face(this.name, [this.tl, this.tm, this.tr, ...idxs, this.bl, this.bm, this.br])}
		bottom(idxs) {return idxs == undefined ? [this.bl, this.bm, this.br] : new Face(this.name, [this.tl, this.tm, this.tr, this.el, this.em, this.er, ...idxs])}
		left(idxs) {return idxs == undefined ? [this.tl, this.el, this.bl] : new Face(this.name, [idxs[0], this.tm, this.tr, idxs[1], this.em, this.er, idxs[2], this.bm, this.br])}
		middle(idxs) {return idxs == undefined ? [this.tm, this.em, this.bm] : new Face(this.name, [this.tl, idxs[0], this.tr, this.el, idxs[1], this.er, this.bl, idxs[2], this.br])}
		right(idxs) {return idxs == undefined ? [this.tr, this.er, this.br] : new Face(this.name, [this.tl, this.tm, idxs[0], this.el, this.em, idxs[1], this.bl, this.bm, idxs[2]])}


		get base() {
			return Permutation.faceOrder.indexOf(this.name) * 9
		}

		toArray({rebase = false, named = false} = {}) {
			var result = [this.tl, this.tm, this.tr, this.el, this.em, this.er, this.bl, this.bm, this.br]
			if (named) {
				result = result.map(i => Permutation.faceOrder[Math.floor(i/9)] + (i % 9))
			}
			if (rebase) {
				result = result.map(i => i - this.base);
			}
			return result
		}

		cycles({rebase = false} = {}) { // makes sense only for permutations that don't insert other face's indexes 
			return cycles(this.toArray(rebase), rebase ? 0 : this.base)
		} 

		get clockwiseOrbit() {
			return this.counter.remap(Face.U.clockwise.toArray())
		}

		get counterOrbit() {
			return this.clockwise.remap(Face.U.counter.toArray())
		}

		get oppositeOrbit() {
			return this.double.remap(Face.U.double.toArray())
		}

		remap(map) {
			return new Face(this.name, this.toArray().map(i => map[i]))
		}

		toString() {
			let arr = this.toArray({named: true})
			return `${arr[0]} ${arr[1]} ${arr[2]}\n${arr[3]} ${arr[4]} ${arr[5]}\n${arr[6]} ${arr[7]} ${arr[8]}\n`
		}
	}

	Permutation.faceOrder.forEach((f, i) => {
		Face[f] = new Face(f)
		Object.defineProperty(Permutation.prototype, "face" + f, {
			get: function() {
				return new Face(f, this.array.slice(i*9, (i+1) * 9), i*9)
			}
		}) 
	})

	Permutation.identity = new Permutation();
	(({F, L, D, R, U, B}) => {
		Permutation.x = new Permutation([F, L.counter, D, R.clockwise, U.double, B.double])
		Permutation.y = new Permutation([U.clockwise, F, R, B, L, D.counter])
		Permutation.U = new Permutation([U.clockwise, L.top(F.top()), F.top(R.top()), R.top(B.top()), B.top(L.top()), D])
		Permutation.u = Permutation.U.then(new Permutation([U, L.equator(F.equator()), F.equator(R.equator()), R.equator(B.equator()), B.equator(L.equator()), D]))
	})(Face);

	((_) => {
		_.z = _.y.then(_.x.inverted).then(_.y.inverted)
		_.L = _.z.then(_.U).then(_.z.inverted)
		_.l = _.z.then(_.u).then(_.z.inverted)
		_.F = _.x.then(_.U).then(_.x.inverted)
		_.f = _.x.then(_.u).then(_.x.inverted)
		_.R = _.z.inverted.then(_.U).then(_.z)
		_.r = _.z.inverted.then(_.u).then(_.z)
		_.B = _.x.inverted.then(_.U).then(_.x)
		_.b = _.x.inverted.then(_.u).then(_.x)
		_.D = _.x.then(_.x).then(_.U).then(_.x).then(_.x)
		_.d = _.x.then(_.x).then(_.u).then(_.x).then(_.x)
		_.M = _.r.inverted.then(_.R)
		_.E = _.z.inverted.then(_.M)
		_.S = _.y.then(_.M)
	})(Permutation)

	'ULFRBDulfrbd'.split('').forEach(p => Permutation[`{$p}2`] = Permutation[p].then(Permutation[p]))
	
	Number.prototype.times = function(callback) {
		if (typeof callback !== "function" ) {
			throw new TypeError("Callback is not a function");
		} else if( isNaN(parseInt(Number(this.valueOf()))) ) {
			throw new TypeError("Object is not a valid number");
		}
		for (var i = 0; i < Number(this.valueOf()); i++) {
			callback(i);
		}
		};

	class Axis {
		constructor(axis, cycles, faces, neutral) {
			this.axis = axis
			this.neutral = neutral;
			this.faces = faces
			this.permutation = cycles.reduce((acc, cycle) => cycle.split('').reduce((acc, face, i) => {
						acc[face] = cycle[(i + 1) % cycle.length]
						return acc
					}, acc), {})
		}

		mirror(atomic) {
			if (atomic.character == this.axis) return atomic
			if (atomic.character == this.neutral) return atomic
			let face = atomic.character.toUpperCase();
			let found = this.faces.indexOf(face)
			if (found != -1) {
				let other = this.faces[(found + 1) % 2]
				if (atomic.character != face) other = other.toLowerCase();
				return new Atomic(other, atomic.inner, atomic.outer, -atomic.amount)
			}
			return atomic.inverted;
		}	

		rotate(atomic, amount = 1) {
			if (atomic.character == 'M' && this.axis != "x") { // M is a special case
				atomic = atomic.inverted
			}
			if (atomic.character == this.neutral) return atomic

			let face = atomic.character.toUpperCase();
			let lower = (face != atomic.character);
			((amount + 4) % 4).times(_ => face = (this.permutation[face] || face));
			if (lower) face = face.toLowerCase();
			return new Atomic(face, atomic.inner, atomic.outer, ((face == "M" && this.axis != "x") ? -atomic.amount : atomic.amount))
		}
	}

	Axis.x = new Axis('x', ['FUBD', 'SE'], 'RL', 'M')
	Axis.y = new Axis('y', ['FLBR', 'MS'], 'UD', 'E')
	Axis.z = new Axis('z', ['LURD', 'ME'], 'FB', 'S')

	class RepeatedUnit {
		_amount = 1
		order = undefined
		
		constructor(order, amount) {
			this.order = order;
			if (amount !== undefined) {
				this.amount = amount;
			}
		}

		set amount(amount) {
			if (this.order !== undefined) {
				amount = (amount + this.order) % this.order

				if (amount > this.order / 2) {
					amount = amount - this.order
				} 
			}
			this._amount = amount
		}

		get amount() {
			return this._amount;
		}

		/* options: 
			* nested: (mimic object nesting through array nesting) 
			* sequence: wrap in a Sequence 
			* string: return as string instead of an array
			* keepNop: maintain non operations such as comments
			* keepTriggers: keep triggers as they are. Otherwise resolve to moves 
			* shallow: don't recurse when there are nested moves (in groupings)
			*/
		toMoves(options = {}) {
			if (this.amount == 0) return (options.string ? "" : [])
			if (this.isGroup(options)) { // resolved contains other objects
				let resolved = this.resolveShallow(options)
				if (this.amount < 0) {
					resolved = resolved.map(x => x.inverted).reverse();
				}
				let string = options.string;
				if (string) {
					options = $.extend({}, options, {string: false})
				}
				let toMoves = s => s.toMoves(options)
				let op = arr => arr.flatMap(toMoves); 
				if (options.nested) {
					op = arr => arr.map(toMoves)
				} 
				if (options.shallow) {
					op = arr => arr
				}
				let result = new Array(options.sequence ? 1 : Math.abs(this.amount)).fill(op(resolved))
				result = options.nested ? result[0] : result.flat(Infinity)
				if (string) {
					function toStr(arr) { 
						return arr.reduce((acc, e) => acc.concat((Array.isArray(e) ? `[${toStr(e)}]` : e)), []).join(" ")
					}
					return toStr(result)
				}
				return options.sequence ? new Sequence(result, this.amount) : result
			} 

			return options.sequence ? new Sequence([this.toIndividual()]) : this.toIndividual().toString() 
		}

		get stringAmount() {
			switch(this.amount) {
				case 0: return "0"
				case 1: return ""
				case -1: return "'"
				default: return this.amount > 0 ? this.amount : ("'" + this.amount)
			}
		}

		get permutation() {
			let p;
			if (this.isGroup({})) {
				let resolved = this.amount == 0 ? [] : this.resolveShallow({})
				if (this.amount < 0) {
					resolved = resolved.map(x => x.inverted).reverse();
				}
				p = resolved.reduceRight((permutation, val) => permutation.composeWith(val.permutation), new Permutation())
			} else {
				p = this.selfPermutation();
				if (this.amount < 0) {
					p = p.inverted;
				}
			}
			for(let i = 1; i < Math.abs(this.amount); i++) {
				p = p.then(p)
			}
			return p

		}

		mirror(axis) {
			return this.cascade(s => s.mirror(axis))
		}

		rotate(axis, amount = 1) {
			return this.cascade(s => s.rotate(axis, amount))
		}

		toString(options = {}) {
			return `${this.innerString(options)}${this.op ? op.toString() : ''}${this.stringAmount}`
		}

	}


	class Nop {
		get inverted() {
			return this;
		}

		toMoves(options = {}) {
			if (options.string) return options.keepNop ? toString() : ""
			return options.keepNop ? [toString()] : []
		}

		get permutation() {
			return Permutation.identity
		}

		cascade(f) {
			return this;
		}

	}


	class InvertEach extends RepeatedUnit{
		constructor(repeatable_unit, amount = 1) {
			super(undefined, amount)
			this.repeatable_unit = repeatable_unit;
		}

		get inverted() {
			return new InvertEach(this.repeatable_unit, -this.amount)
		}

		isGroup(options) {
			return this.repeatable_unit.isGroup(options);
		}

		resolveShallow(options) {
			return this.repeatable_unit.resolveShallow(options).map(x => new InvertEach(x, Math.abs(this.amount) )); // resolveShallow is used by toMove that will do the invert action if amount < 0
		}

		innerString(options) {
			if (this.repeatable_unit.constructor === Atomic) {
				return this.toIndividual().toString(options)
			}
			return this.repeatable_unit.toString(options) + "^";
		}

		individualPermutation() {
			return this.repeatable_unit.permutation.inverted // called only when not a group...
		}

		toIndividual() {
			return new Atomic(this.repeatable_unit.character, this.repeatable_unit.inner, this.repeatable_unit.outer, this.repeatable_unit.amount * (-this.amount))
		}

	}

	class Atomic extends RepeatedUnit {
		constructor(character, inner, outer, amount) {
			super(4, amount)
			this.character = character;
			this.inner = inner;
			this.outer = outer;
		}

		get inverted() {
			return new Atomic(this.character, this.inner, this.outer, -this.amount)
		}

		isGroup(options) {
			return false;
		}

		innerString() {
			return `${this.outer ? this.outer + "-" : ""}${this.inner ? this.inner : ""}${this.character}`
		}

		get permutation() {
			let p = Permutation[this.character]
			switch(this.amount) {
				case 0: return Permutation.identity
				case 1: return p
				case 2: return p.then(p)
				case -1: return p.inverted
			}
		}

		toIndividual() {
			return this;
		}

		mirror(axis) {
			return Axis[axis].mirror(this)
		}

		rotate(axis, amount = 1) {
			return Axis[axis].rotate(this, amount)
		}
	}

	class Trigger extends RepeatedUnit {
		constructor(name, amount) {
			if (!data.triggers[name]) throw `Trigger ${name} is not registered`
			super(data.triggers[name].order, amount)
			this.name = name;
		}

		get inverted() {
			var amount = -this.amount
			var name = data.triggers[this.name].inverse
			if (amount > 0 || name === undefined) {
				name = this.name
			} else {
				amount = -amount // double inverse, since we have an inverse
			}
			return new Trigger(name, amount)
		}

		isGroup(options) {
			return !(options.keepTriggers & this.amount == 1);
		}
		
		toSequence(ignoreAmount = false) {
			let str = data.triggers[this.name].moves
			if (!ignoreAmount) {
				str = `(${str})${this.stringAmount}`
			}
			return parse(str)
		}

		resolveShallow(options) {
			return this.toSequence(true).resolveShallow(options)
		}

		innerString() {
			return this.name
		}

		cascade(f) {
			return f(this.toSequence())
		}

	}

	class Sequence extends RepeatedUnit {
		constructor(sub, amount) {
			super(undefined, amount)
			this.sub = sub
		}

		get inverted() {
			return new Sequence(this.sub, -this.amount)	
		}


		isGroup(options) {
			return true;
		}

		resolveShallow(options) {
			return this.sub
		}

		innerString() {
			let base = `${this.sub.map(s => s.toString()).join(" ")}`
			if (this.amount != 1) base = `(${base})`
			return base;
		}

		cascade(f) {
			return new Sequence(this.sub.map(f), this.amount)
		}

	}

	class Tag extends RepeatedUnit {
		constructor(name, sequence) {
			super(sequence.order)
			this.name = name
			this.sequence = sequence
		}

		get inverted() {
			return this.sequence.inverted;
		}

		isGroup(options) {
			return this.sequence.isGroup(options);
		}

		resolveShallow(options) {
			return this.sequence.resolveShallow(options)
		}

		innerString(options) {
			let substr = this.sequence.toString(clean)
			if (options.clean) return substr;
			return `<${this.name}>${substr}</${this.name}>`
		}

		cascade(f) {
			return new Tag(this.name, f(this.sequence))
		}			
	}

	class Conjugate extends RepeatedUnit {
		constructor(a, b) {
			super()
			this.a = a;
			this.b = b;
		}

		get inverted() {
			return new Conjugate(this.a, this.b.inverted)
		}

		isGroup(options) {
			return true;
		}

		resolveShallow(options) {
			return [this.a, this.b, this.a.inverted]
		}

		innerString() {
			return `[${this.a.toString()}:${this.b.toString()}]`
		}

		cascade(f) {
			return new Conjugate(f(this.a), f(this.b))
		}

	}

	class Commutator extends RepeatedUnit {
		constructor(a, b) {
			super()
			this.a = a;
			this.b = b;
		}

		get inverted() {
			return new Commutator(this.b, this.a);
		}

		isGroup(options) {
			return true;
		}

		resolveShallow(options) {
			return [a, b, a.inverted, b.inverted]
		}

		innerString() {
			return `[${this.a.toString()},${this.b.toString()}]`
		}

		cascade(f) {
			return new Commutator(f(this.a), f(this.b))
		}
	}

	class Comment extends Nop {
		constructor(text) {
			super();
			this.text = text;
		}


	}

	class NewLine extends Nop {
	}

	class Pause extends Nop {
	}

	return {
		Atomic: Atomic,
		Trigger: Trigger,
		Tag: Tag,
		Sequence: Sequence,
		Conjugate: Conjugate,
		Commutator: Commutator,
		Comment: Comment,
		NewLine: NewLine,
		Pause: Pause, 
		Permutation: Permutation,
		Face: Face,
		InvertEach: InvertEach
	}
})();


(function (old) {
	$.fn.attr = function () {
		if (arguments.length === 0) {
			if (this.length === 0) {
				return null;
			}

			var obj = {};
			$.each(this[0].attributes, function () {
				if (this.specified) {
					obj[this.name] = this.value;
				}
			});
			return obj;
		}

		return old.apply(this, arguments);
	};
})($.fn.attr);

const isFunction = value => value && (Object.prototype.toString.call(value) === "[object Function]" || "function" === typeof value || value instanceof Function);

function formatURL(base, parameters) {
	return `${base}` + Object.entries(parameters).reduce((result, [key, value]) => {
		value = isFunction(value) ? value.apply(null, [parameters]) : value
		if (value === undefined) return result
		return result + `${key}=${value}&` // not sure why encodeURIComponent is not required...
	}, '')
}

function escapeRE(s) {                                         
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');    
}

function cleanMarkup(algo, {tags = true, braces = true, spaces = true} = {}) {
	return algo;
	const cre = new RegExp("({[]})".split("").map(c => escapeRE(c)).join("|"), "g");
	algo = tags ? algo.replace(/<\/?[^>]*>/g, '') : algo
	algo = braces ? algo.replace(cre, ' ') : algo
	algo = spaces ? algo.replace(/\s+/g, ' ').trim() : algo
	return algo;
}

const ignoreLocalStorage = (new URL(document.location)).searchParams.has("clean")
const externalImages = (new URL(document.location)).searchParams.has("external-images")

const mini_cube = new Control('#demo_cube', {mirror:false})
const $algo_demo = $('#algo_demo')
$algo_demo.bind('blur change click dblclick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit', function(event){
    event.stopPropagation();
});

let demo_formula;
function demoReset() {
	mini_cube.reset({clearUndo: true});
	mini_cube.move(demo_formula, true);
}
function showAlgoDemo(formula, $obj) {
	$obj.append($algo_demo)
	demo_formula = parse(formula).inverted
	demoReset()
	$algo_demo.css('visibility', 'visible')
	
}
 $('#demo-start-btn').click(demoReset)
 $('#demo-back-btn').click(ev => mini_cube.redo())
 $('#demo-forward-btn').click(ev => mini_cube.undo())
 $('#demo-close-btn').click(ev => 	$algo_demo.css('visibility', 'hidden'))
 

/*
	<li class="title">white on the top</li>
	<li class="algo">
		<div class="name">1 : </div>
		<div class="image"></div>
		<div class="formula">(R U R') F' U' F</div>
	</li>
*/
function renderItem(default_stage, items, $container) {
	//var VISUAL_CUBE_PATH = '//cube.crider.co.uk/visualcube.php?fmt=svg&';
	var VISUAL_CUBE_PATH = '//www.speedcubingtips.eu/visualcube/visualcube.php?fmt=svg&'
	//var VISUAL_CUBE_PATH = 'libs/vcube/visualcube.php';

	const triggersPattern = new RegExp(Object.keys(data.triggers).sort((a,b) => b.length - a.length).join('|'), "g")

	function renderCycle(arr) {
		return arr.map((val, i) => `U${val}U${arr[(i+1)%arr.length]}-s7-${val % 2 ? 'red' : 'blue'}`).join(",")
	}

	async function img_blob(url) {
		let response = await fetch(`https://cors.bridged.cc/https:${url}`)
		let blob = await response.blob()
		return blob; //URL.createObjectURL(blob);
	}

	async function convert_to_data(blob) {
		let fr = new FileReader();
		let result = new Promise((resolve, reject) => {
			fr.onload = evt => {
				resolve(evt.target.result)
			}
			fr.onerror = evt => {
				reject(evt)
			}
		})
		
		fr.readAsDataURL(blob)
		return result;
	}

	function renderImageAndMoves($container, { image, moves, image_comment, comment }) {
		var formula = Array.isArray(moves) ? moves[0] : moves;
		async function check_and_set(key, renderer)  {
			var value = localStorage.getItem(key);
			if (value !== null && !ignoreLocalStorage ) {
				return value;
			}
			value = await renderer(key);
			localStorage.setItem(key, value);
			return value;
		}
		
		const turns = ((image && image.stage) || default_stage) == 'pll' ? ["", " y", " y2", " y'"] : [""]
		const img_comments = (image_comment || '').split("|")
		let $images = $('<div class="images"></div>').appendTo($container)
		let images = turns.map((_, i) => {
			let $div = $(`<div class="image"></div>`).appendTo($images);
			let $image = $(`<img width="100" height="100"></img>`)
			$div.append($image)
			$div.append($(`<div class="image-comment">${(img_comments[i]||'').trim()}</div>`))
			/*$image.click(function () {
				setDemoAlgo(turns[i] + formula, $(this));
			});*/
			return $image[0];
		})

		let algo;
		let face; 
		let orbited = -1;

		turns.forEach((turn, i) => {
			let url = check_and_set(formula  + turn, async function() {
			try {
				algo = algo || parse(formula).inverted
				face = face || algo.permutation.faceU // we actually want to rotate back, visualcube 'case' argument does that
				//formula = algo.toMoves({string: true})
				let parameters = $.extend({
					stage: default_stage,
					view: p => (p.stage == 'f2l' || p.stage == 'pll' ? '' : 'plan'),
					fd: p => (p.stage == 'pll' ? 'uuuuuuuuurrroooooofffooooooooooooooollloooooobbboooooo' : ''),
					alg: (algo.toMoves({string: true}) + turn),
					bg: 't',
					ac: 'black',
					size: 100,
					arw: p => p.stage == 'pll' ? face.cycles().map(renderCycle).join(',') : ''
				}, image)

				let url = formatURL(VISUAL_CUBE_PATH, parameters);// + "?fmt=svg&size=100&ac=black&view=" + view + "&stage=" + stage + "&bg=t&case=" + encodeURIComponent(formula) + "&arw=" + encodeURIComponent(arrows);
				for (let j = orbited; j < i; j++) {
					face = face.counterOrbit;
				}
				orbited = i;
				if (!externalImages) {
					let blob = await img_blob(url)
					url = await convert_to_data(blob)

				}
				return url;
			} catch (e) {
				throw e
			}
			})
			url.then(url => {
				images[i].src = url
			})
		})

		let $subcontainer = $(`<div class="formulas"></div>`).appendTo($container) 
		let known = 'known';
		[].concat(moves).forEach(move => {
			// data-toggle="tooltip" data-placement="top" title="Tooltip on top"
			const htmlMove = move.replace(triggersPattern, match => `<span data-toggle="tooltip" data-placement="bottom" title="${data.triggers[match].moves}">${match}</span>`)
			let $move = $(`<span>${htmlMove}</span>`)
			$move.click(ev => {showAlgoDemo(move, $move)})
			$move.find('[data-toggle="tooltip"]').tooltip();
			const $div = $(`<div class="formula ${known}"></div>`)
			$div.append($move)
			$div.appendTo($subcontainer)
			known = '';
		})
		if (comment) {
			$subcontainer.append(`<div class="comment">${comment}</div>`)
		}
		const self = this
	}

	items.forEach(({ name, algs }) => {
		$container.append(`<li class="title">${name ? name : "<p>"}</li>`)
		algs.forEach(alg => {
			let $alg = $(`<li class="algo"></li>`).appendTo($container)
			$alg.append(`<div class="name">${alg.name ? alg.name : "<p>"}</name>`)
			if (alg.grouping) {
				alg.grouping.forEach(alg => renderImageAndMoves($alg, alg))
			} else {
				renderImageAndMoves($alg, alg);
			}
		});
	});

	$container.click(e => $(e.target).is('img') && 	$container.toggleClass('expand-images'))

}

await notationpeg.then(data => {
	try {
		let parser = pegjs.generate(data, {classes: classes});
		let cache = new LRU(200);
		parse = parse = function(algo) {
			algo = Array.isArray(algo) ? algo.join(' ') : algo
			try {
				return parser.parse(algo, {classes: classes});
			} catch(err) {
				console.log('algo', algo)
				throw err;
			}
		}
	} catch(e) {console.log(e);}
})

function lazyRender(default_stage, items, $container) {
	notationpeg.then(_ => renderItem(default_stage, items, $container))
}

$(document).one('show.bs.tab', '#nav-f2l-tab', _ => lazyRender('f2l', data.f2l, $('#nav-f2l ul.f2l')))

$(document).one('show.bs.tab', '#nav-oll2-tab', _ => lazyRender('oll', [data.oll1look, data.oll[0]], $('#nav-oll2 ul.oll')))

$(document).one('show.bs.tab', '#nav-oll-tab', _ =>  lazyRender('oll', data.oll, $('#nav-oll ul.oll')))

$(document).one('show.bs.tab', '#nav-pll-tab', _ => lazyRender('pll', data.pll, $('#nav-pll ul.pll')));

$(document).one('show.bs.tab', '#nav-pll2-tab', _ => lazyRender('pll', [data.pll[0], data.pll[1]], $('#nav-pll2 ul.pll')));

export {
	parse,
	cleanMarkup
}

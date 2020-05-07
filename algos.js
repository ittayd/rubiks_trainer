
algos = (function ($) {
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

	var dataSrc = window.location.hostname == 'localhost' ? (window.location.href.replace(window.location.pathname, '/algos-data.js')) : 'https://cdn.jsdelivr.net/gh/ittayd/rubiks_cube_html5/algos-data.js'
	var notationpeg = $.ajax('notation.pegjs')
	var data = $.when($.getScript(dataSrc), notationpeg)

	var parse;
	var classes = (function(){
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
					current = temp[current - base]
					if (current === undefined) throw "Array has indexes outside of the array"
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
				return this.cycles.reduce((lcm, cycle) => this.lcm(lcm, cycle.length))
			}

			get cycles() {return cycles(this.array)}

			static faceOrder = "ULFRBD".split("")
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

			toArray(normalize=false) {
				var result = [this.tl, this.tm, this.tr, this.el, this.em, this.er, this.bl, this.bm, this.br]
				if (normalize) {
					result = result.map(i => i - this.base);
				}
				return result
			}

			cycles(normalize = false) { // makes sense only for permutations that don't insert other face's indexes 
				return cycles(this.toArray(normalize), normalize ? 0 : this.base)
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
		with (Face) {
			Permutation.x = new Permutation([F, L.counter, D, R.clockwise, U.double, B.double])
			Permutation.y = new Permutation([U.clockwise, F, R, B, L, D.counter])
			Permutation.U = new Permutation([U.clockwise, L.top(F.top()), F.top(R.top()), R.top(B.top()), B.top(L.top()), D])
			Permutation.u = Permutation.U.then(new Permutation([U, L.equator(F.equator()), F.equator(R.equator()), R.equator(B.equator()), B.equator(L.equator()), D]))
		}

		with (Permutation) {
			Permutation.z = y.then(x.inverted).then(y.inverted)
			Permutation.L = z.then(U).then(z.inverted)
			Permutation.l = z.then(u).then(z.inverted)
			Permutation.F = x.then(U).then(x.inverted)
			Permutation.f = x.then(u).then(x.inverted)
			Permutation.R = z.inverted.then(U).then(z)
			Permutation.r = z.inverted.then(u).then(z)
			Permutation.B = x.inverted.then(U).then(x)
			Permutation.b = x.inverted.then(u).then(x)
			Permutation.D = x.then(x).then(U).then(x).then(x)
			Permutation.d = x.then(x).then(u).then(x).then(x)
			Permutation.M = r.inverted.then(R)
			Permutation.E = z.inverted.then(M)
			Permutation.S = y.then(M)
		}

		'ULFRBDulfrbd'.split('').forEach(p => Permutation[`{$p}2`] = Permutation[p].then(Permutation[p]))
		

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

			toMoves(options = {}) {
				if (this.amount == 0) return (options.string ? "" : [])
				if (this.isContainer(options)) {
					let containedArray = this.containedArray(this.amount < 0, options)
					if (options.string) {
						return containedArray.reduce((acc, val) => `${acc} ${val.toMoves(options)}`, "").repeat(Math.abs(this.amount))
					}
					let op = options.nested ? 'map' : 'flatMap'
					let result = new Array(Math.abs(this.amount)).fill(containedArray[op](s => s.toMoves(options)))
					return options.nested ? result : result.flat(Infinity)
				 } 
				 
				 return [this.toString()] 
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
				let containedArray = this.amount == 0 ? [] : this.containedArray(this.amount < 0, {})
				let p = containedArray.reduceRight((permutation, val) => permutation.composeWith(val.permutation), new Permutation())
				for(let i = 1; i < Math.abs(this.amount); i++) {
					p = p.then(p)
				}
				return p

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

			isContainer(options) {
				return false;
			}

			toString() {
				return `${this.outer ? this.outer + "-" : ""}${this.inner ? this.inner : ""}${this.character}${this.stringAmount}`
			}

			get permutation() {
				let p = Permutation[this.character]
				switch(this.amount) {
					case 1: return p
					case 2: return p.then(p)
					case -1: return p.inverted
				}
			}
		}

		class Trigger extends RepeatedUnit {
			constructor(name, amount) {
				if (!algos.triggers[name]) throw `Trigger ${name} is not registered`
				super(algos.triggers[name].order, amount)
				this.name = name;
			}

			get inverted() {
				var amount = -this.amount
				var name = algos.triggers[this.name].inverse
				if (amount > 0 || name === undefined) {
					name = this.name
				} else {
					amount = -amount // double inverse, since we have an inverse
				}
				return new Trigger(name, amount)
			}

			isContainer(options) {
				return !options.skipTriggers;
			}
			
			containedArray(invert, options) {
				return parse(algos.triggers[this.name].moves).containedArray(invert, options)
			}

			toString() {
				return `${name}${stringAmount}`
			}
		}

		class Sequence extends RepeatedUnit {
			constructor(sub, amount) {
				super(undefined, amount)
				this.sub = sub
			}

			get inverted() {
				if (this.amount == 1) 
					return new Sequence(this.containedArray(true));
				return new Sequence(this.sub, -this.amount)	
			}

			isContainer(options) {
				return true;
			}

			containedArray(invert, options) {
				if (!invert) return this.sub
				return this.sub.map(s => s.inverted).reverse()
			}

			toString(clean = true) {
				var str = `${this.sub.map(s => s.toString()).join(" ")}`
				if (clean && this.amount == 1) {
					return str;
				}
				return `(${str})${this.stringAmount}`
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

			isContainer(options) {
				return this.sequence.isContainer(options);
			}

			containedArray(invert, options) {
				return this.sequence.containedArray(invert, options)
			}

			toString(clean = false) {
				let substr = this.sequence.toString(clean)
				if (clean) return substr;
				return `<${this.name}>${substr}</${this.name}>`
			}
		}

		class Conjugate extends RepeatedUnit {
			constructor(a, b) {
				super()
				this.a = a;
				this.b = b;
			}

			get inverted() {
				return new Conjugate(this.a, this.b.inverted())
			}

			isContainer(options) {
				return true;
			}

			containedArray(invert, options) {
				return [a, invert ? b.inverted : b, a.inverted]
			}

			toString() {
				return `[${a.toString()}:${b.toString()}]`
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

			isContainer(options) {
				return true;
			}

			containedArray(invert, options) {
				a = invert ? this.b : this.a
				b = invert ? this.a : this.b
				return [a, b, a.inverted, b.inverted]
			}

			toString() {
				return `[${a.toString()},${b.toString()}]`
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
			Face: Face
		}
	})()

	notationpeg.done(data => {
		let parser = PEG.buildParser(data, {classes: classes});
		let cache = new LRU(200);
		parse = function(algo) {

			algo = Array.isArray(algo) ? algo.join(' ') : algo
			return parser.parse(algo, {classes: classes});
		}

		algos.parse = parse;
	})

	
	$(document).one('show.bs.tab', '#nav-f2l-tab', _ => renderItem('f2l', algos.f2l, $('#nav-f2l ul.f2l')))

	$(document).one('show.bs.tab', '#nav-oll2-tab', _ => renderItem('oll', [algos.oll1look, algos.oll[0]], $('#nav-oll2 ul.oll')))

	$(document).one('show.bs.tab', '#nav-oll-tab', _ =>  renderItem('oll', algos.oll, $('#nav-oll ul.oll')))

	$(document).one('show.bs.tab', '#nav-pll-tab', _ => renderItem('pll', algos.pll, $('#nav-pll ul.pll')));

	$(document).one('show.bs.tab', '#nav-pll2-tab', _ => renderItem('pll', [algos.pll[0], algos.pll[1]], $('#nav-pll2 ul.pll')));

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
		const cre = new RegExp("({[]})".split("").map(c => escapeRE(c)).join("|"), "g");
		algo = tags ? algo.replace(/<\/?[^>]*>/g, '') : algo
		algo = braces ? algo.replace(cre, ' ') : algo
		algo = spaces ? algo.replace(/\s+/g, ' ').trim() : algo
		return algo;
	}


	function setDemoAlgo(formula, obj) {
		rubik_cube.reset();
		var $formula = $j('#canvas_formula')
		$formula.html(formula);

		formula = algos.parse(formula)

		$formula.data('formula', formula)
		rubik_cube.move(formula.inverted.toMoves(), true);

		//var y_pos = $j(document.body).scrollTop();
		var y_pos = obj.offset().top - 50;
		$j('#div_canvas').show('fast').css('top', y_pos);
	}

	const ignoreLocalStorage = (new URL(document.location)).searchParams.has("clean")


	/*
		<li class="title">white on the top</li>
		<li class="algo">
			<div class="name">1 : </div>
			<div class="image"></div>
			<div class="formula">(R U R') F' U' F</div>
		</li>
	*/
	function renderItem(default_stage, items, $container) {
		//var VISUAL_CUBE_PATH = '//cube.crider.co.uk/visualcube.png';
		var VISUAL_CUBE_PATH = '//www.speedcubingtips.eu/visualcube/visualcube.php?fmt=gif&'
		//var VISUAL_CUBE_PATH = 'libs/vcube/visualcube.php';

		const triggersPattern = new RegExp(Object.keys(algos.triggers).sort((a,b) => b.length - a.length).join('|'), "g")

		function renderCycle(arr) {
			return arr.reduce((acc, val, i) => `${acc},U${val}U${arr[(i+1)%arr.length]}-s7-${val % 2 ? 'red' : 'blue'},`, '')
		}

		function renderImageAndMoves($container, { image, moves, comment }) {
			var formula = Array.isArray(moves) ? moves[0] : moves;
			function check_and_set(key, renderer)  {
				var value = localStorage.getItem(key);
				if (value !== null && !ignoreLocalStorage ) {
					return value;
				}
				value = renderer();
				localStorage.setItem(key, value);
				return value;
			}
			const turns = ((image && image.stage) || default_stage) == 'pll' ? ["", " y", " y2", " y'"] : [""]
			var img_urls = check_and_set(JSON.stringify([formula, image]), _ => {
				let algo = algos.parse(formula).inverted
				let face = algo.permutation.faceU // we actually want to rotate back, visualcube 'case' argument does that
				formula = algo.toMoves({string: true})
				return turns.map(turn =>  {
					let parameters = $.extend({
						stage: default_stage,
						view: p => (p.stage == 'f2l' || p.stage == 'pll' ? '' : 'plan'),
						fd: p => (p.stage == 'pll' ? 'uuuuuuuuurrroooooofffooooooooooooooollloooooobbboooooo' : ''),
						alg: (formula + turn),
						bg: 't',
						ac: 'black',
						size: 100,
						arw: p => p.stage == 'pll' ? face.cycles().map(renderCycle).join(',') : ''
					}, image)

					let url = formatURL(VISUAL_CUBE_PATH, parameters);// + "?fmt=svg&size=100&ac=black&view=" + view + "&stage=" + stage + "&bg=t&case=" + encodeURIComponent(formula) + "&arw=" + encodeURIComponent(arrows);
					face = face.counterOrbit;
					return url
				}).join("|");
			})
			img_urls = turns.length == 1 ? [img_urls] : img_urls.split("|");
			img_urls.forEach((url, i) => {
				$image = $(`<div class="image"></div>`).appendTo($container);
				$image.html(`<img src="${url}" loading="lazy" width="100" height="100"/>`).click(function () {
					setDemoAlgo(turns[i] + formula, $(this));
				});
			})
			var known = 'known';
			[].concat(moves).forEach(move => {
				// data-toggle="tooltip" data-placement="top" title="Tooltip on top"
				move = move.replace(triggersPattern, match => `<span data-toggle="tooltip" data-placement="bottom" title="${algos.triggers[match].moves}">${match}</span>`)
				let $move = $(`<span>${move}</span>`)
				$move.find('[data-toggle="tooltip"]').tooltip();
				$div = $(`<div class="formula ${known}"></div>`)
				$div.append($move)
				$div.appendTo($container).click(function () {
					setDemoAlgo(formula, $(this));
				});
				known = '';
			})
			if (comment) {
				$container.append(`<div class="comment">${comment}</div>`)
			}
		}

		items.forEach(({ name, algs }) => {
			$container.append(`<li class="title">${name ? name : "<p>"}</li>`)
			algs.forEach(alg => {
				$alg = $(`<li class="algo"></li>`).appendTo($container)
				$alg.append(`<div class="name">${alg.name ? alg.name : "<p>"}</name>`)
				if (alg.grouping) {
					alg.grouping.forEach(alg => renderImageAndMoves($alg, alg))
				} else {
					renderImageAndMoves($alg, alg);
				}
			});
		});
	}

	return {
		data: data,
		parse: parse,
		cleanMarkup: cleanMarkup
	}
})(jQuery)

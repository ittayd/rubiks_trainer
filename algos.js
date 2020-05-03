
algos = (function ($) {


	var dataSrc = window.location.hostname == 'localhost' ? (window.location.href.replace(window.location.pathname, '/algos-data.js')) : 'https://cdn.jsdelivr.net/gh/ittayd/rubiks_cube_html5/algos-data.js'
	var notationpeg = $.ajax('notation.pegjs')
	var data = $.when($.getScript(dataSrc), notationpeg)

	var parse;
	var classes = (function(){
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

			toArray(options = {}) {
				if (this.amount == 0) return []
				if (this.isContainer(options)) {
					return new Array(Math.abs(this.amount)).fill(this.containedArray(this.amount < 0, options).map(s => s.toArray(options)))
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
		}

		class Nop {
			get inverted() {
				return this;
			}

			toArray(options = {}) {
				return options.keepNop ? [toString()] : []
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
		}

		class Trigger extends RepeatedUnit {
			constructor(name, amount) {
				if (!algos.triggers[name]) throw `Trigger ${name} is not registered`
				super(algos.triggers[name].order, amount)
				this.name = name;
			}

			get inverted() {
				var amount = -this.amount
				var name = algos.triggers[name].inverse
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

			toString(noparen) {
				var str = `${this.sub.map(s => s.toString()).join(" ")}`
				if (noparen && this.amount == 1) {
					return str;
				}
				return `(${str})${this.stringAmount}`
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
			Sequence: Sequence,
			Conjugate: Conjugate,
			Commutator: Commutator,
			Comment: Comment,
			NewLine: NewLine,
			Pause: Pause
		}
	})()

	notationpeg.done(data => {
		let parser = PEG.buildParser(data, {classes: classes});
		
		parse = function(algo) {
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
		return `${base}?` + Object.entries(parameters).reduce((result, [key, value]) => {
			value = isFunction(value) ? value.apply(null, [parameters]) : value
			return `${result}${key}=${encodeURIComponent(value)}&`
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

		formula = cleanMarkup(formula)
		formula = algos.parse(formula)

		$formula.data('formula', formula)
		rubik_cube.move(formula.inverted.toArray().flat(Infinity), true);

		//var y_pos = $j(document.body).scrollTop();
		var y_pos = obj.offset().top - 50;
		$j('#div_canvas').show('fast').css('top', y_pos);
	}


	/*
		<li class="title">white on the top</li>
		<li class="algo">
			<div class="name">1 : </div>
			<div class="image"></div>
			<div class="formula">(R U R') F' U' F</div>
		</li>
	*/
	function renderItem(default_stage, items, $container) {
		var VISUAL_CUBE_PATH = 'https://cube.crider.co.uk/visualcube.php';
		//var VISUAL_CUBE_PATH = 'libs/vcube/visualcube.php';

		const triggersPattern = new RegExp(Object.keys(algos.triggers).sort((a,b) => b.length - a.length).join('|'), "g")
		function renderImageAndMoves($container, { image, moves, comment }) {
			var formula = Array.isArray(moves) ? moves[0] : moves;
			function check_and_set(key, renderer)  {
				var value = localStorage.getItem(key);
				if (value !== null) {
					return value;
				}
				value = renderer();
				localStorage.setItem(key, value);
				return value;
			}
			var img_url = check_and_set(JSON.stringify([formula, image]), _ => {
				formula = cleanMarkup(formula);
				formula = algos.parse(formula).toArray().flat(Infinity).join(" ");
				var parameters = $.extend({
					stage: default_stage,
					view: p => (p.stage == 'f2l' ? '' : 'plan'),
					case: formula,
					bg: 't',
					ac: 'black',
					size: 100,
					fmt: 'svg'
				}, image)
				return formatURL(VISUAL_CUBE_PATH, parameters);// + "?fmt=svg&size=100&ac=black&view=" + view + "&stage=" + stage + "&bg=t&case=" + encodeURIComponent(formula) + "&arw=" + encodeURIComponent(arrows);
			});
			$image = $(`<div class="image"></div>`).appendTo($container);
			$image.html(`<img src="${img_url}" loading="lazy" width="100" height="100"/>`).click(function () {
				setDemoAlgo(formula, $(this));
			});
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
		resolve: function(algo) {
			return parse(algo).toArray().flat(Infinity)
		},
		invert: function (algo, individual) {
			if (individual) throw "individual is not supported"
			return parse(algo).inverted.toArray().flat(Infinity)},
		cleanMarkup: cleanMarkup,
		data: data,
		parse: parse
	}
})(jQuery)


algos = (function ($) {

	function match(value, arr, defaultf) {
		for (let [predicate, func] of arr) {
			let matched = false;
			if (isFunction(predicate)) {
				matched = predicate(value)
			} else {
				matched = (predicate === value)
			}
			if (matched) {
				return func(value)
			}
		}
		return isFunction(defaultf) ? defaultf(value) : defaultf;
	}

	var isNumber = str => !/\D/.test(str);

	var isOpeningBrace = c => ["(", "[", "{"].includes(c)

	var isClosingBrace = c => [")", "]", "}"].includes(c)

	var isBrace = c => isClosingBrace(c) || isOpeningBrace(c)

	function matchingBrace(b) {
		const options = ["(", "[", "{", "}", "]", ")"]
		var idx = options.indexOf(b);
		var ridx = options.length - idx - 1;
		return options[ridx]
	}

	function escapeRE(s) {
		return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	};

	function split(algo) {
		const sre = new RegExp(`(${"({[]}) ".split("").map(c => escapeRE(c)).join("|")})`)
		return algo.split(sre).filter(c => c.length > 0)
	}

	function splitJoin(algo, func) {
		var asString = false;
		if (!Array.isArray(algo)) {
			asString = true;
			algo = split(algo)
		}

		var result = func(algo)

		return asString ? result.join('') : result

	}

	

	function invert(algo, individual) {
		function rev(m) {
			return match(m.slice(-1), [
				["'", _ => m.slice(0, -1)],
				[isNumber, c => match(c % 4, [
					[0, _ => m], // really nothing to do. E.g. U4
					[1, _ => m.slice(0, -1) + "'"],
					[2, _ => m],
					[3, _ => m.slice(0, -1)] // U3 is actually U'
				])],
				[isBrace, b => individual ? b : matchingBrace(b)],
				[" ", _ => m]],
				_ => m + "'"
			)
		}

		return splitJoin(algo, algo => {
			algo = algo.map(rev)
			return !individual ? algo.reverse() : algo;
		})
	}

	function resolveTriggers(algo) {
		function resolve(m) {
			if (m.length == 0) return []
			return match(m.slice(-1), [
				["'", _ => invert(resolve(m.slice(0, -1)))],
				[isNumber, c => {
					if (m.length == 2) return m;
					let repeat = parseInt(c)
					return new Array(repeat).fill(resolve(m.slice(0, -1))).flat();
				}],
				[isBrace, b => b],
				[" ", _ => " "]
			],
				_ => {
					let resolved = [m];
					let temp = algos.triggers[m]
					if (temp) {
						resolved = resolveTriggers(split(temp) )
					}
					return resolved;
				})
		}

		return splitJoin(algo, algo => algo.flatMap(resolve));
	};


	$(document).ready(_ => {
		/*renderCross();*/
		let src = window.location.hostname == 'localhost' ? (window.location.href.replace(window.location.pathname, '/algos-data.js')) : 'https://raw.githubusercontent.com/ittayd/rubiks_cube_html5/master/algos-data.js'
		$.getScript(src).done(_ => {
			renderF2L();
			renderOLL();
			renderPLL();
		})
	})


	function renderCross() {
		var items = $('ul.cross li.algo');
		renderItem('f2l', items);
	}
	function renderF2L() {
		renderItem('f2l', algos.f2l, $('#nav-f2l ul.f2l'));
	}

	function renderOLL() {
		renderItem('oll', [algos.oll1look, algos.oll[0]], $('#nav-oll2 ul.oll'));
		renderItem('oll', algos.oll, $('#nav-oll ul.oll'));
	}

	function renderPLL() {
		renderItem('pll', algos.pll, $('#nav-pll ul.pll'));
		renderItem('pll', [algos.pll[0], algos.pll[1]], $('#nav-pll2 ul.pll'));
	}


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

	function cleanMarkup(algo) {
		return algo.replace(/<\/?[^>]*>/g, '').replace(new RegExp("({[]})".split("").map(c => escapeRE(c)).join("|"), "g"), ' ');
	}


	function setDemoAlgo(formula, obj) {
		$j('#canvas_formula').html(formula);
		rubik_cube.reset();
		formula = cleanMarkup(formula)
		rubik_cube.move(resolveTriggers(invert(formula)), true);

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
			formula = cleanMarkup(formula);
			formula = resolveTriggers(formula);

			var parameters = $.extend({
				stage: default_stage,
				view: p => (p.stage == 'f2l' ? '' : 'plan'),
				case: formula,
				bg: 't',
				ac: 'black',
				size: 100,
				fmt: 'svg'
			}, image)
			var img_url = formatURL(VISUAL_CUBE_PATH, parameters);// + "?fmt=svg&size=100&ac=black&view=" + view + "&stage=" + stage + "&bg=t&case=" + encodeURIComponent(formula) + "&arw=" + encodeURIComponent(arrows);
			$image = $(`<div class="image"></div>`).appendTo($container);
			$image.html('<img src="' + img_url + '" loading="lazy"/>').click(function () {
				setDemoAlgo(formula, $(this));
			});
			var known = 'known';
			[].concat(moves).forEach(move => {
				// data-toggle="tooltip" data-placement="top" title="Tooltip on top"
				move = move.replace(triggersPattern, match => `<span data-toggle="tooltip" data-placement="bottom" title="${algos.triggers[match]}">${match}</span>`)
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
			/*
			var $item = $(this);
			var $images = $item.find('.image');
			$images.each(function () {
				var $image = $(this);
				var formula = $image.next().html();
				var parameters = $.extend({
					stage: default_stage,
					view: _ => {(stage == 'f2l' ? '' : 'plan')},
					case: formula,
					bg: 't', 
					ac: 'black',
					size: 100,
					fmt: 'svg'
				}, $image.attr())
				
				var img_url = formatURL(VISUAL_CUBE_PATH, parameters);// + "?fmt=svg&size=100&ac=black&view=" + view + "&stage=" + stage + "&bg=t&case=" + encodeURIComponent(formula) + "&arw=" + encodeURIComponent(arrows);
				$image.html('<img src="' + img_url + '" />').click(function () {
					setDemoAlgo(formula, $image);
				});
			});

			var $formulas = $item.find('.formula');
			$formulas.each(function () {
				var $formula = $(this);
				var formula = $formula.html();
				$formula.click(function () {
					setDemoAlgo(formula, $formula);
				});

			});*/
		});
	}

	return {
		resolveTriggers: resolveTriggers,
		invert: invert,
		cleanMarkup: cleanMarkup
	}
})(jQuery)

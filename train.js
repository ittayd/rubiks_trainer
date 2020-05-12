Train = (function() {
    function random(arr, probabilities) {
        if (! probabilities) {
            let i = Math.floor(Math.random() * arr.length);
            return arr[i]
        }

        var num = Math.random(),
            s = 0,
            lastIndex = probabilities.length - 1;

        for (var i = 0; i < lastIndex; ++i) {
            s += probabilities[i];
            if (num < s) {
                break;
            }
        }

        return arr[i];
    }

    function random_weight(algs, weight) {
        /* kludgy probability definition */
        let power = weight / 2.5  - 2
        let add = Math.pow(10, power)
        let weights = algs.map((a, i) => {
            i = algs.length - i - 1
            return 1/(i * add + 1)
        });
        let sum = weights.reduce((a,b) => a+b, 0)
        let last = weights[weights.length - 1]
        weights = weights.map(w => {
            return w * ((1*(sum + weights.length -1) - 1)/last) + 1
        })
        sum = weights.reduce((a,b) => a+b, 0)
        weights = weights.map(w => w / sum)
        return random(algs, weights)
    }

    function random_alg(group, $tip) {
        var alg = random(random(group).algs)
        tip(alg, $tip)
        return alg.moves
    }

    function tip(alg, elem) {
        elem = $(elem)
        if (!alg) {
            elem.val('')
            return
        }
        if (!alg.name) {
            return;
        }
        var val = elem.val();
        if (val && val.length > 0) {
            val += ", "
        } else {
            val = ''
        }
        val += alg.name
        elem.val(val)
    }


    
    
    class Train {
        constructor(control) {
            this.control = control;
            this.$move_idx = $('#move_idx') 
            this.$algo = $('#algo')
            this.current_idx = 0;
        
            let self = this;
            this.$algo.keyup(function(){
                self.all_moves = self.$algo.val();
            })

            $('#f2l-btn').click(_ => self.f2l_scramble())

			$('#oll-btn').click(_ => self.oll_scramble())
	
			algos.data.done(_ => {
				function renderSelect($select, coll) {
					$select = $($select)
					coll.forEach((group, gidx) => {
						$select.append($('<option>').val(gidx).text(group.name).addClass('opt-l1'));
						group.algs.forEach((alg, aidx) => {
							$select.append($('<option>').val(`${gidx}.${aidx}`).text(alg.name).addClass('opt-l2'));
						})
                    })
                    let id = $select.attr('id')

					$select.select2({
						templateResult: function (data) {    
							// We only really care if there is an element to pull classes from
							if (!data.element) {
							    return data.text;
							}

							var $element = $(data.element);

							var $wrapper = $('<span></span>');
							$wrapper.addClass($element[0].className);

							$wrapper.text(data.text);

							return $wrapper;
                        }
                    }).on('select2:select select2:unselect', function(e) {
                        let data = e.params.data
                        // checking if we have anyting stored in local storage
                        let s2options = localStorage.getItem(id) 
                        s2options = s2options ? JSON.parse(s2options) : [];
                     
                        // add / remove options
                        if (data.selected) {
                            s2options.push(data.id);
                        } else {
                            s2options = s2options.filter(id => id != data.id);
                        }
                         
                         // save selections to local storage
                         localStorage.setItem(id, JSON.stringify(s2options));
                     });


                    
					$select.on('select2:select', function (e) {
						var data = e.params.data;
						if (data.id < 0) {
							$select.val(data.id).trigger('change')
							$select.children().filter((i, e) => e.id != data.id).attr('disabled', 'disabled')
						}
					});

					$select.on('select2:unselect', function (e) {
						var data = e.params.data;
						if (data.id < 0) {
							$select.children().removeAttr('disabled')
						}
                    });

                    $select.on('select2:select', function(e){
                        var id = e.params.data.id;
                        var option = $(e.target).children(`[value="${id}"]`);
                        option.detach();
                        $(e.target).append(option).change();
                    });
                    
                    let init = localStorage.getItem(id);
                    if (init != null) {
                        $select.val(JSON.parse(init))
                        $select.trigger('change')
                    }
				}
				renderSelect('#pll-group', algos.pll);
				renderSelect('#oll-group', algos.oll)
			})
			$('#pll-btn').click(_ => self.pll_scramble())

			$('#full-btn').click(function(){
				$algo.val(all_moves);
			})

			$('#start-btn').click(function () {
				self.advance({ reset: true });

			})

			$('#back-btn').click(function () {
				self.advance({ delta: -1 })
			})

			self.$move_idx.change(function (event) {
				self.advance({ to: $(this).val(), jump: true })
			})

			$('#forward-btn').click(function () {
				self.advance({ delta: 1 })

			})

			$('#end-btn').click(function () {
				self.advance({ to: (self.$algo.val().split(' ').length), jump: true })
			})

			var reverseEleme = $('#reverse-text')
			$('#reverse-btn').click(function () {
				reverseElem.val(reverse(self.$algo.val()))
			})

            $('#do-btn').click(_ => self.doAlgo());
			$('#undo-btn').click(_ => self.undoAlgo());
			$('#reset-btn').click(_ => control.reset());
			$('#reposition-btn').click(_ => control.reposition());


        }


        advance({to = 0, delta = undefined, jump = false, reset = false} = {}) {
            var all_moves_arr = algos.cleanMarkup(this.all_moves, {tags: false}).split(' ')

            if (reset) {
                this.current_idx = all_moves_arr.length
                jump = true
            }

            if (delta !== undefined) {
                to = this.current_idx + delta
            }

            if (to < 0) 
                to = 0
            if (to >= all_moves_arr.length) 
                to = all_moves_arr.length

            if (delta === undefined) {
                delta = to - this.current_idx
            }

            if (to < 0) 
                to = 0
            
            if (to >= all_moves_arr.length) 
                to = all_moves_arr.length

            if (reset) {
                this.control.reset();
            }

            this.$move_idx.val(to)

            var partial = all_moves_arr.slice(Math.min(this.current_idx, to), Math.max(this.current_idx, to))
            partial = algos.parse(partial)
            if(delta < 0)
                partial = partial.inverted

            this.control.move(partial.toMoves(), jump ? true : false);

            this.current_idx = to;

            $(document).focus()

        }

        oll_scramble(algo) {
            tip(undefined, '#oll-tips')
            var pre_moves = random(['U ', "U' ", 'U2 ', ''])

            if (algo === undefined) {
                let selected = $('#oll-group').val();
                if (selected.length == 0) {
                    throw "No OLL selected"
                }
                switch(selected[0]) {
                    case '-3': {
                        let first = random(algos.oll1look.algs)
                        tip(first, '#oll-tips')
                        if (first.type === "none") {
                            pre_moves = ' '
                        }
                        let second = random(algos.oll[0].algs)
                        tip(second, '#oll-tips')
                        let interim_moves = random(['U ', "U' ", 'U2 ', ''])
                        algo = first.moves + " " + interim_moves + "/*" + second.name + "*/ " + second.moves
                        break;
                    }
                    case '-2':
                        algo = this.$algo.val();
                        break;
                    case '-1':
                        algo = random_alg(algos.oll, '#oll-tips');
                        break;
                    case NaN:
                        alert("could not parse selection");
                        break;
                    default: {
                        let algs = selected.flatMap(s => {
                            let [group, alg] = s.split('.').map(x => parseInt(x))
                            return algos.oll[group].algs.slice(alg, alg === undefined ? alg : (alg + 1));
                        })
                        let weight = parseInt($('#oll-weight').val())
                        algo = random_weight(algs, weight)
                        tip(algo, '#oll-tips')
                        algo = algo.moves
                    }
                }
            }

            var train_moves = pre_moves + algo 

            var moves = train_moves

            moves = moves + " " + this.pll_scramble();
            this.$algo.val(algos.cleanMarkup(train_moves, {braces: false}));
            this.all_moves = algos.cleanMarkup(moves, {braces: false});
            this.advance({reset: true})
            console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
            return this.all_moves;
        }

        pll_scramble(algo) {
            tip(undefined, '#pll-tips')
            var pre_moves = random(['U ', "U' ", 'U2 ', ''])

            if (algo === undefined) {
                let selected = $('#pll-group').val();
                if (selected.length == 0) {
                    return
                }
                switch(selected[0]) {
                    case '-3': { // 2look
                        let first = random(algos.pll[0].algs)
                        tip(first, '#pll-tips')
                        let second = random(algos.pll[1].algs)
                        tip(second, '#pll-tips')
                        let interim_moves = random(['U ', "U' ", 'U2 ', ''])
                        algo = first.moves + " " + interim_moves + second.moves
                        break;
                    }
                    case '-2':
                        algo = this.$algo.val();
                        break;
                    case '-1':
                        algo = random_alg(algos.pll, '#pll-tips');
                        break;
                    default: {
                        let algs = selected.flatMap(s => {
                            let [group, alg] = s.split('.').map(x => parseInt(x))
                            return algos.pll[group].algs.slice(alg, alg === undefined ? alg : (alg + 1));
                        })

                        let weight = parseInt($('#pll-weight').val())
                        algo = random_weight(algs, weight)
                        tip(algo, '#pll-tips')
                        algo = algo.moves
                    }
                }
            }

            var train_moves = pre_moves + algo  + random([' U', " U'", ' U2', ''])

            var moves = train_moves

            this.$algo.val(algos.cleanMarkup(train_moves, {braces: false}));
            this.all_moves = algos.cleanMarkup(moves, {braces: false});
            this.advance({reset: true})
            console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
            return this.all_moves;
        }

        f2l_scramble(algo) {
            var pre_moves = random(['U ', "U' ", 'U2 ', ''])

            if (algo === undefined) {
                let groupIdx = parseInt($('#f2l-group').find(":selected").val());
                switch(groupIdx) {
                    case -2:
                        algo = this.$algo.val();
                        break;
                    case -1:
                        algo = random_alg(algos.f2l, '#f2l-tips');
                        break;
                    case NaN:
                        alert("could not parse selection");
                        break;
                    default: {
                        let group = algos.f2l[groupIdx];
                        algo = random(group.algs).moves
                    }
                }
            }
            
            algo = algos.cleanMarkup(algo)

            var train_moves = pre_moves + algo

            var moves = train_moves + ' y '
            for (var i = 0; i < 3; i++) {
                if (true) {
                    moves = moves + '/*f2l*/ ' + random_alg(algos.f2l, '#f2l-tips')
                };
                moves = moves + " y "
            }
            moves = moves + " " + this.oll_scramble()
            this.$algo.val(algos.cleanMarkup(train_moves, {braces: false}));
            this.all_moves = algos.cleanMarkup(moves, {braces: false});
            this.advance({reset: true})
            console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
            return this.all_moves;
        }

        doAlgo() {
            let algo = algos.parse(this.$algo.val())
            algo = algo.toMoves()
            console.log('do', algo)
            this.control.move(algo)
        }

        undoAlgo() {
            let algo = algos.parse(this.$algo.val()).inverted
            algo = algo.toMoves()
            this.control.move(algo)
        }
    }

    return Train
})(jQuery)

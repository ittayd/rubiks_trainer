import $ from 'https://cdn.skypack.dev/jquery';
import * as algos from './algos.mjs'
import * as data from './algos-data.mjs'

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

function random_turn() {
    const turns = ['', 'U ', 'U2 ', "U' "]
    var turn = random(turns)
    return [turn, turns.indexOf(turn)]
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

function choose_alg(choices, type, previous_ref, pre_move_i) {
    let weight = parseInt($(`#${type}-weight`).val())
    let round = weight == -1

    let chosen;
    if (round) {
        previous_ref.i = (previous_ref.i + 1) % choices.length
        chosen = choices[previous_ref.i]
    } else {
        chosen = random_weight(choices, weight)
    }

    tip(chosen, `#${type}-tips`, ((-pre_move_i + 4) % 4)) // the comments are when moves are in reverse)

    return alg_move(chosen)
}

function alg_move(alg) {
    let moves = alg.moves
    return 	Array.isArray(moves) ? moves[0] : moves;
}

function random_alg(group, $tip) {
    var alg = random(random(group).algs)
    tip(alg, $tip)
    return alg
}

function tip(alg, elem, i) {
    elem = $(elem)
    if (!alg) {
        $('#algo').html('')
        elem.text('')
        elem.toggle(false)
        return
    }
    if (!alg.name) {
        return;
    }
    var val = elem.text();
    if (val && val.length > 0) {
        val += ", "
    } else {
        val = ''
    }
    val += alg.name + ((typeof i == "number") && alg.image_comment ? (' (' + alg.image_comment.split('|')[i].trim() + ')') : '')
    elem.text(val)
}


class Train {
    constructor(control) {
        this.control = control;
        this.$move_idx = $('#move_idx') 
        this.$algo = $('#algo')
        this.current_idx = 0;

        this.oll_choice = {i: -1}
        this.pll_choice = {i: -1}

        let self = this;
        this.$algo.keyup(function(){
            self.all_moves = self.algotext();
        })

        $('#f2l-btn').click(_ => self.f2l_scramble())

        $('#oll-btn').click(_ => self.oll_scramble())
        

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
                /* render items with the css class of the original */
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


            /* disable subitems of groups when they are selected and enable when they are unselected */
            $select.on('select2:select', function (e) {
                var data = e.params.data;
                if (data.id < 0) {
                    $select.val(data.id).trigger('change')
                    $select.children().filter((i, e) => e.id != data.id).attr('disabled', 'disabled')
                }
            }).on('select2:unselect', function (e) {
                var data = e.params.data;
                if (data.id < 0) {
                    $select.children().removeAttr('disabled')
                }
            });

            /* append options in the order of their choosing, not the order of appearing in the list */
            $select.on('select2:select', function(e){
                var id = e.params.data.id;
                var option = $(e.target).children(`[value="${id}"]`);
                option.detach();
                $(e.target).append(option).change();
            });
            
            let init = localStorage.getItem(id);
            if (init != null) {
                let options = JSON.parse(init);
                $select.val(options)
                /* options need to come in order of the json since this is how they are rendered (they don't appear in the drop down anyway, since they are selected) */
                options.forEach(id => {
                    let option = $select.children(`[value="${id}"]`);
                    option.detach();
                    $select.append(option)
                })
                $select.trigger('change')
            }
        }
        renderSelect('#pll-group', data.pll);
        renderSelect('#oll-group', data.oll);
        
        ['pll', 'oll'].forEach(type => {
            let id = `#${type}-weight`
            $(id).val(localStorage.getItem(id)).on('change', e => localStorage.setItem(id, $(e.target).val()))
        })

        $('#pll-btn').click(_ => self.pll_scramble())

        $('#full-btn').click(function(){
            self.$algo.html(self.all_moves);
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
            self.advance({ to: (algos.parse(self.train_moves).toMoves({keepTriggers: false}).length), jump: true })
        })

        $('#do-btn').click(_ => self.doAlgo());
        $('#undo-btn').click(_ => self.doAlgo(true));
        $('#reset-btn').click(_ => control.reset());
        $('#reposition-btn').click(_ => control.reposition());

        let $result = $('#result')

        $('#reverse-btn').click(_ => {
            $result.text(algos.parse(self.algotext()).inverted.toMoves({nested: true, keepTriggers: true, string:true}))
        })
        
        $('#order-btn').click(_ => {
            $result.text(algos.parse(self.algotext()).permutation.order)
        })
        'xyz'.split('').forEach(axis => {
            $(`#mirror-${axis}-btn`).click(_ => {
                $result.text(algos.parse(self.algotext()).mirror(axis).toString())
            })
            $(`#clockwise-${axis}-btn`).click(_ => {
                $result.text(algos.parse(self.algotext()).rotate(axis).toString())
            })
            $(`#counter-${axis}-btn`).click(_ => {
                $result.text(algos.parse(self.algotext()).rotate(axis, -1).toString())
            })
        })

        $('#copy-btn').click(_ => {
            self.$algo.text($result.text())
        })

        $('#f2l-tips-btn').click(_ => {$('#f2l-tips').toggle(true); self.$algo.html(self.train_moves)})
        $('#oll-tips-btn').click(_ => {$('#oll-tips').toggle(true); self.$algo.html(self.train_moves)})
        $('#pll-tips-btn').click(_ => {$('#pll-tips').toggle(true); self.$algo.html(self.train_moves)})


    }

    
    algotext() {
        return this.$algo.text().split('').map(char => char.charCodeAt(0)  == 160 ? ' ' : char).join('')
    }

    advance({to = 0, delta = undefined, jump = false, reset = false} = {}) {
        to = to ? parseInt(to) : 0;
        delta = delta === undefined ? delta : parseInt(delta)
        const all_moves_arr = algos.parse(this.all_moves).toMoves({keepTriggers: false})

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

        this.control.move(partial, jump ? true : false);

        this.current_idx = to;

        $(document).focus()

    }

    f2l_scramble(algo) {
        tip(undefined, '#f2l-tips')
        var pre_moves = random(['U ', "U' ", 'U2 ', ''])

        if (algo === undefined) {
            let groupIdx = parseInt($('#f2l-group').find(":selected").val());
            switch(groupIdx) {
                case -2:
                    algo = this.algotext();
                    break;
                case -1:
                    algo = alg_move(random_alg(data.f2l, '#f2l-tips'))
                    break;
                case NaN:
                    alert("could not parse selection");
                    break;
                default: {
                    let group = data.f2l[groupIdx];
                    algo = alg_move(random(group.algs))
                }
            }
        }
        
        algo = algos.cleanMarkup(algo)

        var train_moves = pre_moves + algo

        var moves = train_moves + ' y '
        for (var i = 0; i < 3; i++) {
            if (true) {
                moves = moves + '/*f2l*/ ' + alg_move(random_alg(data.f2l, '#f2l-tips'))
            };
            moves = moves + " y "
        }
        moves = moves + " " + this.oll_scramble()
        this.train_moves = algos.cleanMarkup(train_moves, {braces: false});
        this.all_moves = algos.cleanMarkup(moves, {braces: false});
        this.advance({reset: true})
        console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
        return this.all_moves;
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
                    let first = random(data.oll1look.algs)
                    tip(first, '#oll-tips')
                    if (first.type === "none") {
                        pre_moves = ' '
                    }
                    let second = random(data.oll[0].algs)
                    tip(second, '#oll-tips')
                    let interim_moves = random(['U ', "U' ", 'U2 ', ''])
                    algo = alg_move(first) + " " + interim_moves + "/*" + second.name + "*/ " + alg_move(second)
                    break;
                }
                case '-2':
                    algo = this.algotext();
                    break;
                case '-1':
                    algo = alg_move(random_alg(data.oll, '#oll-tips'))
                    break;
                case NaN:
                    alert("could not parse selection");
                    break;
                default: {
                    let algs = selected.flatMap(s => {
                        let [group, alg] = s.split('.').map(x => parseInt(x))
                        return data.oll[group].algs.slice(alg, alg === undefined ? alg : (alg + 1));
                    })
                    let weight = parseInt($('#oll-weight').val())
                    algo = random_weight(algs, weight)
                    tip(algo, '#oll-tips')
                    algo = alg_move(algo)
                }
            }
        }

        var train_moves = pre_moves + algo 

        var moves = train_moves

        moves = moves + " " + this.pll_scramble();
        this.train_moves = algos.cleanMarkup(train_moves, {braces: false});
        this.all_moves = algos.cleanMarkup(moves, {braces: false});
        this.advance({reset: true})
        console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
        return this.all_moves;
    }

    pll_scramble(algo) {
        tip(undefined, '#pll-tips')
        var [pre_moves, pre_move_i] = random_turn();

        if (algo === undefined) {
            let selected = $('#pll-group').val();
            if (selected.length == 0) {
                return
            }
            switch(selected[0]) {
                case '-3':  // 2look
                    let first = random(data.pll[0].algs)
                    tip(first, '#pll-tips')
                    let second = random(data.pll[1].algs)
                    tip(second, '#pll-tips')
                    let interim_moves = random(['U ', "U' ", 'U2 ', ''])
                    algo = alg_move(first) + " " + interim_moves + alg_move(second)
                    break;
                case '-2': // random
                    algo = alg_move(random_alg(data.pll, '#pll-tips'))
                    break;
                case '-1': // algorithm from input box
                    algo = this.algotext();
                    break;
                default: { // from multi-selected algorithms
                    let algs = selected.flatMap(s => {
                        let [group, alg] = s.split('.').map(x => parseInt(x))
                        return data.pll[group].algs.slice(alg, alg === undefined ? alg : (alg + 1));
                    })

                    algo = choose_alg(algs, 'pll', this.pll_choice, pre_move_i)
                }
            }
        }

        var train_moves = pre_moves + algo  + random([' U', " U'", ' U2', ''])

        var moves = train_moves

        this.train_moves = algos.cleanMarkup(train_moves, {braces: false});
        this.all_moves = algos.cleanMarkup(moves, {braces: false});
        this.advance({reset: true})
        console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
        return this.all_moves;
    }

    doAlgo(inverted) {
        let algo = algos.parse(this.algotext())
        if (inverted) {
            algo = algo.inverted
        }
        let fast = $('#fast-chk').is(":checked");
        this.control.move(algo, fast)
    }
}

export default Train

import $ from 'https://cdn.skypack.dev/jquery';
import * as algos from './algos.mjs'
import * as data from './algos-data.mjs'
import {Collapse} from 'https://cdn.skypack.dev/bootstrap@5.0.1';

import bootstrapStarRating from 'https://cdn.skypack.dev/bootstrap-star-rating';
import theme from 'https://cdn.skypack.dev/bootstrap-star-rating/themes/krajee-uni/theme.js';




$.fn.visible = function() {
    return this.css('visibility', 'visible');
};

$.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

$.fn.visibilityToggle = function() {
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};

function shuffle(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

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

// weigh algorithms according to rating. assumption is that most algorithms are known (start with 1, add another, practive, add another etc.)
function random_weight(algs) {
    let ratings = algs.map(algo => parseInt(localStorage.getItem(alg_id(algo)) || 1));

    // per rating r, what is the comulative count of algos with rating >= r. So if there's an algorithm with a rating of '1' and 5 with rating of '5', counts will be 
    // 6 for the first algorithm and 5 for the others. Basically for the first algorithm, the count is how many algorithms there are that have its rating or above (6)
    let counts = ratings.reduce((counts, rating) => {counts[rating] = (counts[rating] || 0) + 1; return counts}, Array(6).fill(0))
                        .reduceRight((acc, count, rating) => {acc[rating] = count + (acc[rating + 1] || 0); return acc}, [])
    
    // the weight is 1 for known algorithms (rating of 5) and the count for others. So for 4 rating algorithm, it'll be the number of '5' algorithms plus
    // the number of '4' algorithms.                         
    let weights = ratings.map(rating => rating == 5 ? 1 : counts[rating])
    
    let sum = weights.reduce((a,b) => a+b, 0)
    weights = weights.map(w => w / sum)

    return random(algs, weights)
}

function alg_id(algo) {
    return algo.id || algo.name
}

function choose_alg(choices, type, pre_move_i) {
    let chosen = random_weight(choices) 
    
    tip(chosen, `#${type}-tips`, ((-pre_move_i + 4) % 4)) // the comments are when moves are in reverse)

    let id = alg_id(chosen)

    $(`#${type}-rating`)
        .rating('update', id ? (localStorage.getItem(id) || 0) : 0)
        .off('rating:change')
        .on('rating:change', (event, value, caption) => {
            localStorage.setItem(id, value);
        });

    return alg_move(chosen);
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
        elem.invisible(false)
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

        this.$algo.keyup(_ => this.all_moves = this.algotext())

        function renderSelect($select, coll) {
            $select = $($select)
            coll.forEach((group, gidx) => {
                $select.append($('<option>').val(gidx).text(group.name).addClass('opt-l1'));
                group.algs.forEach((alg, aidx) => {
                    if (alg.name) {
                        $select.append($('<option>').val(`${gidx}.${aidx}`).text(alg.name).addClass('opt-l2'));
                    }
                })
            })
            let id = $select.attr('id')

            $select.select2({
                width: 'style',
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
                },
                sorter: data => {
                    return data.sort((a1,a2) =>  {
                        const arr1 = a1.id.split('.')
                        const arr2 = a2.id.split('.')
                        if (arr1[0] - arr2[0] != 0) { // assume these are numbers
                            return arr1[0] - arr2[0];
                        }
                        if (arr1[1] === undefined) {
                            return -1
                        }
                        if (arr2[1] === undefined) {
                            return 1
                        }
                        return arr1[1] - arr2[1]
                    })
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
                    $select.val(data.id).change() // remove others
                    $select.children().filter((i, e) => e.value != data.id).attr('disabled', 'disabled')
                }
                if (data.id.indexOf('.') == -1) {
                    $select.children().filter((i, e) => e.value != data.id && e.value.split('.')[0] == data.id).attr('disabled', 'disabled')
                }
            }).on('select2:unselect', function (e) {
                var data = e.params.data;
                if (data.id < 0) {
                    $select.children().removeAttr('disabled')
                }
                if (data.id.indexOf('.') == -1) {
                    $select.children().filter((i, e) => e.value != data.id && e.value.split('.')[0] == data.id).removeAttr('disabled')
                }
            });

            /* append options in the order of their choosing, not the order of appearing in the list */
            $select.on('select2:select', function(e){
                var id = e.params.data.id;
                var option = $(e.target).children(`[value="${id}"]`);
                $(this).append(option).change();
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
                    if (id.indexOf('.') == -1) {
                        $select.children().filter((i, e) => e.value != id && e.value.split('.')[0] == id).attr('disabled', 'disabled')
                    }
                })


                $select.trigger('change')
            }
        }
        function persist(id) {
            $(id).val(localStorage.getItem(id)).on('change', e => localStorage.setItem(id, $(e.target).val())) 
        }

        $('#f2l-btn').click(_ => this.f2l_scramble())

        $('#oll-btn').click(_ => this.oll_scramble());
        

        $('#pll-btn').click(_ => this.pll_scramble())

        renderSelect('#f2l-group', data.f2l);
        renderSelect('#pll-group', data.pll);
        renderSelect('#oll-group', data.oll);
        
        persist('#f2l-cnt')

        $('.collapse').each((i, e) => {
            const $e = $(e)
            const id = $e.attr('id');
            const $collapse = Collapse.getInstance(e) || new Collapse(e, {toggle: false})
            const state = localStorage.getItem(id)
            if (state == 'hide') $collapse.hide()
            if (state == 'show') $collapse.show()
            $e.on('show.bs.collapse hide.bs.collapse', ev => {
                localStorage.setItem(id, ev.type)
            })
        })

        $('#full-btn').click(_ => {
            this.$algo.html(this.all_moves);
        })

        $('#start-btn').click(_ => {
            this.advance({ reset: true });

        })

        $('#back-btn').click(_ => {
            this.advance({ delta: -1 })
        })

        this.$move_idx.change(_ => {
            this.advance({ to: $(this).val(), jump: true })
        })

        $('#forward-btn').click(_ => {
            this.advance({ delta: 1 })

        })

        
        $('#end-btn').click(_ => {
            this.advance({ to: (algos.parse(this.train_moves).toMoves({keepTriggers: false}).length), jump: true })
        })

        $('#do-btn').click(_ => this.doAlgo());
        $('#undo-btn').click(_ => this.doAlgo(true));
        $('#reset-btn').click(_ => control.reset());
        $('#reposition-btn').click(_ => control.reposition());

        let $result = $('#result')

        $('#atomic-btn').click(_ => {
            $result.text(algos.parse(this.algotext()).toMoves({nested: true, keepTriggers: false, string:true}))
        })
        $('#reverse-btn').click(_ => {
            $result.text(algos.parse(this.algotext()).inverted.toMoves({nested: true, keepTriggers: true, string:true}))
        })
        
        $('#order-btn').click(_ => {
            $result.text(algos.parse(this.algotext()).permutation.order)
        })
        'xyz'.split('').forEach(axis => {
            $(`#mirror-${axis}-btn`).click(_ => {
                $result.text(algos.parse(this.algotext()).mirror(axis).toString())
            })
            $(`#clockwise-${axis}-btn`).click(_ => {
                $result.text(algos.parse(this.algotext()).rotate(axis).toString())
            })
            $(`#counter-${axis}-btn`).click(_ => {
                $result.text(algos.parse(this.algotext()).rotate(axis, -1).toString())
            })
        })

        $('#copy-btn').click(_ => {
            this.$algo.text($result.text())
        })

        $('#f2l-tips-btn').click(_ => {$('#f2l-tips').visible(); this.$algo.html(this.train_moves)})
        $('#oll-tips-btn').click(_ => {$('#oll-tips').visible(); this.$algo.html(this.train_moves)})
        $('#pll-tips-btn').click(_ => {$('#pll-tips').visible(); this.$algo.html(this.train_moves)})


    }

    
    algotext() {
        return this.$algo.text().split('').map(char => char.charCodeAt(0)  == 160 ? ' ' : char).join('')
    }

    advance({to = 0, delta = undefined, jump = false, reset = false} = {}) {
        if (!this.all_moves) return;
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
        const algotext = this.algotext()

        tip(undefined, '#f2l-tips')
        var pre_moves = random(['U ', "U' ", 'U2 ', ''])

        if (algo === undefined) {
            let groupIdx = parseInt($('#f2l-group').find(":selected").val());
            switch(groupIdx) {
                case -2:
                    algo = alg_move(random_alg(data.f2l, '#f2l-tips'))
                    break;
                case -1:
                    algo = algotext
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

        var moves = train_moves
        for (var i = 4 - $('#f2l-cnt').val(); i < 3; i++) {
            moves += ' y /*f2l*/ ' + alg_move(random_alg(data.f2l, '#f2l-tips'))
        }

        const remainingTurns = [undefined, " ", " y' ", " y2 ", " y "][$('#f2l-cnt').val()]
        moves += remainingTurns + this.oll_scramble()
        this.train_moves = algos.cleanMarkup(train_moves, {braces: false});
        this.all_moves = algos.cleanMarkup(moves, {braces: false});
        this.advance({reset: true})
        console.log('algo: ' + algo + ',train: ' + train_moves + ', all: ' + this.all_moves);
        return this.all_moves;
    }

    oll_scramble(algo) {
        const algotext = this.algotext()

        tip(undefined, '#oll-tips')
        var [pre_moves, pre_move_i] = random_turn();

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
                    algo = alg_move(random_alg(data.oll, '#oll-tips'))
                    break;
                case '-1':
                    algo = algotext;
                    break;
                case NaN:
                    alert("could not parse selection");
                    break;
                default: {
                    let algs = selected.flatMap(s => {
                        let [group, alg] = s.split('.').map(x => parseInt(x))
                        return data.oll[group].algs.slice(alg, alg === undefined ? alg : (alg + 1)).map(a => Array.isArray(a) ? a[0] : a);
                    })
                    algo = choose_alg(algs, 'oll', pre_move_i)

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
        const algotext = this.algotext()
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
                    algo = algotext;
                    break;
                default: { // from multi-selected algorithms
                    let algs = selected.flatMap(s => {
                        let [group, alg] = s.split('.').map(x => parseInt(x))
                        return data.pll[group].algs.slice(alg, alg === undefined ? alg : (alg + 1)).map(a => Array.isArray(a) ? a[0] : a);
                    })

                    algo = choose_alg(algs, 'pll', pre_move_i)
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

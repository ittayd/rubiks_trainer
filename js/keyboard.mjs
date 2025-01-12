import $ from './jquery-global.mjs'
import * as algos from './algos.mjs'

var nop = event => { }
    
class Keyboard {
    constructor(train, control) {
        this.control = control;
        this.move = ''
        this.$algo =  $('#rubik_cube3_algo')

        var handlers = new Proxy({}, {
            get: function (object, property) {
                var result = object['__default__']
    
                //console.log(`has own property _${property}_ : ${object.hasOwnProperty(property)} => ${object[property]}`)
                while (object.hasOwnProperty(property)) {
                    result = object[property]
                    if (typeof result != "string") {
                        break;
                    }
                    property = result
                }
                return result;
            }
        });
    
    
        $.extend(handlers, {
            "Escape": event => this.update_move(),
            "Backspace": event => this.update_move(this.move.slice(0, -1)),
            "Shift": nop,
            "Control": nop,
            "Alt": nop,
            "CapsLock": nop,
            " ": event => {
                switch (this.move) {
                    case "P": train.pll_scramble(); this.update_move(); break;
                    case "O": train.oll_scramble(); this.update_move(); break;
                    case "T": train.f2l_scramble(); this.update_move(); break;
                    case "TP":  $('#pll-tips-btn').click(); this.update_move(); break;
                }
                if (this.move.length > 0) {
                    let move = this.move
                    try {
                        this.control.move(algos.parse(move).toMoves());
                        this.update_move()
                    } catch (e) {
                        console.log("Exception ", move, e);
                        $('#keyboard').html(`<span class="yellow-fade">${$('#keyboard').text()}</span>`)
                    }
                }
                return false;
            },
            "Enter": " ",
            "ArrowLeft": event => {if (!event.altKey) {train.advance(event.shiftKey ? { reset: true } : { delta: -1 });return false;}},
            "ArrowRight": event => {if (!event.altKey) {train.advance(event.shiftKey ? { to: (this.$algo.val().split(' ').length), jump: true } : { delta: 1 }); return false;}},
            "__default__": event => {
                if (event.key == 'u' && event.ctrlKey) {
                    this.update_move()
                    return false;
                } 
                this.update_move(this.move + event.key)
                return false
            }
        })

        
        var self = this;
        $('body').keydown(function (event) {
            if (event.target.nodeName == 'INPUT') {
                return true;
            }

            if (typeof(handlers[event.key]) !== "function") {
                console.log('handlers', event.key, handlers[event.key]);
            }
            var result = handlers[event.key].call(self, event)
            if ((typeof result) == "boolean") {
                if (!result) event.preventDefault()
                return result
            }
            return true;
        })
    
    }

    update_move(move) {
        this.move = move || '';
        $('#keyboard').text(this.move)
    }
}

export default Keyboard;
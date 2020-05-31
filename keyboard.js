Keyboard = (function ($) {

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
                        property = object[result]
                    }
                    return result;
                }
            });
        
        
            $.extend(handlers, {
                "Escape": event => this.move = '',
                "Shift": nop,
                "Control": nop,
                "Alt": nop,
                "CapsLock": nop,
                " ": event => {
                    switch (this.move) {
                        case "P": train.pll_scramble(); this.move = ''; break;
                        case "O": train.oll_scramble(); this.move = ''; break;
                        case "T": train.f2l_scramble(); this.move = ''; break;
                        case "TP":  $('#pll-tips-btn').click(); this.move = ''; break;
                    }
                    if (this.move.length > 0) {
                        let move = this.move
                        this.move = ''
                        try {
                            this.control.move(algos.parse(move).toMoves());
                        } catch (e) {
                            console.log("Exception ", e);
                            this.control.wobble();
                        }
                    }
                    this.move = '';
                    return !(event.target == document.body);
                },
                "Enter": " ",
                "ArrowLeft": event => {if (!event.altKey) train.advance(event.shiftKey ? { reset: true } : { delta: -1 })},
                "ArrowRight": event => {if (!event.altKey) train.advance(event.shiftKey ? { to: (this.$algo.val().split(' ').length), jump: true } : { delta: 1 })},
        
                "__default__": event => this.move += event.key
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
                    return result
                }
                return true;
            })
        
        }
    }
    return Keyboard
})(jQuery)

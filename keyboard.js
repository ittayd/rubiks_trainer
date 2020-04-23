(function ($) {
    var move = ''

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


    var nop = event => { }
    $.extend(handlers, {
        "Escape": event => move = '',
        "Shift": nop,
        "Control": nop,
        " ": event => {
            switch (move) {
                case "P": pll_scramble(); move = ''; break;
                case "O": oll_scramble(); move = ''; break;
                case "T": f2l_scramble(); move = ''; break;
            }
            /*
            let do_reverse = false;
            let do_individual = false;
            switch(move.slice(-1)) {
                case '"': do_individual = true; // fall through
                case "'": do_reverse = true; move = move.slice(0, -1); break;
            }

            switch(move) {
                case "sex": move = "R U R'"; break;
                case "sexy": move = "R U R' U'"; break;
            }

            if (do_reverse) {
                move = reverse(move, do_individual);
            }
            */
            if (move.length > 0) {
                cube.move(algos.resolveTriggers(move));
            }
            move = '';
            return !(event.target == document.body);
        },
        "Enter": " ",
        "ArrowLeft": event => control.advance(event.shiftKey ? { reset: true } : { delta: -1 }),
        "ArrowRight": event => control.advance(event.shiftKey ? { to: (algo_elem.val().split(' ').length), jump: true } : { delta: 1 }),

        "__default__": event => move += event.key
    })

    $(document).ready(_ =>
        $('body').keydown(function (event) {
            if (event.target.nodeName == 'INPUT') {
                return true;
            }
            // console.log(`key is _${event.key}_`)
            var result = handlers[event.key](event)
            if ((typeof result) == "boolean") {
                return result
            }
            return true;
        })
    )
})(jQuery)
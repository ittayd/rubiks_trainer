import './jquery-global.mjs'
import bootstrap from 'https://cdn.skypack.dev/bootstrap';
import $ from 'https://cdn.skypack.dev/jquery';
import select2 from 'https://cdn.skypack.dev/select2';
select2(undefined, $);
import jqueryStickytabs from 'https://cdn.skypack.dev/jquery-stickytabs';

import Train from './train.mjs';
import Control from './three-control.mjs';
import Keyboard from './keyboard.mjs'
import Buttons from './buttons.mjs';

$(document).ready(function () {
    /*
    rubik_cube = new RubikCube('canvas', 3, null, null, 600);
    rubik_cube.reset();

    rubik_cube3 = new RubikCube('canvas3', 3, null, null, 600);
    rubik_cube3.reset();*/
    $('.nav-tabs').stickyTabs();


    var control = new Control()
    control.init().then(_ => {
        var train = new Train(control)
        var keybaord = new Keyboard(train, control)
        var buttons = new Buttons(control)
    })
    
    $(document).click(e => {
        if($(e.target).is(':button,:checkbox')) {  
            document.activeElement.blur()
        }
        return true;
    })

    $('#undo-move-btn').click(_ => control.undo())
    $('#redo-move-btn').click(_ => control.redo())

    let $algo = $('#algo')
    let sp = new URLSearchParams(window.location.search)
    let algo = sp.get('algo')
    if (algo !== null) {
        $algo.html(algo);
        control.move(algo, {fast: true})
    }

    $algo.bind('keydown keypress keyup ', e => e.stopPropagation());
    $algo.keypress(e =>  e.which != 13);


    $(':button').mouseup(function() { this.blur() })
});
    
    


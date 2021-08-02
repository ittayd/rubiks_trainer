import $ from './jquery-global.mjs'
import * as data from './algos-data.mjs'
import * as algos from './algos.mjs'

class Buttons {
    constructor(control) {
        this.control = control
        $(document).ready(_ => {
            this.render_moves()
            this.render_triggers()
            $("#triggers").click(e => 
                this.control.move(algos.parse($(e.target).val()).toMoves())
            )
            
            $("#moves").click(e => 
                this.control.move([$(e.target).val()])
            )	
        })
    }
    
    render_triggers() { 
        var tbl_body = $('<tbody>');
        var odd_even = false;
        $.each(data.triggers, function(k, v) {
            var tbl_row = $('<tr>').appendTo(tbl_body);						
            tbl_row.addClass(odd_even ? "odd" : "even");
            odd_even = !odd_even;               

            $('<td>').append($('<input type="button" class="btn btn-mine btn-sm">').val(k)).appendTo(tbl_row);
            $('<td>').text(v.moves).appendTo(tbl_row);
            $('<td>').text(v.inverse || "").appendTo(tbl_row);
                    
        });
        $("#triggers").append(tbl_body);
    }

    /** TODO: button to toggle extended move buttons which should also toggle the negative margin (in index.html) so it doesn't go over the cube */
    render_moves(extended = true) {
        let render_base = (base, lower) => {
            let a = move => $('<input type="button" class="btn btn-mine btn-sm">').val(move)[0]
            let row = base => [a(base), a(base + "'"), a(base + "2")]
            return [row(base).concat(lower ? (typeof(lower) == "boolean" ? row(base.toLowerCase()) : row(lower)) : [])]
        }
        let array = "ULFRBD".split("").flatMap(move => render_base(move, true)).
            concat(["Mx", "Ey", "Sz"].map(s => s.split("")).flatMap(moves => render_base(moves[0], moves[1])))
        array = array[0].map((col, i) => array.map(row => row[i])); // transpose
        array = array.reduce((tbody, row) => tbody.append(row.reduce((tr, move) => tr.append($('<td>').append(move)), $('<tr>'))), $('<tbody>'))
        $("#moves").append(array)
    }
}

export default Buttons;

Buttons = (function($){
    class Buttons {
        constructor(contrl) {
            this.control = control
            $(document).ready(_ => {
                render_moves()
                render_triggers()
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
        render_moves(extended = false) {
            let render_base = (base, lower) => {
                let a = move => $('<input type="button" class="btn btn-mine btn-sm">').val(move)[0]
                let row = base => [a(base), a(base + "'"), a(base + "2")]
                return [row(base).concat(lower ? row(base.toLowerCase()) : [])]
            }
            let array = "xyz".split("").flatMap(move => render_base(move, false))
            if (extended) {
                array = "ULFRBD".split("").flatMap(move => render_base(move, true)).
                    concat("MES".split("").flatMap(move => render_base(move, false))).
                    concat(array)
            }
            array = array[0].map((col, i) => array.map(row => row[i])); // transpose
            array = array.reduce((tbody, row) => tbody.append(row.reduce((tr, move) => tr.append($('<td>').append(move)), $('<tr>'))), $('<tbody>'))
            $("#moves").append(array)
        }
    }


    
    return Buttons
})($)
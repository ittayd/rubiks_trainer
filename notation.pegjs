start = SEQUENCE

NUMBER = characters:[0-9]+ { return parseInt(characters.join(""), 10); }

AMOUNT = repetition:NUMBER "'" { return -repetition; }
       / NUMBER
       / "'" { return -1; }

ATOMIC_MOVE = character:[LRUDFBMESlrudfbmesxyz] { return character; }

ATOMIC = move:ATOMIC_MOVE { return new options.classes.Atomic(move); }
       / innerLayer:NUMBER move:ATOMIC_MOVE { return new options.classes.Atomic(move, innerLayer); }
       / outerLayer:NUMBER "-" innerLayer:NUMBER move:ATOMIC_MOVE { return new options.classes.Atomic(move, innerLayer, outerLayer); }
       
TRIGGER = character:[_A-Za-z] characters:[_A-Za-z]+ { return new options.classes.Trigger([character].concat(characters).join("")); }
	   
BLOCK_MOVE = trigger:TRIGGER { return trigger; }
           / atomic:ATOMIC { return atomic; }
           

REPEATABLE_UNIT = BLOCK_MOVE
                // We parse commutators/conjugates together to reduce branching.
                / "[" a:SEQUENCE separator:[,:] b:SEQUENCE "]" { return (separator === "," ? new options.classes.Commutator(a, b) : new options.classes.Conjugate(a,b)); }
                / [(\[{}] nestedSequence:SEQUENCE [)\]}] { return nestedSequence; }

REPEATED_UNIT = repeatable_unit:REPEATABLE_UNIT amount:AMOUNT { repeatable_unit.amount = amount; return repeatable_unit; }
              / repeatable_unit:REPEATABLE_UNIT { repeatable_unit.amount = 1; return repeatable_unit; }

COMMENT = "//" body:[^\n\r]* { return new options.classes.Comment(body.join("")); }
        / "/*" body:[^*\n\r]* "*/" { return new options.classes.Comment(body.join("")); }

ANNOTATION = [\n\r] { return new options.classes.NewLine(); }
           / "." { return new options.classes.Pause(); }
           / COMMENT

SEGMENT_PART = REPEATED_UNIT
             / ANNOTATION
/*
SEGMENT = segment_part:SEGMENT_PART segment:SEGMENT { return [segment_part].concat(segment); }
        / segment_part:SEGMENT_PART { return [segment_part]; }
*/
UNIT_LIST = segment:SEGMENT_PART [ ]+ unit_list:UNIT_LIST { return [segment].concat(unit_list); }
          / segment:SEGMENT_PART { return [segment]; }

SEQUENCE = [ ]* unit_list:UNIT_LIST [ ]* { return new options.classes.Sequence(unit_list); }
         / [ ]* { return new options.classes.Sequence([]); }
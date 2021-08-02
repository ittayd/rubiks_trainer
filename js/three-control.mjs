import $ from './jquery-global.mjs'
import ThreeCube from './three-cube.mjs'
import * as algos from './algos.mjs'


const translations = {
}

const axes = {
    x: 0,
    y: 1,
    z: 2
}

const layers = {
    first: [0],
    second: [1],
    third: [2],
    all: [0,1,2]
}

const turns = {
    counter: 1,
    clockwise: -1,
}

class Move {
  constructor(axis, layers, turns) {
    this.axis = axis;
    this.layers = layers;
    this.turns = turns
  }

  applyTo(cube, options) {
    cube.rotate(this.axis, this.turns, this.layers, options)
  }

  applyInverseTo(cube, options) {
    cube.rotate(this.axis, -this.turns, this.layers, options)
  }
}

class Reset {
  constructor(moves) {
    this.moves = moves
  }

  applyTo(cube, options) {
    options = $.extend({duration:0}, options)
    cube.reset(options);
  }

  applyInverseTo(cube, options) {
    options = $.extend({duration:0}, options)
    this.moves.forEach(m => m.applyTo(cube, options)) // apply all moves from last reset to get to the state before this one
  }

}

function addTranslation(letter, wide, axis, layers, angle) {
    translations[letter] = new Move(axis, layers, angle)
    translations[letter + "'"] = new Move(axis, layers, -angle)
    translations[letter + "2"] = new Move(axis, layers, angle * 2)
    translations[letter + "2'"] = new Move(axis, layers, -angle * 2)
    translations[letter + "'2"] = new Move(axis, layers, -angle * 2)
    if (wide) {
        addTranslation(letter.toLowerCase(), false, axis, [...layers, 1], angle)
    }
}

addTranslation("L", true, axes.x, layers.first, turns.clockwise);
addTranslation("R", true, axes.x, layers.third, turns.counter);
addTranslation("D", true, axes.y, layers.first, turns.clockwise);
addTranslation("U", true, axes.y, layers.third, turns.counter);
addTranslation("B", true, axes.z, layers.first, turns.clockwise);
addTranslation("F", true, axes.z, layers.third, turns.counter);
addTranslation("M", false, axes.x, layers.second, turns.clockwise);
addTranslation("E", false, axes.y, layers.second, turns.clockwise);
addTranslation("S", false, axes.z, layers.second, turns.counter);
addTranslation("x", false, axes.x, layers.all, turns.counter);
addTranslation("y", false, axes.y, layers.all, turns.counter);
addTranslation("z", false, axes.z, layers.all, turns.counter);

  
class ThreeControl {
    #cube
    #moves = []
    #undoIndex = -1;
    #resetIndexes = []
    #rotateAllBtn

    constructor(container, options = {mirror: true, rotateAllBtn: undefined}) {   
      this.#cube = new ThreeCube($(container), options)
      $(this.#cube).on('cube:rotation', this.#rotated.bind(this))
      $(this.#cube).on('cube:reset', this.#resetted.bind(this))
      if (options.rotateAllBtn) {
        this.#rotateAllBtn = options.rotateAllBtn
        this.#rotateAllBtn.click(_ => {
          this.#cube.rotateAll = !this.#cube.rotateAll
          this.#rotateAllBtn.toggleClass('collapsed')
        })
      }
    }

    reset({clearUndo = false} = {}) {
      if (clearUndo) {
        this.#moves = []
        this.#undoIndex = -1
        this.#resetIndexes = []
      }
      this.#cube.reset({trigger: !clearUndo});
    }

    move(moves, quiet = false) {
        if (typeof moves == "string") {
            moves = algos.parse(moves)                    
        }

        if (typeof moves == "object" && ! Array.isArray(moves)) {
            moves = moves.toMoves() // assuming parsed algorithm tree
        }

        moves = moves.map(m => translations[m]);

        let options = quiet ? {duration: 0} : (moves.length == 1 ? undefined : {duration: 0.4})

        moves.forEach(m => m.applyTo(this.#cube, options))
    }

    undo() {
      if (this.#undoIndex == -1) return;
      this.#moves[this.#undoIndex--].applyInverseTo(this.#cube, {trigger: false})
    }

    redo() {
      if (this.#undoIndex == this.#moves.length - 1) return
      this.#moves[++this.#undoIndex].applyTo(this.#cube, {trigger: false})
    }

    #clearRedo() {
      this.#moves.splice(this.#undoIndex + 1, this.#moves.length - this.#undoIndex - 1)
      this.#undoIndex = this.#moves.length - 1
      for(let i = this.#resetIndexes.length - 1; i > -1; i--) {
        if(this.#resetIndexes[i] > this.#undoIndex) {
          this.#resetIndexes.splice(i, 1);
        }
      }
    }

    #rotated(ev, axis, turns, layers) {
      this.#clearRedo();
      this.#moves.push(new Move(axis, layers, turns))
      this.#undoIndex++
      if (this.#cube.rotateAll && layers.length == 3) {
        this.#cube.rotateAll = false;
        this.#rotateAllBtn.toggleClass('collapsed')
      }
    }

    #resetted(ev) {
      this.#clearRedo();
      this.#moves.push(new Reset(this.#moves.slice(this.#resetIndexes[this.#resetIndexes.length - 1] + 1)))
      this.#undoIndex++
      this.#resetIndexes.push(this.#undoIndex);
    }

}

export default ThreeControl

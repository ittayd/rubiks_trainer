import $ from 'https://cdn.skypack.dev/jquery';
import ThreeCube from './three-cube.mjs'

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

  applyTo(cube) {
    cube.rotate(this.axis, this.turns, this.layers)
  }

  applyInverseTo(cube) {
    cube.rotate(this.axis, -this.turns, this.layers)

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

  
let cube = await new ThreeCube($('#three-cube')).load();

class ThreeControl {
    #moves = []
    #undoIndex = -1;
    #doing;

    constructor() {
      $(cube).on('cube:rotation', this.#rotated.bind(this))
    }

    async load() {
      
    }

    reset() {
        cube.reset();
        this.#moves = []
    }

    move(moves, quiet = false) {
        if (typeof moves == "string") {
            moves = algos.parse(moves)                    
        }

        if (typeof moves == "object" && ! Array.isArray(moves)) {
            moves = moves.toMoves() // assuming parsed algorithm tree
        }

        moves = moves.map(m => translations[m]);

        let options = quiet ? {duration: 0} : (moves.length == 1 ? undefined : {duration: 1})

        moves.forEach(m => m.applyTo(cube))
    }

    undo() {
      if (this.#undoIndex == -1) return;
      this.#doing = true
      this.#moves[this.#undoIndex--].applyInverseTo(cube)
      this.#doing = false
    }

    redo() {
      if (this.#undoIndex == this.#moves.length - 1) return
      this.#doing = true
      this.#moves[++this.#undoIndex].applyTo(cube)
      this.#doing = false
    }

    #rotated(ev, axis, turns, layers) {
      if (this.#doing) return;
      this.#moves.splice(this.#undoIndex + 1, this.#moves.length - this.#undoIndex - 1)
      this.#moves.push(new Move(axis, layers, turns))
      this.#undoIndex = this.#moves.length - 1
    }

}

export default ThreeControl

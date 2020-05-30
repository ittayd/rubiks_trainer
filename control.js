Control = (function() {

    // horrible looking implementation, but gets mouse and touch movements right...
    Randelshofer = (function(){
        const translations = {
        }

        const axes = {
            x: 0,
            y: 1,
            z: 2
        }

        const masks = {
            first: 1,
            second: 2,
            third: 4,
            all: 7
        }

        const angles = {
            counter: 1,
            clockwise: -1,
        }

        function addTranslation(letter, wide, axis, layersMask, angle) {
            translations[letter] = cube => cube.transform(axis, layersMask, angle)
            translations[letter + "'"] = cube => cube.transform(axis, layersMask, -angle)
            translations[letter + "2"] = cube => cube.transform(axis, layersMask, angle * 2)
            translations[letter + "2'"] = cube => cube.transform(axis, layersMask, -angle * 2)
            translations[letter + "'2"] = cube => cube.transform(axis, layersMask, -angle * 2)
            if (wide) {
                addTranslation(letter.toLowerCase(), false, axis, layersMask + 2, angle)
            }
        }

        addTranslation("L", true, axes.x, masks.first, angles.clockwise);
        addTranslation("R", true, axes.x, masks.third, angles.counter);
        addTranslation("D", true, axes.y, masks.first, angles.clockwise);
        addTranslation("U", true, axes.y, masks.third, angles.counter);
        addTranslation("B", true, axes.z, masks.first, angles.clockwise);
        addTranslation("F", true, axes.z, masks.third, angles.counter);
        addTranslation("M", false, axes.x, masks.second, angles.clockwise);
        addTranslation("E", false, axes.y, masks.second, angles.clockwise);
        addTranslation("S", false, axes.z, masks.second, angles.counter);
        addTranslation("x", false, axes.x, masks.all, angles.counter);
        addTranslation("y", false, axes.y, masks.all, angles.counter);
        addTranslation("z", false, axes.z, masks.all, angles.counter);

        const waitFor = async (condFunc) => {
            return new Promise((resolve) => {
              if (condFunc()) {
                resolve();
              }
              else {
                setTimeout(async () => {
                  await waitFor(condFunc);
                  resolve();
                }, 400);
              }
            });
        };
          
        
          
        class Randelshofer {
            constructor() {
                const myFunc = async () => {
                    await waitFor(() => {
                        let $canvas = $('.virtualcube')
                        
                        return ($canvas.length > 0 && 
                            $canvas[0].virtualcube && 
                            $canvas[0].virtualcube.canvas3d && 
                            $canvas[0].virtualcube.canvas3d.cube) 
                    });

                    this.virtualcube = $('.virtualcube')[0].virtualcube;
                    this.canvas3d = this.virtualcube.canvas3d
                    this.canvas3d.wobble = function() {}
                    
                    let original = this.canvas3d.handler.onMouseMove;
                    this.canvas3d.handler.onMouseMove = function(event) {
                      if (this.isCubeSwipe) {
                        original.call(this, event);
                      }
                    }
                };

                myFunc();
                

            }

            reset() {
                this.canvas3d.reset();
            }

            reposition() {
                let c = this.canvas3d;
                c.currentAngle = 0;
                c.xRot = c.cube3d.attributes.xRot;
                c.yRot = c.cube3d.attributes.yRot;
                c.rotationMatrix.makeIdentity();
                c.smoothRotationFunction = null;
                c.repaint();
            }

            move(moves, quiet = false) {
                if (typeof moves == "string") {
                    moves = algos.parse(moves)                    
                }

                if (typeof moves == "object" && ! Array.isArray(moves)) {
                    moves = moves.toMoves() // assuming parsed algorithm tree
                }

                var self = this.canvas3d
                if (quiet) {
                    let f = function () {
                      self.cube.cancel = true;
                      if (self.cube3d.isTwisting) {
                        self.repaint(f);
                        return;
                      }
                      self.cube3d.repainter = null;
                      moves.forEach(move => {
                        translations[move](self.cube)
                      })
                      self.cube3d.repainter = this;
                      self.cube.cancel = false;
                    };
                    self.repaint(f);
                    return;
                }
                
                let owner = new Object();
                let next = 0;
                let f = function () {
                    if (!self.cube.lock(owner)) {
                      self.repaint(f);
                      return;
                    }
                    if (self.cube3d.isTwisting) {
                      self.repaint(f);
                      return;
                    }
                    /*
                    if (next == 0) {
                      self.cube3d.attributes.twistDuration = self.cube3d.attributes.userTwistDuration;
                    }*/
                    if (self.cube.cancel) {
                      next = moves.length;
                    }
                    if (next < moves.length) {
                      translations[moves[next]](self.cube);
                      next++;
                      self.repaint(f);
                    } else {/*
                      self.cube3d.attributes.twistDuration = self.cube3d.attributes.userTwistDuration;*/
                      self.cube.unlock(owner);
                    }
                  };
                  self.repaint(f);
            }

        }

        return Randelshofer
    })()

    return Randelshofer;
})()
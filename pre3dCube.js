
// https://github.com/deanm/pre3d
// http://www.francocube.com/js/cubeApplet.js


/*
TODO:
 - border 	: ajouter une bordure noire autour de chaque piece
 - arrondit : arrondir les coins du cube
 - anim 	: afficher/gerer la liste des mouvements + play/lecture/prev/next
 - mouse 	: gerer des mouvements de pieces avec la souris
 - pop 		: fonction pour poper le cube + unpop/reassemble
*/

(function () {
	
	/* == RubikCube == */
	var RubikCube = function (dom_obj_name, nb_pieces_width, piece_width, piece_margin, anim_duration) {
		var pieces 				= [];
		var animations_queue	= [];
		var mouvements_done		= [];
		var animations_running 	= false;
		var display_axes		= false;
		
		var cube_config = {
			nb_pieces_width		: nb_pieces_width || 3,
			piece_width			: piece_width || .5,
			piece_margin		: piece_margin || 0.05,
			anim_duration		: anim_duration === undefined ? 300 : anim_duration,
			nb_frames_per_sec 	: 20,
			is_void_cube	 	: false,
			colors				: [
				new Pre3d.RGBA(.54, 0, 0.06, 1),			// red
				new Pre3d.RGBA(0, .20, .45, 1),			// blue
				new Pre3d.RGBA(1, .27, 0, 1),		// orange
				new Pre3d.RGBA(0, .45, .18, 1), 		// green
				new Pre3d.RGBA(1, .82, 0, 1),			// yellow
				new Pre3d.RGBA(1, 1, 1, 1),			// black.white
				/*new Pre3d.RGBA(0, 0, 0, 1),*/			// black.white
			],
		};
		
		var span_info;
		var dom_obj = document.getElementById(dom_obj_name);
		if (dom_obj.tagName == 'CANVAS') {
			var screen_canvas = dom_obj;
		}else{
			var canvas = document.createElement('canvas');
			var container_width = dom_obj.style.width || 150;
			var container_height = dom_obj.style.height || 150;
			canvas.setAttribute('height', container_height);
			canvas.setAttribute('width', container_width);
			dom_obj.appendChild(canvas);
			dom_obj.style.textAlign = 'center';
			
			var span_info = document.createElement('span');
			span_info.innerHTML = '';
			dom_obj.appendChild(span_info);
			
			var screen_canvas = canvas;
		}
		var renderer = new Pre3d.Renderer(screen_canvas);
		
		
		var resetCube = function () {
			pieces 				= [];
			animations_queue	= [];
			mouvements_done		= [];
			animations_running 	= false;
		
			buildCube();
			renderCubeDemoCamera();
			renderCube();
		};
		
		
		var buildCube = function () {
			// creer et attache les 26 pieces au cube
			
			var is_void_cube = cube_config.is_void_cube;
			var mid_void = (cube_config.nb_pieces_width-1) / 2;
			
			for (var x=0; x<cube_config.nb_pieces_width; x++) {
				var position_x = x - (cube_config.nb_pieces_width/2);
				
				for (var y=0; y<cube_config.nb_pieces_width; y++) {
					var position_y = y - (cube_config.nb_pieces_width/2);
					
					for (var z=0; z<cube_config.nb_pieces_width; z++) {
						var position_z = z - (cube_config.nb_pieces_width/2);
						if (z > 0 && y > 0 && x > 0 && z < cube_config.nb_pieces_width-1 && y < cube_config.nb_pieces_width-1 && x < cube_config.nb_pieces_width-1) continue;
						if (is_void_cube) {
							if ((z==0 && x==mid_void && y==mid_void) ) continue;
							if ((z==cube_config.nb_pieces_width-1 && x==mid_void && y==mid_void) ) continue;
							if ((x==0 && z==mid_void && y==mid_void) ) continue;
							if ((x==cube_config.nb_pieces_width-1 && z==mid_void && y==mid_void) ) continue;
							if ((y==0 && x==mid_void && z==mid_void) ) continue;
							if ((y==cube_config.nb_pieces_width-1 && x==mid_void && z==mid_void) ) continue;
						}
						//console.log("tr", position_x, position_y, position_z);
						
						
						var piece = new RubikPiece(x, y, z, cube_config);
						piece.setFacesColors();
						piece.build();
						piece.translate(position_x, position_y, position_z);
						pieces.push(piece);
					}
					
				}
			}
			
			renderer.camera.focal_length = 1/cube_config.nb_pieces_width * 17;
			//renderer.fill_rgba = new Pre3d.RGBA(.5, .5, .5, 1);
			
		};
		
		
		var renderCube = function () {
			
			var line_width = 1;
			
			// (re)draw the pieces
			var piece, piece_geometry;
			
			renderer.emptyBuffer();
			
			renderer.quad_callback = function (quad_face, quad_index, shape) {
				//console.log(quad_face, quad_index, shape);
				if (piece.position.y == 0 && piece.position.x == Math.floor(cube_config.nb_pieces_width/2) && piece.position.z == Math.floor(cube_config.nb_pieces_width/2)) {
					//renderer.texture = texinfo1;
				}
				return piece.setFaceColorCallback(renderer, quad_face, quad_index, shape);
			}
			
			//renderer.ctx.setStrokeColor(0, 0, 0, 0);
			//renderer.ctx.setLineWidth(3);
			
			var nb_pieces = pieces.length;
			for (var i = 0; i < nb_pieces; i++) {
				piece			= pieces[i];
				piece_geometry 	= piece.geometry();
				
				renderer.fill_rgba = piece_geometry.color;
				renderer.transform = piece_geometry.trans;
				renderer.bufferShape(piece_geometry.shape, true);
			}
			
			renderer.quad_callback = null;
			
			// (re)draw the background
			if (true) {
				renderer.ctx.setFillColor(1, 1, 1, 1);
			}else{
				renderer.ctx.setFillColor(0, 0, 0, 1);
			}
			renderer.drawBackground();

			
			// draw axes
			if (display_axes) {
				var axes =  [
					{ //axis
						shape: Pre3d.ShapeUtils.makeBox(10, 0.01, 0.01),
						color: new Pre3d.RGBA(0, 0, 0, 0.5),
						trans: new Pre3d.Transform()
					},
					{//axis
						shape: Pre3d.ShapeUtils.makeBox(0.01, 10, 0.01),
						color: new Pre3d.RGBA(0, 0, 0, 0.5),
						trans: new Pre3d.Transform()
					},
					{//axis
						shape: Pre3d.ShapeUtils.makeBox(0.01, 0.01, 10),
						color: new Pre3d.RGBA(0, 0, 0, 0.5),
						trans: new Pre3d.Transform()
					}
				];
				renderer.quad_callback = null;
				for (var i = 0; i < axes.length; ++i) {
					var axe = axes[i];
					renderer.fill_rgba = axe.color;
					renderer.transform = axe.trans;
					renderer.bufferShape(axe.shape);
				}
			}
			
			// draw pieces
			renderer.drawBuffer(line_width);
			
		}
		
		
		var renderCubeDemoCamera = function () {
			DemoUtils.autoCamera(renderer, 0, 0, -40, 0.50, -0.7, 0, renderCube);
		};
		
		
		
		var layers_piece_callback = {
			up		: function (piece, nb_layer, offset) {return (piece.position.y >= cube_config.nb_pieces_width-nb_layer-offset && piece.position.y < cube_config.nb_pieces_width-offset);},
			down	: function (piece, nb_layer, offset) {return (piece.position.y < nb_layer + offset && piece.position.y >= offset);},
			left	: function (piece, nb_layer, offset) {return (piece.position.x < nb_layer + offset && piece.position.x >= offset);},
			right	: function (piece, nb_layer, offset) {return (piece.position.x >= cube_config.nb_pieces_width-nb_layer-offset && piece.position.x < cube_config.nb_pieces_width-offset);},
			front	: function (piece, nb_layer, offset) {return (piece.position.z >= cube_config.nb_pieces_width-nb_layer-offset && piece.position.z < cube_config.nb_pieces_width-offset);},
			back	: function (piece, nb_layer, offset) {return (piece.position.z < nb_layer + offset && piece.position.z >= offset);},
		};
		
		
		var getLayerPieces = function (layer_name, nb_layer, offset) {
			nb_layer = nb_layer || 1;
			offset = offset || 0;
			
			var return_pieces = [];
			var layer_callback = layers_piece_callback[layer_name];
			if (layer_callback) {
				for (var i=0, l=pieces.length; i<l; i++) {
					if (layer_callback(pieces[i], nb_layer, offset)) return_pieces.push(pieces[i]);
				}
			}else{
				// unlnown layer
			}
			return return_pieces;
		}
		
		
		
		/* ######### ROTATIONS ######### */

		var rotations = {
			"L":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('left', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: cube_config.nb_pieces_width-1 - old_position.z, z: old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move)	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*Math.PI/2, 0, 0); },
			},
			"L'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('left', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: old_position.z, z: cube_config.nb_pieces_width-1 - old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*-Math.PI/2, 0, 0); },
			},
			"l":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('left', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: cube_config.nb_pieces_width-1 - old_position.z, z: old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move)	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*Math.PI/2, 0, 0); },
			},
			"l'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('left', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: old_position.z, z: cube_config.nb_pieces_width-1 - old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*-Math.PI/2, 0, 0); },
			},
			"R":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('right', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: old_position.z, z: cube_config.nb_pieces_width-1 - old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*-Math.PI/2, 0, 0); },
			},
			"R'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('right', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: cube_config.nb_pieces_width-1 - old_position.z, z: old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*Math.PI/2, 0, 0); },
			},
			"r":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('right', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: old_position.z, z: cube_config.nb_pieces_width-1 - old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*-Math.PI/2, 0, 0); },
			},
			"r'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('right', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: cube_config.nb_pieces_width-1 - old_position.z, z: old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*Math.PI/2, 0, 0); },
			},
			
			"U":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('up', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.z, y: old_position.y, z: old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*-Math.PI/2, 0); },
			},
			"U'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('up', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.z, y: old_position.y, z: cube_config.nb_pieces_width-1 - old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*Math.PI/2, 0); },
			},
			"u":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('up', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.z, y: old_position.y, z: old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*-Math.PI/2, 0); },
			},
			"u'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('up', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.z, y: old_position.y, z: cube_config.nb_pieces_width-1 - old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*Math.PI/2, 0); },
			},
			"D":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('down', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.z, y: old_position.y, z: cube_config.nb_pieces_width-1 - old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*Math.PI/2, 0); },
			},
			"D'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('down', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.z, y: old_position.y, z: old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*-Math.PI/2, 0); },
			},
			"d":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('down', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.z, y: old_position.y, z: cube_config.nb_pieces_width-1 - old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*Math.PI/2, 0); },
			},
			"d'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('down', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.z, y: old_position.y, z: old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*-Math.PI/2, 0); },
			},
			
			"F":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('front', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.y, y: cube_config.nb_pieces_width-1 - old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*-Math.PI/2); },
			},
			"F'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('front', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.y, y: old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*Math.PI/2); },
			},
			"f":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('front', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.y, y: cube_config.nb_pieces_width-1 - old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*-Math.PI/2); },
			},
			"f'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('front', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.y, y: old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*Math.PI/2); },
			},
			"B":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('back', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.y, y: old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*Math.PI/2); },
			},
			"B'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('back', nb_layer, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.y, y: cube_config.nb_pieces_width-1 - old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*-Math.PI/2); },
			},
			"b":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('back', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.y, y: old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*Math.PI/2); },
			},
			"b'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('back', 2, offset); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.y, y: cube_config.nb_pieces_width-1 - old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*-Math.PI/2); },
			},
			
			"M":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('right', nb_layer, 1); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: cube_config.nb_pieces_width-1 - old_position.z, z: old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*Math.PI/2, 0, 0); },
			},
			"M'":  {
				getPieces		: function (nb_layer, offset) 	{ return getLayerPieces('right', nb_layer, 1); },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: old_position.z, z: cube_config.nb_pieces_width-1 - old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*-Math.PI/2, 0, 0); },
			},
			
			"x":  {
				getPieces		: function () 					{ return pieces; },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: old_position.z, z: cube_config.nb_pieces_width-1 - old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*-Math.PI/2, 0, 0); },
			},
			"x'":  {
				getPieces		: function () 					{ return pieces; },
				updateMatrix	: function (old_position) 		{ return { x: old_position.x, y: cube_config.nb_pieces_width-1 - old_position.z, z: old_position.y }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, nb_move*Math.PI/2, 0, 0); },
			},
			"y":  {
				getPieces		: function () 					{ return pieces; },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.z, y: old_position.y, z: old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*-Math.PI/2, 0); },
			},
			"y'":  {
				getPieces		: function () 					{ return pieces; },
				updateMatrix	: function (old_position) 		{ return { x: old_position.z, y: old_position.y, z: cube_config.nb_pieces_width-1 - old_position.x }; },
				updateRender	: function (move_pieces, anim_duration, nb_move) 	{ rotatePieceAnim(move_pieces, anim_duration, 0, nb_move*Math.PI/2, 0); },
			},
			"z":  {
				getPieces		: function () 					{ return pieces; },
				updateMatrix	: function (old_position) 		{ return { x: old_position.y, y: cube_config.nb_pieces_width-1 - old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move)	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*-Math.PI/2); },
			},
			"z'":  {
				getPieces		: function () 					{ return pieces; },
				updateMatrix	: function (old_position) 		{ return { x: cube_config.nb_pieces_width-1 - old_position.y, y: old_position.x, z: old_position.z }; },
				updateRender	: function (move_pieces, anim_duration, nb_move)	{ rotatePieceAnim(move_pieces, anim_duration, 0, 0, nb_move*Math.PI/2); },
			},
			
		};
		
		
		var rotatePiece = function (piece, rotate_x, rotate_y, rotate_z) {
			var piece_geometry = piece.geometry();
			
			renderer.transform = piece_geometry.trans;
			//renderer.transform.reset();
			if (rotate_x !== undefined && rotate_x != 0) renderer.transform.rotateX(rotate_x);
			if (rotate_y !== undefined && rotate_y != 0) renderer.transform.rotateY(rotate_y);
			if (rotate_z !== undefined && rotate_z != 0) renderer.transform.rotateZ(rotate_z);
			renderer.bufferShape(piece_geometry.shape);
		};
		
	
		var rotatePieceAnim = function (move_pieces, duration, rotate_x, rotate_y, rotate_z) {
			var nb_pieces			= move_pieces.length;
			var nb_frames_per_sec 	= cube_config.nb_frames_per_sec;
			var nb_frames 			= nb_frames_per_sec * duration / 1000;
			var index_frames 		= 0;
			var rotate_x_tmp = (rotate_x / nb_frames);
			var rotate_y_tmp = (rotate_y / nb_frames);
			var rotate_z_tmp = (rotate_z / nb_frames);
			
			var anim_ts_start 	= new Date()*1 ;
			var anim_ts_end		= anim_ts_start + duration;
			
			
			function animLoop() {
				for (var i=0; i<nb_pieces; i++) {
					rotatePiece(move_pieces[i], rotate_x_tmp, rotate_y_tmp, rotate_z_tmp);
				}
				renderCube();
				if (index_frames < nb_frames-1) {
					// continue...
					var now	= new Date()*1 ;
					var remaining_time = anim_ts_end - now;
					var remaining_nb_frames = nb_frames - index_frames;
					setTimeout(animLoop, remaining_time/remaining_nb_frames);
					index_frames++;
					
				}else{
					// finish
					
					// run others/next animations
					animations_running = false;
					runAnimations();
				}
			}
			
			animLoop();
		};
		
		var runAnimations = function () {
			if (animations_running) return;
			var anim;
			if (anim = animations_queue.shift()) {
				animations_running = true;
				anim();
			}
		};
		
		var doInvert = function (mouvements) {
			return mouvements.reverse().map(m => {
				if (m.slice(-1) == "'")
					return m.slice(0, -1)

				// last character is a number
				if (!isNaN(m.slice(-1))) {
					if (m.length == 2) {
						switch (m.slice(-1) % 4) {
							case "0": return m; // really nothing to do. E.g. U4
							case "1": return m.slice(0, -1) + "'"
							case "2": return m;
							case "3": return m.slice(0, -1); // U3 is actually U'
						}
					} 
					return (doInvert([m.slice(0, -1)])[0] + m.slice(-1))
				}					

				return m + "'"
			})
		};

		var namedMoves = {
			"Sexy": "R U R' U'",
			"FatSexy": "r U R' U'",
			"Ugly": "U R U' R'",
			"Sledge": "R' F R F'",
			"FatSledge": "r' F R F'",
			"Hedge": "F R' F' R",
			"Su": "R U R' U",
			"Pull": "R U R'",
			"Push": "R U' R'",
			"Super": "R U2 R'",
			"Upward": "R U' R",
			"Downward": "R' U R'",

		};

		var resolveNamedMoves = function (mouvements) {
			return mouvements.flatMap(m => {
				let last = m.slice(-1)
				if (last == "'") {
					return doInvert(resolveNamedMoves([m.slice(0, -1)])); 
				}

				let repeat = 1;
				// last character is a number
				if (!isNaN(last)) {
					if (m.length == 2) {
						return m;
					} 

					repeat = parseInt(last);
					m = m.slice(0, -1)
				}
				
				let resolved = m;
				let temp = namedMoves[m]
				if (temp) {
					resolved = resolveNamedMoves(temp.split(' '))
				}
				return new Array(repeat).fill(resolved).flat();
				
			})

		};

		var doCubeMouvements = function (mouvements, fast, invert) {
			if (typeof(mouvements) == "string") {
				mouvements = mouvements.replace(/\(/g, "");
				mouvements = mouvements.replace(/\)/g, "");
				mouvements = mouvements.replace(/\[/g, "");
				mouvements = mouvements.replace(/\]/g, "");
				mouvements = mouvements.split(" ");
			}
			
			if (invert) {
				mouvements = doInvert(mouvements);
			}
			
			if (span_info) {
				span_info.innerHTML = mouvements.join(' ');
			}

			mouvements = resolveNamedMoves(mouvements);
			
			for (var i=0, l=mouvements.length; i<l; i++) {
				doCubeMouvement(mouvements[i], 1, 0, fast);
			}
		}
		
		var doCubeMouvement = function (move_name, nb_layer, offset, fast) {
			var move_pieces = [];
			var anim_duration = fast ? 10 : cube_config.anim_duration;
			
			var nb_move = 1;
			if (move_name.substr(-1) == 2) {
				nb_move = 2;
				move_name = move_name.substr(0, move_name.length-1);
			}
			if (move_name.substr(-2) == "2'") {
				nb_move = 2;
				move_name = move_name.substr(0, move_name.length-2) + "'";
			}
			if (move_name.substr(0, 1) == "M") {
				//move_name = move_name.substr(1);
				//offset = 1;
			}
			if (move_name.substr(0, 1) == "N") {
				move_name = move_name.substr(1);
				offset = 1;
			}
			if (move_name.substr(0, 1) == "T") {
				move_name = move_name.substr(1);
				nb_layer = 2;
			}
			
			
			var mouvement = rotations[move_name];
			if (mouvement) {
				animations_queue.push(function () { mouvement.updateRender(move_pieces, anim_duration, nb_move) });
				
				var move_pieces = mouvement.getPieces(nb_layer, offset);
				
				for (var i=0, l=move_pieces.length; i<l; i++) {
					var piece = move_pieces[i];
					var new_position = piece.position;
					for (var j=0; j<nb_move; j++) {
						new_position = mouvement.updateMatrix(new_position);
					}
					piece.position = new_position;
				}
				
				runAnimations();
				mouvements_done.push([mouvement, nb_move, nb_layer, offset]);
				
			}else{
				// unknown mouvement
			}
			
		};
		
		
		function scrambleCube(auto_reverse) {
			
			//var available_mouvements = ["U", "D", "L", "R", "F", "B", "f", "r", "l", "l'", "r'", "f'", "B'", "F'", "R'", "L'", "D'", "U'"];	// TODO...
			var available_mouvements = ["U", "D", "L", "R", "F", "B", "B'", "F'", "R'", "L'", "D'", "U'"];
			var nb_avail_move = available_mouvements.length;
			var nb_move = 30;
			var last_index_avail_move = -1;
			var moves = [];
			
			if (span_info) {
				span_info.innerHTML = '';
			}
			
			for (var i=0; i<nb_move; i++) {
				var nb_layer = Math.floor((Math.random()*(cube_config.nb_pieces_width-1)+1));
				var offset = Math.floor((Math.random()*(cube_config.nb_pieces_width-nb_layer)));
				
				var index_avail_move = Math.floor((Math.random()*(nb_avail_move)));
				//var tmp_moves = available_mouvements.splice(XXXX);
				doCubeMouvement(available_mouvements[index_avail_move], nb_layer, offset);
				moves.push([index_avail_move, nb_layer, offset]);
				last_index_avail_move = index_avail_move;
				
				if (span_info) {
					//span_info.innerHTML += ' ' + available_mouvements[index_avail_move];
				}
			}
			if (auto_reverse) {
				for (var i=nb_move-1; i>=0; i--) {
					var index_avail_move = nb_avail_move-1 - moves[i][0];
					
					doCubeMouvement(available_mouvements[index_avail_move], moves[i][1], moves[i][2]);
					last_index_avail_move = index_avail_move;
				}
			}
			
		}
		
		
		/* ######### TESTS ######### */
		
		function test1() {
			doCubeMouvements("R L' U D' F' B R L'");
		}
		
		function test2() {
			doCubeMouvements("R2 L'2 U2 D'2 F2 B'2");
		}
		
		function test3() {
			var moves = prompt('moves to do ?', "MR'2 ML2 MU2 MD'2 MF2 MB'2");
			if (moves) {
				doCubeMouvements(moves);
			}
		}
		function test4() {
			doCubeMouvements("TU TB2 TL TD · TF TB' · TL' · TU' TD · TR TL' · TF' TD2 TR' ");
		}
		
		
		
		// init
		resetCube();
		
		// RubikCube return
		return {
			move		: doCubeMouvements,
			scramble	: scrambleCube,
			reset		: resetCube,
			test1		: test1,
			test2		: test2,
			test3		: test3,
			test4		: test4,
			pieces      : pieces,
		};
	}
	
	
	
	/* == RubikPiece == */
	var RubikPiece = function (x, y, z, cube_config) {
		var _piece 	= this;
		var shape 	= null;
		var color 	= null;
		var trans 	= null;
	
		var colors 				= cube_config.colors;
		var init_position		= {x:x, y:y, z:z};
		var size_factor 		= 2.5;
		var faces_colors 		= [];
		var default_color 		= new Pre3d.RGBA(.1, .1, .1, 1);
		
		var buildPiece = function (x, y, z) {
			shape = Pre3d.ShapeUtils.makeCube((cube_config.piece_width-cube_config.piece_margin) * size_factor);
			//Pre3d.ShapeUtils.averageSmooth(shape, .5);
			
		}
		
		var translatePiece = function (translate_x, translate_y, translate_z) {
			if (trans === null) {
				trans = new Pre3d.Transform();
			}
			trans.translate((translate_x+cube_config.piece_width/1) * size_factor, (translate_y+cube_config.piece_width/1) * size_factor, (translate_z+cube_config.piece_width/1) * size_factor);
		}
		
		/*
		var setPieceColor = function (r, g, b, t) {
			color = new Pre3d.RGBA(r, g, b, t);
		}
		*/
		
		var setFacesColors = function () {
			faces_colors = [];
			for (var quad_index=0; quad_index<6; quad_index++) {
				var color = colors[quad_index];
				
				if (quad_index == 0 && init_position.x < cube_config.nb_pieces_width - 1) color = default_color;
				if (quad_index == 1 && init_position.z < cube_config.nb_pieces_width - 1) color = default_color;
				if (quad_index == 2 && init_position.x > 0) color = default_color;
				if (quad_index == 3 && init_position.z > 0) color = default_color;
				if (quad_index == 4 && init_position.y < cube_config.nb_pieces_width - 1) color = default_color;
				if (quad_index == 5 && init_position.y > 0) color = default_color;
				
				faces_colors[quad_index] = color;
			}
		};
		
		var setFaceColorCallback = function (renderer, quad_face, quad_index, shape) {
			renderer.fill_rgba = faces_colors[quad_index];
			return false;
		};
		
		// RubikPiece return
		return {
			position			: init_position,
			faces_colors 		: faces_colors,	// deprecated
			colors 				: function () {return faces_colors;},
			build				: buildPiece,
			translate			: translatePiece,
			setFaceColorCallback: setFaceColorCallback,
			setFacesColors 		: setFacesColors,
			//hide				: function () {},
			geometry			: function () { return {shape:shape, color:color, trans:trans} },
		};
	}
	
	if (window.RubikCube === undefined) window.RubikCube = RubikCube;
	
})();







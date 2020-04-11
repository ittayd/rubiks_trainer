
function renderCubes() {
	renderCross();
	renderF2L();
	renderOLL();
	renderPLL();
}


function renderCross() {
	var items = $j('ul.cross li.algo');
	renderItem('f2l', items);
}
function renderF2L() {
	var items = $j('ul.f2l li.algo');
	renderItem('f2l', items);
}

function renderOLL() {
	var items = $j('ul.oll li.algo');
	renderItem('oll', items);
}

function renderPLL() {
	var items = $j('ul.pll li.algo');
	renderItem('pll', items);
}

function renderItem(default_stage, items) {
	var VISUAL_CUBE_PATH = 'http://cube.crider.co.uk/visualcube.php';
	//var VISUAL_CUBE_PATH = 'libs/vcube/visualcube.php';

	items.each(function (){
		var $item     = $j(this);
		var $images   = $item.find('.image');
		var $formulas = $item.find('.formula');		
		var arrows    = $item.find('.arrows').html();
		$images.each(function () {
			var $image  = $j(this);
			var formula = $image.next().html();
			var stage   = $image.attr('stage') ? $image.attr('stage') : default_stage;
			var view    = $image.attr('view') ? $image.attr('view') : (stage == 'f2l' ? '' : 'plan');
			var img_url = VISUAL_CUBE_PATH + "?fmt=svg&size=100&view=" + view + "&stage=" + stage + "&bg=t&case=" + encodeURIComponent(formula) + "&arw=" + encodeURIComponent(arrows);
			$image.html('<img src="' + img_url + '" />').click(function () {
				setDemoAlgo(formula, $image);
			});
			
		});
		$formulas.each(function () {
			var $formula = $j(this);
			var formula  = $formula.html();
			$formula.click(function () {
				setDemoAlgo(formula, $formula);
			});
			
		});
	});
}

function selectMenuItem() {

}

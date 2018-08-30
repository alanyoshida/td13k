// Create Mouse object.
var Mouse = (function() {

	var x = 0;
	var y = 0;
	var vx = 0;
	var vy = 0;
	var click = false;
	var drag = false;
	var released = false;
	var down = false;
	var scrollOut = false;
	var scrollIn = false;

	function update() {
		click = false;
		released = false;
		scrollIn = false;
		scrollOut = false;
	}

	/**
	 * Returns whether the mouse is within/over the given region.
	 * @param {number} rx Region x position.
	 * @param {number} ry Region y position.
	 * @param {number} rw Region width.
	 * @param {number} rh Region height.
	 * @return {boolean}
	 */
	function overRegion(rx, ry, rw, rh) {
		return x > rx && x < rx+rw && y > ry && y < ry+rh;
	}

	/**
	 * Returns whether the mouse was clicked within the given region.
	 * @param {number} rx Region x position.
	 * @param {number} ry Region y position.
	 * @param {number} rw Region width.
	 * @param {number} rh Region height.
	 * @return {boolean}
	 */
	function clickRegion(rx, ry, rw, rh) {
		return click && overRegion(rx, ry, rw, rh);
	}

	// Update mouse position.
	// Can probably remove "rect" stuff if canvas is whole window.
	window.addEventListener("mousemove", function(e) {
		var rect = Canvas.getBoundingClientRect();
		x = e.clientX - rect.left;
		y = e.clientY - rect.top;
		vx = (x + View.x - Canvas.width / 2) / View.zoom;
		vy = (y + View.y - Canvas.height / 2) * View.tilt / View.zoom;
		if (down) {
			drag = true;
		}
	}, false);

	//
	window.addEventListener("mousedown", function(e) {
		click = true;
		down = true;
	}, false);

	//
	window.addEventListener("mouseup", function(e) {
		down = false;
		if (!drag) {
			released = true;
		}
		drag = false;
	}, false);

	//
	window.addEventListener("wheel", function(e) {
		scrollOut = e.deltaY > 0;
		scrollIn = e.deltaY < 0;
	}, false);

	//
	return {
		update: update,
		overRegion: overRegion,
		clickRegion: clickRegion,
		get x() { return x; },
		get y() { return y; },
		get vx() { return vx; },
		get vy() { return vy; },
		get click() { return click; },
		get drag() { return drag; },
		get released() { return released; },
		get down() { return down; },
		get scrollOut() { return scrollOut; },
		get scrollIn() { return scrollIn; }
	}

})();

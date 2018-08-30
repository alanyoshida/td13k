// Cache stuff.
//var pop = createPop();
var base = null;
var STATE_LOADING = 0;
var STATE_RUNNING = 1;
var STATE_CREATE = 2;
var STATE_PAUSED = 3;
var gameState = STATE_LOADING;
var maxDistance = 64;

// Disables right click context menu.
window.addEventListener("contextmenu", function(e) {
	e.preventDefault();
}, false);

//
Settings.init();

// Pause the game.
document.addEventListener("keypress", function(e) {
	if (e.key === " ") {
		if (gameState === STATE_PAUSED) {
			gameState = STATE_RUNNING;
		} else {
			gameState = STATE_PAUSED;
		}
	}
});

// Setup planets (procgen this?)
var s = Orbital.sun(getHSL(60, 100, 50), 50, 0, 0);
var s1 = Orbital.planet(getHSL(180, 39, 62), 10, s, 650, 0.003, Math.random() * TAU);
base = Base(s1);
var s1a = Orbital.planet(getHSL(-1, 60, 70), 5, s1, 100, -0.002, Math.random() * TAU);
var s2 = Orbital.planet(getHSL(-1, 60, 70), 20, s, 1123, 0.0015, Math.random() * TAU);
var s2a = Orbital.planet(getHSL(-1, 60, 70), 5, s2, s2.size * 8, 0.01, Math.random() * TAU);
var s2b = Orbital.planet(getHSL(-1, 60, 70), 10, s2, s2.size * 9, 0.005, null);
var s3 = Orbital.planet(getHSL(-1, 60, 70), 30, s, 2532, -0.001, Math.random() * TAU);
var ms = Orbital.miningStation(s1);
var ms2 = Orbital.miningStation(s2);
var st = Orbital.satellite(s1);
var st1 = Orbital.satellite(s);
var st2 = Orbital.satellite(s);
var st3 = Orbital.satellite(s);
var st4 = Orbital.satellite(s2);
var st5 = Orbital.satellite(s2);
var st6 = Orbital.satellite(s2);
var ds = Orbital.defenseStation(s1);
var ds1 = Orbital.defenseStation(s1);
var ds2 = Orbital.defenseStation(s1);
var ds3 = Orbital.defenseStation(s2);

// Update game.
var lastTick = performance.now();
var tickLength = 1000 / 60; // Logic steps per second
var last = 0;
(function frame(timestamp) {

	requestAnimationFrame(frame);
	var nextTick = lastTick + tickLength;
	Fps.update(1 / ((timestamp - last) / 1000));
	last = timestamp;

	if (timestamp > nextTick) {
		var timeSinceTick = timestamp - lastTick;
		var numTicks = Math.floor(timeSinceTick / tickLength);
		update(Math.min(numTicks, 60));
		render();
		lastTick = timestamp;
	}
})(lastTick);

function update(repeat) {

	if (gameState === STATE_LOADING) {
		LoadingScreen.update();
	} else {
		hoverName = "";
		View.update();
		Gui.update();
		if (gameState === STATE_RUNNING) {
			orbitals.forEach(function(e) { e.update(); });
			WaveManager.update();
			EnemyShip.updateAll();
			Laser.update();
			Rocket.update();
			clickNearest();
		} else if (gameState === STATE_CREATE) {
			if (!buildOn)
				clickNearest();
			else if (Mouse.released) {
				selectOrbitSize();
			}
		}

	}

	Mouse.update();
	--repeat && update(repeat);

}

function render() {

	// Draw background
	View.clear();
	drawBackground();
	drawStarscape();

	if (gameState === STATE_LOADING) {
		View.reset();
		LoadingScreen.render();
	} else {
		View.position();
		orbitals.forEach(function(e) { e.render(); });
		ctx.globalAlpha = 1;
		renderAllOrbits();
		renderAllBodies();
		EnemyShip.renderAll();
		renderComLines();
		Laser.render();
		Rocket.render();

		// Draw line to closer planet.
		var nearest = nearestOrbital(Mouse.vx, Mouse.vy);
		if (getDistance(nearest, { x: Mouse.vx, y: Mouse.vy }) < maxDistance) {
			ctx.beginPath();
			ctx.moveTo(nearest.x, nearest.y / View.tilt);
			ctx.lineTo(Mouse.vx, Mouse.vy / View.tilt);
			ctx.strokeStyle = "#ffffff";
			ctx.stroke();
		}

		var centerX = Canvas.width / 2;
		var centerY = Canvas.height / 2;
		ctx.setTransform(1, 0, 0, 1, centerX, centerY);
		View.reset();
		Gui.render();
		drawDebug();

	}
}

// Setup Canvas (move to graphics.js)
var hoverName = "";
var AddEventListener = DOCUMENT.addEventListener.bind(DOCUMENT);
var Canvas = DOCUMENT.getElementById("c");
var ctx = Canvas.getContext("2d", { alpha: false });

// Keep canvas same size as window.
resize();
window.addEventListener("resize", resize, false);
function resize() {
	Canvas.width = window.innerWidth;
	Canvas.height = window.innerHeight;
	ctx.clearRect(0, 0, Canvas.width, Canvas.height);
};

// Cache drawing
function cache(width, height) {
	var canvas = DOCUMENT.createElement(CANVAS);
	canvas.width = width;
	canvas.height = height;
	return canvas;
}

// Render all orbits.
function renderAllOrbits() {
	ctx.globalAlpha = 1;
	var total = 0;
	for (var n=0; n<orbitals.length; n++) {
		total += renderOrbit(orbitals[n]) === true;
	}
}

// Cache orbits.
function getOrbitCache(body) {

	//
	var orbit = body.orbit;
	if (!orbit) return false;

	//
	var cache = orbit.planet.orbitCache;
	if (!cache) {
		cache = orbit.planet.orbitCache = [];
	}

	// Create new cache canvas for given level.
	var scaleLevel = Math.floor(View.zoom*4);
	cache = cache[scaleLevel];
	if (!cache) {
		cache = document.createElement("CANVAS");
		var maxDist = 0;
		orbitals.forEach(function(o) {
			if (o.orbit && o.orbit.planet === orbit.planet)
				maxDist = Math.max(maxDist, o.orbit.distance + 40);
		});
		cache.width = maxDist;
		cache.height = maxDist;
		orbit.planet.orbitCache[scaleLevel] = cache;
		cache.hasBody = [];
	}

	// Render particular body's orbit line.
	if (!cache.hasBody[body.id]) {
		var drawScale = 0.1 + scaleLevel / 4;
		var ctxOrbit = cache.getContext("2d");
		ctxOrbit.setLineDash([5 / drawScale, 5 / drawScale]);
		ctxOrbit.beginPath();
		ctxOrbit.lineWidth = 2 / drawScale;
		ctxOrbit.strokeStyle = body.color;
		ctxOrbit.globalAlpha = 0.6;
		ctxOrbit.arc(0, 0, orbit.distance, 0, cr/4, false);
		ctxOrbit.stroke();
		ctxOrbit.setLineDash(dashStyleReset);
		cache.hasBody[body.id] = true;

	}

	return cache;

}

// Render orbit
var dashStyle = [5, 5];
var dashStyleReset = [];
function renderOrbit(body) {

	if (body.orbit) {
		var cache = getOrbitCache(body);
	}

	var scaleLevel = Math.floor(View.zoom*4);
	if (body.orbitCache && body.orbitCache[scaleLevel]) {
		var cache = body.orbitCache[scaleLevel];
		ctx.save();
		ctx.translate(body.x, body.y);
		ctx.scale(1, 1/View.tilt);
		ctx.drawImage(cache, 0, 0, cache.width, cache.height);
		ctx.scale(-1, 1);
		ctx.drawImage(cache, 0, 0);
		ctx.scale(1, -1);
		ctx.drawImage(cache, 0, 0);
		ctx.scale(-1, 1);
		ctx.drawImage(cache, 0, 0);
		ctx.restore();
		return true;
	}

	return false;

}

// Render trail
function renderTrail(body) {
	var orbit = body.orbit;
	if (orbit) {
		ctx.beginPath();
		ctx.globalAlpha = 0.4;
		ctx.strokeStyle = body.color;
		ctx.lineWidth = 4 / View.zoom;
		ctx.save();
		var tilt = 1 / View.tilt;
		ctx.transform(1, 0, 0, tilt, orbit.planet.x, orbit.planet.y)
		var trail = orbit.angle - orbit.speed * orbit.distance / 2;
		ctx.arc(0, 0, orbit.distance, trail, orbit.angle, orbit.speed < 0);
		ctx.restore();
		ctx.stroke();
	}
}

// Render all bodies.
function renderAllBodies() {
	ctx.globalAlpha = 1;
	for (var n=0; n<orbitals.length; n++) {
		renderBody(orbitals[n]);
	}
}

// Render body (star, planet, death star)
function renderBody(body) {

	if (body.type === "satellite") {
		var angle = getAngle(body, orbitals[0]);
		ctx.save();
		ctx.translate(body.x, body.y);
		ctx.rotate(angle);
		ctx.scale(0.2, 0.2);
		ctx.drawImage(sprSatellite, -sprSatellite.width/2, -sprSatellite.height/2);
		ctx.restore();
		return;
	}

	if (!body.cache) {
		var color = body.isSun ? WHITE : body.color;
		var glow = body.isSun ? 50 : 10;
		var size = body.size + glow;
		body.cache = cache(size*2, size*2);
		var context = body.cache.getContext("2d");
		if (body.isSun) context.filter = "blur(4px)";

		// Draw planet body.
		context.beginPath();
		context.fillStyle = color;
		context.shadowColor = body.color;
		context.shadowBlur = glow;
		context.arc(size, size, body.size, 0, cr, false);
		context.fill();

		// Draw shadow.
		if (!body.isSun) {
            var repeat = body.size;
            var o = body.size;
            context.beginPath();
            context.arc(size, size, body.size, 0, 2*Math.PI, false);
            context.clip();
            while (repeat--) {
				context.beginPath();
				context.globalAlpha = 0.05;
				context.fillStyle = "#000000";
				context.shadowColor = "#000000";
				context.shadowBlur = 10;
				context.save();
				context.transform(1, 0, 0, 1, size-o/2+(body.size-o)/2, size);
				context.arc(0, 0, o--*2, -cr / 4, cr / 4);
				context.fill();
				context.restore();
            }
		}
	}

	var angle = getAngle(body, orbitals[0]);
	ctx.save();
	ctx.translate(body.x, body.y);
	ctx.rotate(angle);
	if (body.isSun) {
		var scale = 1+Math.sin(performance.now()/30)*0.01;//1 + rand() * 0.03;
		ctx.scale(scale, scale);
	}
	ctx.drawImage(body.cache, -body.cache.width/2, -body.cache.height/2);
	ctx.restore();
}

/*function renderComLine(from, to) {
    ctx.setLineDash([1, 1]);
	ctx.beginPath();
	ctx.globalAlpha = 0.2 / View.zoom;
	ctx.moveTo(from.x, from.y);
    var up = 75 * (View.tilt - 1);
    ctx.bezierCurveTo(from.x, from.y-up, to.x, to.y-up, to.x, to.y);
	ctx.lineWidth = 1 / View.zoom * 2;
	ctx.strokeStyle = "#00FF00";
	ctx.stroke();
	ctx.globalAlpha = 1;
    ctx.setLineDash([]);
}*/

//
function renderComLines() {
	ctx.beginPath();
    var up = 75 * (View.tilt - 1);
    for (var n=0; n<coms.length; n++) {
        var t = coms[n];
        for (var i=n; i<coms.length; i++) {
            var e = coms[i];
            if (e != t && getDistance(e, t) <= base.comRange) {
                ctx.moveTo(t.x, t.y);
                ctx.bezierCurveTo(t.x, t.y-up, e.x, e.y-up, e.x, e.y);
            }
        }
    }
	ctx.globalAlpha = clamp(0.2 / View.zoom, 0.2, 0.8);
    ctx.lineWidth = clamp(1 / View.zoom * 2, 1, 4);
    ctx.strokeStyle = "#00FF00";
	ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawDebug() {
	ctx.font = "14px monospace";
	ctx.textBaseline = "top";
	ctx.textAlign = 'left';
	ctx.fillStyle = "#ffffff";
	ctx.fillText("#js13k tower defense prototype", 20, 20);
	ctx.fillText("https://github.com/scorp200/td13k", 20, 40);
	ctx.fillText("framerate: " + fps, 20, 60);
	ctx.fillText("mouse (gui): " + Mouse.x + ", " + Mouse.y, 20, 80);
	ctx.fillText("mouse (view): " + Mouse.vx + ", " + Mouse.vy, 20, 100);
	ctx.fillText("planet name: " + hoverName, 20, 120);

    ctx.fillText("view x: " + View.x, 20, 160);
    ctx.fillText("view y: " + View.y, 20, 180);
    ctx.fillText("view zoom: " + View.zoom, 20, 200);
    ctx.fillText("view tilt: " + View.tilt, 20, 220);

	ctx.fillText("minerals: " + Math.floor(base.minerals * 100) / 100, 20, 260);
}
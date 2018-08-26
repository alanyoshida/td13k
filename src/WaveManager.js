//
var WaveManager = {

    // Timing.
    currentWave: 0,
    cooldown: 10,
    timer: 0,

    // Wave spawning.
    spawnCount: 100,

    // Speech flavor.
    speechFlavor: [
        "enemies, approaching",
        "we are under attack",
        "enemy, in-bound",
        "hostiles detected"
    ],

    //
    init: function() {
        WaveManager.timer = WaveManager.cooldown * 60;
    },

    //
    update: function() {
        if (!WaveManager.timer--) {
    		WaveManager.spawn();
            WaveManager.init();
            WaveManager.currentWave++;
            var i = ~~(Math.random()*WaveManager.speechFlavor.length);
            speak(WaveManager.speechFlavor[i]);
        }
    },

    //
    spawn: function() {
        var n = WaveManager.spawnCount;
        while (n--) {
            var angle = Math.random() * cr;
            var x = Math.cos(angle) * 3000;
            var y = Math.sin(angle) * 3000;
            var ship = new EnemyShip(x, y);
            ship.direction = angle;
        }
    }

}

//WaveManager.init();

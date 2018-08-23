var LoadingScreen = {

    ready: false,
    cooldown: 60,

    update: function() {

        if (LoadingScreen.cooldown-- > 0) { // This bit is for TESTING
        } else if (Music.loading) {
            generateMusic();
        } else if (Sound.loading) {
            generateSound();
        } else {
            if (!LoadingScreen.ready) {
                LoadingScreen.ready = true;
                speak("Welcum to Exo");
            }
            if (Mouse.click) {
                gameState = STATE_RUNNING;
            }
        }

    },

    render: function() {
        var centerX = Canvas.width / 2;
        var centerY = Canvas.height / 2;

        //ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 50 + Math.sin(performance.now()/100)*2;
        ctx.font = "small-caps 700 256px monospace";
        ctx.fillText("X", centerX, centerY-64);
        ctx.fillText("e o", centerX, centerY-90);
        ctx.shadowBlur = 0;

        ctx.font = "small-caps 700 32px monospace";
        if (Music.loading) {
            ctx.fillText("Loading music...", centerX, centerY+64);
        } else if (Sound.loading) {
            ctx.fillText("Loading sounds...", centerX, centerY+64);
        } else {
            ctx.fillText("Click to continue!", centerX, centerY+64);
        }

        ctx.font = "small-caps 700 16px monospace";
        ctx.fillText("Created by", centerX, Canvas.height-68);
        ctx.fillText("ai Doge & Jack Oatley", centerX, Canvas.height-48);
        ctx.fillText("for #js13k", centerX, Canvas.height-28);
    }

}
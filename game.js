const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const penButton = document.getElementById("penButton");
const eraserButton = document.getElementById("eraserButton");
const inkText = document.getElementById("inkText");

// ==========================
// ショップUI
// ==========================

const shopPanel = document.createElement("div");

shopPanel.id = "shopPanel";

shopPanel.innerHTML = `
    <div id="shopTitle">SHOP</div>
    <button id="springButton">🟡 バネ　30 INK</button>
`;

document.body.appendChild(shopPanel);

const shopStyle = document.createElement("style");

shopStyle.textContent = `
    #shopPanel {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        padding: 12px;
        background: rgba(255, 255, 255, 0.95);
        border: 2px solid #222;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: sans-serif;
    }

    #shopTitle {
        font-weight: bold;
        margin-bottom: 8px;
        text-align: center;
    }

    #shopPanel button {
        display: block;
        width: 190px;
        margin: 5px 0;
        padding: 8px;
        border: 1px solid #222;
        border-radius: 8px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
    }

    #shopPanel button:hover {
        background: #f1f1f1;
    }

    #shopPanel button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }
`;

document.head.appendChild(shopStyle);

const springButton =
    document.getElementById("springButton");


// ==========================
// キャンバス
// ==========================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);


// ==========================
// プレイヤー
// ==========================

const player = {

    x: 100,
    y: 100,

    width: 25,
    height: 25,

    vx: 0,
    vy: 0,

    speed: 4,
    jumpPower: 11,

    onGround: false

};


// ==========================
// ゲーム設定
// ==========================

const gravity = 0.5;

let gameMode = "pen";

let lines = [];

let currentLine = [];

let drawing = false;


// ==========================
// ランダムイベント
// ==========================

let slowEvent = false;

let fallingSpikes = [];

let slowTimer = 0;

let nextEventTimer =
    Math.random() * 600 + 600;


// 通常速度
const NORMAL_SPEED = 4;

// スロー速度
const SLOW_SPEED = 1.5;

// スロー時間
const SLOW_DURATION = 360;

// 降ってくるトゲの数
const FALLING_SPIKE_COUNT = 5;


// ==========================
// インク
// ==========================

const MAX_INK = 100;

let ink = MAX_INK;

const INK_PER_PIXEL = 0.08;


// ==========================
// スタート・ゴール
// ==========================

let start = {
    x: 100,
    y: 300
};

let goal = {
    x: 700,
    y: 300
};


// ==========================
// 通常のトゲ
// ==========================

let spikes = [];

const SPIKE_COUNT = 8;


// ==========================
// ショップ・アイテム
// ==========================

const ITEM_PRICES = {

    spring: 30

};

let jumpBoost = false;


// ==========================
// ランダムゲーム生成
// ==========================

function randomGame() {

    lines = [];

    spikes = [];

    fallingSpikes = [];

    ink = MAX_INK;

    jumpBoost = false;

    slowEvent = false;

    slowTimer = 0;

    nextEventTimer =
        Math.random() * 600 + 600;

    updateInkText();
    updateShopButtons();


    // ======================
    // スタート
    // ======================

    start.x =
        Math.random() *
        (canvas.width - 150) + 75;

    start.y =
        Math.random() *
        (canvas.height - 300) + 150;


    // ======================
    // ゴール
    // ======================

    goal.x =
        Math.random() *
        (canvas.width - 150) + 75;

    goal.y =
        Math.random() *
        (canvas.height - 300) + 150;


    // ======================
    // プレイヤー
    // ======================

    player.x = start.x;

    player.y =
        start.y - player.height;

    player.vx = 0;

    player.vy = 0;


    // ======================
    // 通常トゲ生成
    // ======================

    for (let i = 0; i < SPIKE_COUNT; i++) {

        const spike = {

            x:
                Math.random() *
                (canvas.width - 100) + 50,

            y:
                Math.random() *
                (canvas.height - 250) + 150,

            width: 35,

            height: 30

        };


        const distanceFromStart =
            Math.sqrt(
                Math.pow(
                    spike.x - start.x,
                    2
                ) +
                Math.pow(
                    spike.y - start.y,
                    2
                )
            );


        const distanceFromGoal =
            Math.sqrt(
                Math.pow(
                    spike.x - goal.x,
                    2
                ) +
                Math.pow(
                    spike.y - goal.y,
                    2
                )
            );


        if (
            distanceFromStart > 120 &&
            distanceFromGoal > 80
        ) {

            spikes.push(spike);

        }

    }

}

randomGame();


// ==========================
// インク表示
// ==========================

function updateInkText() {

    inkText.textContent =
        `INK ${Math.ceil(ink)} / ${MAX_INK}`;

    updateShopButtons();

}


// ==========================
// ショップ
// ==========================

function updateShopButtons() {

    springButton.disabled =
        jumpBoost ||
        ink < ITEM_PRICES.spring;

}


function buyItem(price) {

    if (ink < price) {

        return false;

    }

    ink -= price;

    updateInkText();

    return true;

}


// ==========================
// バネ
// ==========================

springButton.addEventListener("click", () => {

    if (jumpBoost) return;

    if (!buyItem(ITEM_PRICES.spring)) return;

    jumpBoost = true;

    alert(
        "バネを購入！\n" +
        "ジャンプ力が？？倍になりました。"
    );

    updateShopButtons();

});


// ==========================
// スタートへ戻す
// ==========================

function resetPlayer() {

    ink -= 30;

    if (ink < 0) {

        ink = 0;

    }

    jumpBoost = false;

    slowEvent = false;

    fallingSpikes = [];

    slowTimer = 0;

    nextEventTimer =
        Math.random() * 600 + 600;

    player.x = start.x;

    player.y =
        start.y - player.height;

    player.vx = 0;

    player.vy = 0;

    updateInkText();

}


// ==========================
// キー入力
// ==========================

const keys = {};

window.addEventListener("keydown", (e) => {

    keys[e.key] = true;

    if (e.code === "Space") {

        if (player.onGround) {

            player.vy =
                -(
                    jumpBoost
                        ? player.jumpPower * 1.8
                        : player.jumpPower
                );

            player.onGround = false;

        }

        e.preventDefault();

    }

});


window.addEventListener("keyup", (e) => {

    keys[e.key] = false;

});


// ==========================
// モード切り替え
// ==========================

penButton.addEventListener("click", () => {

    gameMode = "pen";

    penButton.classList.add("selected");

    eraserButton.classList.remove("selected");

});


eraserButton.addEventListener("click", () => {

    gameMode = "eraser";

    eraserButton.classList.add("selected");

    penButton.classList.remove("selected");

});


// ==========================
// マウス
// ==========================

canvas.addEventListener("mousedown", (e) => {

    drawing = true;

    if (gameMode === "pen") {

        if (ink <= 0) {

            drawing = false;

            return;

        }

        currentLine = [

            {
                x: e.clientX,
                y: e.clientY
            }

        ];

    }

});


canvas.addEventListener("mousemove", (e) => {

    if (!drawing) return;


    // ======================
    // ペン
    // ======================

    if (gameMode === "pen") {

        if (ink <= 0) {

            drawing = false;

            return;

        }

        const lastPoint =
            currentLine[
                currentLine.length - 1
            ];


        const dx =
            e.clientX - lastPoint.x;

        const dy =
            e.clientY - lastPoint.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        const inkCost =
            distance * INK_PER_PIXEL;


        if (inkCost >= ink) {

            ink = 0;

            updateInkText();

            drawing = false;

            return;

        }


        ink -= inkCost;

        updateInkText();


        currentLine.push({

            x: e.clientX,

            y: e.clientY

        });

    }


    // ======================
    // 消しゴム
    // ======================

    if (gameMode === "eraser") {

        eraseLines(
            e.clientX,
            e.clientY
        );

    }

});


canvas.addEventListener("mouseup", () => {

    if (
        gameMode === "pen" &&
        currentLine.length > 1
    ) {

        lines.push(currentLine);

    }

    currentLine = [];

    drawing = false;

});


// ==========================
// 消しゴム
// ==========================

function eraseLines(x, y) {

    const radius = 20;

    lines = lines.filter(line => {

        for (const point of line) {

            const dx =
                point.x - x;

            const dy =
                point.y - y;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            if (distance < radius) {

                return false;

            }

        }

        return true;

    });

}


// ==========================
// 線と落下トゲの衝突判定
// ==========================

function checkFallingSpikeLines(spike) {

    const spikeCenterX =
        spike.x + spike.width / 2;

    const spikeTop =
        spike.y;

    const spikeBottom =
        spike.y + spike.height;


    for (const line of lines) {

        for (
            let i = 0;
            i < line.length - 1;
            i++
        ) {

            const a = line[i];

            const b = line[i + 1];


            // 線分とトゲの横方向が重なっているか
            const lineMinX =
                Math.min(a.x, b.x);

            const lineMaxX =
                Math.max(a.x, b.x);


            if (
                spikeCenterX < lineMinX - 10 ||
                spikeCenterX > lineMaxX + 10
            ) {

                continue;

            }


            // 線の高さを計算
            const denominator =
                b.x - a.x;


            let lineY;


            if (Math.abs(denominator) < 0.001) {

                lineY =
                    Math.min(a.y, b.y);

            }
            else {

                lineY =
                    a.y +
                    (b.y - a.y) *
                    (
                        (spikeCenterX - a.x) /
                        denominator
                    );

            }


            // トゲが線に到達したか
            if (
                spikeTop <= lineY &&
                spikeBottom >= lineY
            ) {

                return true;

            }

        }

    }

    return false;

}


// ==========================
// ランダムイベント処理
// ==========================

function updateRandomEvent() {

    // ======================
    // 通常時
    // ======================

    if (!slowEvent) {

        nextEventTimer--;

        if (nextEventTimer <= 0) {

            slowEvent = true;

            slowTimer = SLOW_DURATION;

            fallingSpikes = [];


            // スロー開始時に速度を即座に落とす
            if (player.vx > SLOW_SPEED) {

                player.vx = SLOW_SPEED;

            }

            if (player.vx < -SLOW_SPEED) {

                player.vx = -SLOW_SPEED;

            }


            // ==================
            // 降下トゲ生成
            // ==================

            for (
                let i = 0;
                i < FALLING_SPIKE_COUNT;
                i++
            ) {

                fallingSpikes.push({

                    x:
                        Math.random() *
                        (canvas.width - 40),

                    y: -40 - i * 80,

                    width: 35,

                    height: 30,

                    speed:
                        4 +
                        Math.random() * 3

                });

            }

        }

        return;

    }


    // ======================
    // スロー中
    // ======================

    slowTimer--;


    // ======================
    // トゲを落とす
    // ======================

    for (const spike of fallingSpikes) {

        spike.y += spike.speed;

    }


    // ======================
    // 線に当たったトゲを削除
    // ======================

    fallingSpikes =
        fallingSpikes.filter(spike => {

            if (
                checkFallingSpikeLines(spike)
            ) {

                return false;

            }

            return true;

        });


    // ======================
    // プレイヤーとの当たり判定
    // ======================

    for (const spike of fallingSpikes) {

        const hit =

            player.x + player.width >
            spike.x &&

            player.x <
            spike.x + spike.width &&

            player.y + player.height >
            spike.y &&

            player.y <
            spike.y + spike.height;


        if (hit) {

            resetPlayer();

            return;

        }

    }


    // ======================
    // 画面外のトゲを削除
    // ======================

    fallingSpikes =
        fallingSpikes.filter(
            spike =>
                spike.y <
                canvas.height + 50
        );


    // ======================
    // イベント終了
    // ======================

    if (slowTimer <= 0) {

        slowEvent = false;

        fallingSpikes = [];

        nextEventTimer =
            Math.random() * 600 + 600;

    }

}


// ==========================
// 線を描画
// ==========================

function drawLines() {

    ctx.lineWidth = 8;

    ctx.lineCap = "round";

    ctx.strokeStyle = "#222";


    for (const line of lines) {

        if (line.length < 2) continue;

        ctx.beginPath();

        ctx.moveTo(
            line[0].x,
            line[0].y
        );


        for (
            let i = 1;
            i < line.length;
            i++
        ) {

            ctx.lineTo(
                line[i].x,
                line[i].y
            );

        }

        ctx.stroke();

    }


    if (currentLine.length > 1) {

        ctx.beginPath();

        ctx.moveTo(
            currentLine[0].x,
            currentLine[0].y
        );


        for (
            let i = 1;
            i < currentLine.length;
            i++
        ) {

            ctx.lineTo(
                currentLine[i].x,
                currentLine[i].y
            );

        }

        ctx.stroke();

    }

}


// ==========================
// 通常トゲを描画
// ==========================

function drawSpikes() {

    ctx.fillStyle = "#e03131";

    for (const spike of spikes) {

        ctx.beginPath();

        ctx.moveTo(
            spike.x,
            spike.y + spike.height
        );

        ctx.lineTo(
            spike.x + spike.width / 2,
            spike.y
        );

        ctx.lineTo(
            spike.x + spike.width,
            spike.y + spike.height
        );

        ctx.closePath();

        ctx.fill();

    }

}


// ==========================
// 降ってくるトゲを描画
// ==========================

function drawFallingSpikes() {

    ctx.fillStyle = "#c92a2a";

    for (const spike of fallingSpikes) {

        ctx.beginPath();

        ctx.moveTo(
            spike.x,
            spike.y
        );

        ctx.lineTo(
            spike.x + spike.width / 2,
            spike.y + spike.height
        );

        ctx.lineTo(
            spike.x + spike.width,
            spike.y
        );

        ctx.closePath();

        ctx.fill();

    }

}


// ==========================
// 通常トゲとの当たり判定
// ==========================

function checkSpikes() {

    for (const spike of spikes) {

        const playerLeft =
            player.x;

        const playerRight =
            player.x + player.width;

        const playerTop =
            player.y;

        const playerBottom =
            player.y + player.height;


        const spikeLeft =
            spike.x;

        const spikeRight =
            spike.x + spike.width;

        const spikeTop =
            spike.y;

        const spikeBottom =
            spike.y + spike.height;


        if (

            playerRight > spikeLeft &&

            playerLeft < spikeRight &&

            playerBottom > spikeTop &&

            playerTop < spikeBottom

        ) {

            resetPlayer();

            return;

        }

    }

}


// ==========================
// プレイヤー更新
// ==========================

function updatePlayer() {

    // ======================
    // 移動速度
    // ======================

    const currentSpeed =
        slowEvent
            ? SLOW_SPEED
            : NORMAL_SPEED;


    // ======================
    // 移動
    // ======================

    if (keys["ArrowLeft"]) {

        player.vx =
            -currentSpeed;

    }
    else if (keys["ArrowRight"]) {

        player.vx =
            currentSpeed;

    }
    else {

        player.vx *= 0.8;

    }


    player.x += player.vx;


    // ======================
    // 重力
    // ======================

    player.vy += gravity;

    player.y += player.vy;


    player.onGround = false;


    // ======================
    // 床
    // ======================

    if (
        player.y +
        player.height >=
        canvas.height
    ) {

        player.y =
            canvas.height -
            player.height;

        player.vy = 0;

        player.onGround = true;

    }


    // ======================
    // 線との当たり判定
    // ======================

    for (const line of lines) {

        for (
            let i = 0;
            i < line.length - 1;
            i++
        ) {

            const a = line[i];

            const b = line[i + 1];


            const minX =
                Math.min(
                    a.x,
                    b.x
                );

            const maxX =
                Math.max(
                    a.x,
                    b.x
                );


            if (
                player.x +
                player.width >
                minX &&

                player.x <
                maxX
            ) {

                const lineY =
                    a.y +
                    (b.y - a.y) *
                    (
                        (player.x - a.x) /
                        (b.x - a.x || 1)
                    );


                const bottom =
                    player.y +
                    player.height;


                if (

                    bottom >= lineY &&

                    bottom <=
                    lineY + 15 &&

                    player.vy >= 0

                ) {

                    player.y =
                        lineY -
                        player.height;

                    player.vy = 0;

                    player.onGround = true;

                }

            }

        }

    }


    // ======================
    // 画面端
    // ======================

    if (player.x < 0) {

        player.x = 0;

    }


    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;

    }


    // ======================
    // 落下
    // ======================

    if (
        player.y >
        canvas.height + 100
    ) {

        resetPlayer();

    }

}


// ==========================
// ゴール判定
// ==========================

function checkGoal() {

    const dx =
        player.x +
        player.width / 2 -
        goal.x;

    const dy =
        player.y +
        player.height / 2 -
        goal.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance < 35) {

        alert("GOAL!");

        randomGame();

    }

}


// ==========================
// 描画
// ==========================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ======================
    // スタート
    // ======================

    ctx.beginPath();

    ctx.arc(
        start.x,
        start.y,
        25,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#4dabf7";

    ctx.fill();


    // ======================
    // ゴール
    // ======================

    ctx.beginPath();

    ctx.arc(
        goal.x,
        goal.y,
        25,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#51cf66";

    ctx.fill();


    // ======================
    // 通常トゲ
    // ======================

    drawSpikes();


    // ======================
    // 降下トゲ
    // ======================

    drawFallingSpikes();


    // ======================
    // 線
    // ======================

    drawLines();


    // ======================
    // アイテム効果表示
    // ======================

    if (jumpBoost) {

        ctx.fillStyle = "#f59f00";

        ctx.font =
            "bold 16px sans-serif";

        ctx.fillText(
            "🟡 BOUNCE ×1.8",
            20,
            80
        );

    }


    // ======================
    // スローイベント表示
    // ======================

    if (slowEvent) {

        ctx.fillStyle = "#e03131";

        ctx.font =
            "bold 18px sans-serif";

        ctx.fillText(
            "⚠ SLOW!",
            20,
            jumpBoost ? 110 : 80
        );

    }


    // ======================
    // プレイヤー
    // ======================

    ctx.fillStyle = "#111";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );

}


// ==========================
// ゲームループ
// ==========================

function gameLoop() {

    updateRandomEvent();

    updatePlayer();

    checkSpikes();

    checkGoal();

    draw();

    requestAnimationFrame(gameLoop);

}

gameLoop();
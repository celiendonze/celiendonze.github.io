let canvas_width = 1000;
let canvas_height = 500;

const RAINDROP_RADIUS = 2;

let count = 0;
let total_number_of_raindrops = 500;

let scores = [];

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Raindrop {
    constructor(x, y, radius) {
        this.position = new Point(x, y);
        this.radius = radius;
        this.speed = Math.random() * 5 + 4;
        this.alive = true;
    }
    fall() {
        this.position.y = this.position.y + this.speed;
        if (this.position.y > canvas_height) {
            this.alive = false;
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#005CC8";
        ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}

class Actor {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.running = false;
        this.autorun = false;
        this.speed = 5;
        this.position = new Point(0, canvas_height - this.height);
    }
    set speed(value) {
        this._speed = parseInt(value);
        let speed_input = document.getElementById("speed_range");
        let speed_value = document.getElementById("speed_value");
        speed_input.value = value;
        speed_value.innerText = value;
    }
    get speed() {
        return this._speed;
    }
    move() {
        if (this.running) {
            this.position.x += this.speed;
            if (this.position.x > canvas_width - this.width) {
                this.running = false;
                scores.push({
                    raindrops: total_number_of_raindrops,
                    speed: this.speed,
                    count: count,
                });
                update_graph();
                if (this.autorun) {
                    this.speed += 1;
                    if (this.speed > 20) {
                        this.speed = 1;
                    }
                    go();
                }
            }
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = "#FFA41D";
        ctx.rect(this.position.x, this.position.y, this.width, this.height);
        ctx.fill();
    }
}

let actor = new Actor(50, 100);
let raindrops = [];

function hasIntersection(raindrop, actor) {
    const distX = Math.abs(
        raindrop.position.x - actor.position.x - actor.width / 2
    );
    const distY = Math.abs(
        raindrop.position.y - actor.position.y - actor.height / 2
    );

    if (distX > actor.width / 2 + raindrop.radius) {
        return false;
    }
    if (distY > actor.height / 2 + raindrop.radius) {
        return false;
    }

    if (distX <= actor.width / 2) {
        return true;
    }
    if (distY <= actor.height / 2) {
        return true;
    }

    const delta_x = distX - actor.width / 2;
    const delta_y = distY - actor.height / 2;
    return (
        delta_x * delta_x + delta_y * delta_y <=
        raindrop.radius * raindrop.radius
    );
}

function compute_collisions() {
    raindrops.forEach((raindrop) => {
        if (hasIntersection(raindrop, actor)) {
            count++;
            raindrop.alive = false;
        }
    });
}

function refillRaindrops() {
    let numbers_to_add = total_number_of_raindrops - raindrops.length;
    for (let i = 0; i < numbers_to_add; i++) {
        let x = Math.floor(Math.random() * (canvas_width - 200) + 100);
        raindrops.push(new Raindrop(x, 0, RAINDROP_RADIUS));
    }
}

function reset() {
    raindrops = [];
    refillRaindrops();
    actor = new Actor(50, 100);
    count = 0;
}

function update_raindrops() {
    let raindrops_input = document.getElementById("number_of_raindrops");
    let raindrops_value = document.getElementById("raindrops_value");
    total_number_of_raindrops = parseInt(raindrops_input.value);
    raindrops_value.innerHTML = total_number_of_raindrops;
}

function update_speed() {
    speed_input = document.getElementById("speed_range");
    actor.speed = parseInt(speed_input.value);
}

function go() {
    actor.position.x = 0;
    count = 0;
    actor.running = true;
}

function autorun() {
    actor.autorun = true;
}

function update_graph() {
    graph = document.getElementById("graph");
    Plotly.newPlot(
        graph,
        [
            {
                x: scores.map((o) => o.speed),
                y: scores.map((o) => o.count),
                type: "scatter",
                mode: "markers",
            },
        ],
        {
            title: "Raindrops count by speed",
            xaxis: { title: "Speed" },
            yaxis: { title: "Raindrops count" },
        }
    );
}

let average_rain_speed = 0;
let compute_average_rain_speed_counter = 0;

function compute_average_rain_speed() {
    speed_array = raindrops.map((rd) => rd.speed);
    average_rain_speed =
        Math.round(
            (speed_array.reduce((a, b) => a + b, 0) / speed_array.length) * 10
        ) / 10;
}

function draw() {
    const canvas = document.getElementById("canvas");
    if (canvas.getContext) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, 1000, 500);

        actor.draw(ctx);
        actor.move();

        raindrops.forEach((raindrop) => {
            raindrop.draw(ctx);
        });
        raindrops.forEach((raindrop) => {
            raindrop.fall();
        });
        compute_collisions();

        raindrops = raindrops.filter((r) => r.alive);
        refillRaindrops();
        if (compute_average_rain_speed_counter <= 0) {
            compute_average_rain_speed();
            compute_average_rain_speed_counter = 100;
        }
        compute_average_rain_speed_counter--;

        ctx.beginPath();
        ctx.font = "20px Arial";
        ctx.fillStyle = "#000000";
        ctx.fillText("Count: " + count, 5, 30);
        ctx.fillText("Average rain speed: " + average_rain_speed, 5, 60);
    }

    requestAnimationFrame(draw);
}

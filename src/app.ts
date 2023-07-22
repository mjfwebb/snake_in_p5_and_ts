import P5 from "p5";
import "p5/lib/addons/p5.dom";
import "p5/lib/addons/p5.sound.js";
import "./style.scss";

enum e_state
{
	menu,
	game,
	lose,
};

type s_v2i = {
	x : number;
	y : number;
};
type s_particle = {
	x : number;
	y : number;
	dir_x : number;
	dir_y : number;
	speed : number;
	radius : number;
	color : P5.Color;
	time : number;
};
let tile_size : number = 48;
let tiles : number = 16;
let move_timer = 0.0;
let x_dir = 1;
let y_dir = 0;
let last_x_dir = 0;
let last_y_dir = 0;
const c_move_delay = 0.05;
const c_particle_duration = 0.5;
const ww = tiles * tile_size;
const wh = tiles * tile_size;
let snake : s_v2i[] = [];
let particles : s_particle[] = [];
let reset_game = true;
let apple : s_v2i;
let state : e_state = e_state.menu;
let sound;

const sketch = (p5: P5) => {

	p5.setup = () => {
		const canvas = p5.createCanvas(ww, wh);
		canvas.parent("app");

		p5.background("white");

		sound = p5.loadSound("./apple.wav");
	};

	p5.mouseClicked = () => {
		state = e_state.game;
		reset_game = true;
	}

	p5.draw = () => draw(p5);
	p5.keyPressed = (keyCode : KeyboardEvent) => {
		switch(state)
		{
			case e_state.menu:
			{
				switch(keyCode.key)
				{
					case "Enter":
					{
						state = e_state.game;
						reset_game = true;
					} break;
				}
			} break;

			case e_state.lose:
			{
				switch(keyCode.key)
				{
					case "Enter":
					{
						state = e_state.game;
						reset_game = true;
					} break;
				}
			} break;

			case e_state.game:
			{
				switch(keyCode.key)
				{
					case "ArrowUp":
					{
						if(last_y_dir === 0)
						{
							x_dir = 0;
							y_dir = -1;
						}
					} break;

					case "ArrowDown":
					{
						if(last_y_dir === 0)
						{
							x_dir = 0;
							y_dir = 1;
						}
					} break;

					case "ArrowLeft":
					{
						if(last_x_dir === 0)
						{
							x_dir = -1;
							y_dir = 0;
						}
					} break;

					case "ArrowRight":
					{
						if(last_x_dir === 0)
						{
							x_dir = 1;
							y_dir = 0;
						}
					} break;
				}
			} break;
		}
	}
};

function draw(p5: P5)
{
	let delta : number = p5.deltaTime / 1000.0;

	p5.background(200);
	p5.noStroke();

	if(reset_game)
	{
		reset_game = false;
		move_timer = 0;
		snake.length = 0;
		document.getElementById("athano").textContent = `Score: ${snake.length}`;
		particles.length = 0;
		snake.push({x:0, y:0});
		x_dir = 1;
		y_dir = 0;
		last_x_dir = 1;
		last_y_dir = 0;
		spawn_apple(p5);
	}

	switch(state)
	{
		case e_state.menu:
		{
			p5.fill("black");
			p5.textSize(66);
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.text("Athano's Snake", tiles * tile_size / 2, tiles * tile_size / 2);
			p5.textSize(24);
			p5.text("It's very pog", tiles * tile_size / 2, tiles * tile_size / 2 + 50);
			p5.text("Press ENTER to start", tiles * tile_size / 2, tiles * tile_size / 2 + 100);
		} break;

		case e_state.lose:
		{
			p5.fill("red");
			p5.textSize(66);
			p5.textAlign(p5.CENTER, p5.CENTER);
			p5.text(`Score: ${snake.length - 1}`, tiles * tile_size / 2, tiles * tile_size / 2);
			p5.textSize(24);
			p5.fill("black");
			p5.text("Press ENTER to try again", tiles * tile_size / 2, tiles * tile_size / 2 + 50);
		} break;

		case e_state.game:
		{
			move_timer += delta;
			if(move_timer > c_move_delay)
			{
				move_timer -= c_move_delay;

				let head = {...snake[0]}
				head.x += x_dir;
				head.y += y_dir;

				if(head.x >= tiles)
				{
					head.x = 0;
				}
				else if(head.x < 0)
				{
					head.x = tiles - 1;
				}

				if(head.y >= tiles)
				{
					head.y = 0;
				}
				else if(head.y < 0)
				{
					head.y = tiles - 1;
				}

				if(head.x === apple.x && head.y === apple.y)
				{
					snake.push({x: 0, y: 0});
					spawn_apple(p5);

					// (async() => sound.play());
					sound.play();

					document.getElementById("athano").textContent = `Score: ${snake.length - 1}`;

					for(let i = 0; i < 5; i++)
					{
						let x = i === 0 ? head.x * tile_size : p5.random(1) * ww;
						let y = i === 0 ? head.y * tile_size : p5.random(1) * wh;
						setTimeout(() => {
							spawn_particles(100, x, y, random_color(p5), p5);
						}, i * 250);
					}
				}

				for(let i = snake.length - 1; i >= 1; i--)
				{
					snake[i] = snake[i - 1];
				}

				last_x_dir = x_dir;
				last_y_dir = y_dir;

				snake[0] = head;

				// @Note(tkap, 22/07/2023): Check for overlap
				for(let i = 1; i < snake.length; i++)
				{
					if(snake[0].x === snake[i].x && snake[0].y === snake[i].y)
					{
						state = e_state.lose;
						break;
					}
				}
			}

			snake.forEach((element, index) => {
				let head_color = p5.color(0, 255, 0);
				let tail_color = p5.color(0, 100, 0);
				let color;
				if(snake.length === 1)
				{
					color = head_color;
				}
				else
				{
					let dist = Math.min(index, snake.length - index);
					color = p5.lerpColor(head_color, tail_color, index / (snake.length - 1));
				}
				p5.fill(color);
				p5.rect(element.x * tile_size, element.y * tile_size, tile_size, tile_size);
			});

			p5.fill("red");
			p5.rect(apple.x * tile_size, apple.y * tile_size, tile_size, tile_size);
		} break;
	}

	particles.forEach((p, index) => {
		p.x += p.dir_x * p.speed * delta;
		p.y += p.dir_y * p.speed * delta;
		let percent_left = 1 - (p.time / c_particle_duration);
		let col : P5.Color = p.color;
		col.alpha = percent_left * 255;
		p5.fill(col);
		p5.circle(p.x, p.y, p.radius * percent_left);
		p.time += delta;
	});
	particles =	particles.filter((p) => p.time < c_particle_duration);

}

function spawn_apple(p5 : P5)
{
	apple = {
		x: Math.floor(p5.random(tiles)),
		y: Math.floor(p5.random(tiles)),
	};
}

function spawn_particles(count : number, x : number, y : number, color : P5.Color, p5: P5)
{
	for(let i = 0; i < count; i++)
	{
		let angle = p5.random(p5.TAU);
		let p : s_particle = {
			x: x,
			y: y,
			dir_x: Math.cos(angle),
			dir_y: Math.sin(angle),
			speed: p5.random(400),
			radius: 16,
			color: color,
			time: 0,
		};
		particles.push(p);
	}
}

function random_color(p5 : P5)
{
	return p5.color(p5.random(255), p5.random(255), p5.random(255), 255);
}

new P5(sketch);

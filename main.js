Vue.component('timer', 
{

	template: 	`<div id="status">
					<p>{{ message }}{{ remaining }}</p>
				</div>`,

	data() 
	{
		return {
			message: 'Выберите уровень сложности',
			remaining: '',
			intervalId: null
		}
	},

	created() 
	{

		var self = this;

		this.$parent.$on('stateChange', function($event) 
		{
			switch($event) 
			{
				case 'capturing': 
					self.startTimer();
					break;
				case 'processing':
					self.stopTimer('Yikes! You tapped a light!');
					self.startTimer();
					break;			
				case 'playing':
					self.stopTimer('Смотри внимательно!');
					break;
				case 'goodjob':
					self.stopTimer('Отлично! Добавляем новый цвет....');
					break;
				case 'gameover':
					self.stopTimer('Оу, ты проиграл. Нажми Start, чтобы начать заново');
					break;
				default:
					console.log("Timer: state changed to [" + $event + "]");
			}
		});
	},
	methods: 
	{
		startTimer: function() 
		{
			if (this.intervalId === null) 
			{
				this.remaining = 10;
				this.message = '';
				this.intervalId = window.setInterval(this.tick, 1000);
			}
		},
		stopTimer: function(text) 
		{
			window.clearInterval(this.intervalId);
			this.message = text;
			this.remaining = '';
			this.intervalId = null;
		},
		tick: function() 
		{
			console.log('Tick!');
			this.remaining--;
			if (this.remaining === 0) 
			{
				this.stopTimer('Время вышло! Нажми Start, чтобы начать заново');
				this.$emit('expired');
			} 
		}
	}
});

var simon = new Vue(
{
	el: '#main',

	data: {
		longest: 0,
		current: 0,
		isTimerActive: false,
		sequence: [],
		taps: [],
		playSequenceId: null,
		currentButton: '',
		playSequenceCounter: 0,
		lights: ['blue', 'red', 'yellow', 'green'],
		picked: 'easy'
	},

	created() 
	{
		this.$on('expired', function($event) 
		{
			this.gameOver();
		});
	},

	methods: 
	{
		start: function() 
		{
			this.sequence = [];
			this.taps = [];
			this.isTimerActive = true;
			this.current = 1;
			playSequenceCounter = 0;

			if (this.picked === 'easy') {
				this.playSequence();
			} else if (this.picked === 'medium') {
				this.playSequenceMedium();
			} else if (this.picked === 'hard') {
				this.playSequenceHard();
			} 

			console.log(this.picked)
		},

		playSound(sound) {
			if (sound) {
				var audio = new Audio(sound);
				audio.play();
			}
		},

		playSoundRed() {
			if (currentButton === 'red') {
				playSound('./audio/1.mp3')
			}
		},

		captureTap: function(color) 
		{

			if (this.isTimerActive) 
			{
				this.$emit('stateChange', 'processing');
				this.currentButton = color;
				var self = this;
				setTimeout(function() 
				{
					self.currentButton = '';
				}, 300);

				var last_index = this.taps.length;
				this.taps.push(color);
				if (color === this.sequence[last_index]) 
				{					
					if (this.taps.length === this.sequence.length) 
					{
						this.taps = [];
						this.$emit('stateChange', 'goodjob');
						this.current = this.sequence.length + 1;
						if (this.longest < this.sequence.length) 
						{
							this.longest = this.sequence.length;
						}

						if (this.picked === 'easy') {
							setTimeout(function () {
								self.playSequence();
							}, 1000);
						} else if (this.picked === 'medium') {
							setTimeout(function () {
								self.playSequenceMedium();
							}, 1000);
						} else if (this.picked === 'hard') {
							setTimeout(function () {
								self.playSequenceHard();
							}, 1000);
						}
					}
				}
				else {
					this.gameOver();
				}
			}
		},

		addToSequence: function() {
			var index = Math.floor(Math.random() * 4);
			this.sequence.push(this.lights[index]);
		},

		playSequence: function() 
		{
			var self = this;
			self.addToSequence();
			self.$emit('stateChange', 'playing');
			// if (document.querySelector('input').value(''))
			self.playSequenceId = window.setInterval(function() 
			{
				self.currentButton = self.sequence[self.playSequenceCounter];
				setTimeout(function() 
				{
					self.currentButton = '';
					self.playSequenceCounter++;
					if (self.playSequenceCounter === self.sequence.length) 
					{
						window.clearInterval(self.playSequenceId);
						self.playSequenceCounter = 0;
						self.$emit('stateChange', 'capturing');
					}
				},1000);
			}, 1500);
		},

		playSequenceMedium: function () {
			var self = this;
			self.addToSequence();
			self.$emit('stateChange', 'playing');
			// if (document.querySelector('input').value(''))
			self.playSequenceId = window.setInterval(function () {
				self.currentButton = self.sequence[self.playSequenceCounter];
				setTimeout(function () {
					self.currentButton = '';
					self.playSequenceCounter++;
					if (self.playSequenceCounter === self.sequence.length) {
						window.clearInterval(self.playSequenceId);
						self.playSequenceCounter = 0;
						self.$emit('stateChange', 'capturing');
					}
				}, 500);
			}, 1000);
		},

		playSequenceHard: function () {
			var self = this;
			self.addToSequence();
			self.$emit('stateChange', 'playing');
			// if (document.querySelector('input').value(''))
			self.playSequenceId = window.setInterval(function () {
				self.currentButton = self.sequence[self.playSequenceCounter];
				setTimeout(function () {
					self.currentButton = '';
					self.playSequenceCounter++;
					if (self.playSequenceCounter === self.sequence.length) {
						window.clearInterval(self.playSequenceId);
						self.playSequenceCounter = 0;
						self.$emit('stateChange', 'capturing');
					}
				}, 300);
			}, 400);
		},

		gameOver: function() 
		{
			this.$emit('stateChange', 'gameover');
		}
	}
	});




		

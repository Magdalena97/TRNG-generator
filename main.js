google.charts.load("current", {packages:["corechart"]});

// Shannon entropy
const entropy = str => {
	return [...new Set(str)]
	  .map(chr => {
		return str.match(new RegExp(chr, 'g')).length;
	  })
	  .reduce((sum, frequency) => {
		let p = frequency / str.length;
		return sum + p * Math.log2(1 / p);
	  }, 0);
};

const canvas_input = document.querySelector('#canvas_input');
const context = canvas_input.getContext('2d');

const canvas_output = document.querySelector('#canvas_output');
const context2 = canvas_output.getContext('2d');

context.beginPath();

var histogram_data = new Array(255).fill(0);
var histogram_data_from_source = new Array(255).fill(0);


var long_string = '';
var long_string_from_source = '';

var mouse = {x: -1, y: -1};
var N = 400;
var K = 5000;

function draw(ctx, x, y) {
	ctx.beginPath();
	ctx.moveTo(mouse.x, mouse.y);
	ctx.lineTo(x, y);
	ctx.strokeStyle = 5;
	ctx.lineWidth = 5;
	ctx.stroke();
	ctx.closePath();
}


function get_post_processing_coordinates(canvas, size) {
	var array = [];
	var ctx = canvas.getContext('2d');

	for (let i=0; i<canvas_input.width/size; i++) {
        for (let j=0; j<canvas_input.height/size; j++) {
            var imgData=ctx.getImageData(i*size,j*size,1,1);
						count = 0;
						imgData.data.forEach((value, index) => {
							if (value!=0) array.push([i*size,j*size]);
						});
		}
	}
	return array;
}

function transform_to_bin(canvas) {
	var string = '';
	var ctx = canvas.getContext('2d');
	let width = canvas_input.width / 16;
	let height = canvas_input.height / 16;

	for (let i=0; i<16; i++) {
        for (let j=0; j<16; j++) {
						var imgData=ctx.getImageData(width*i,height*j,width,height);
						count = 0;
						count = imgData.data.reduce((counter, pixel) => {
							if (pixel!=0) return counter+1;
							else return counter;
						});
            if (count%2==0) {
                string += '0';
            } else {
                string += '1';
            }
		}
	}
	return string;
} 

function bin_to_8bit_array(string) {
	var integer = [];
	for (let i=0; i<string.length-1; i=i+8) {
		integer.push(parseInt((string.slice(i, i+8) + '').replace(/[^01]/gi, ''), 2));
	}
	return integer;
}

function clear(ctx) {
    ctx.clearRect(0, 0, canvas_input.width, canvas_input.height);
    document.querySelector("#inputText").value = '';	
}
clear(context);

const add_to_histogram_action = function() {
		//Histogram 1
		histogram_data = [...transform_to_bin(canvas_output)].map((value, index) => {
			return histogram_data[index] + parseInt(value);
		});
	
		var trace = {
			y: histogram_data,
			type: 'bar',
			};
		var data = [trace];
		Plotly.newPlot('histogram', data);
	
		//Histogram 2
		histogram_data_from_source = [...transform_to_bin(canvas_input)].map((value, index) => {
			return histogram_data_from_source[index] + parseInt(value);
		});
	
		var trace2 = {
			y: histogram_data_from_source,
			type: 'bar',
			};
		var data2 = [trace2];
		Plotly.newPlot('histogram2', data2);
};

const button_add_to_histogram = document.querySelector("#add_to_histogram");
button_add_to_histogram.addEventListener('click', add_to_histogram_action);


const reset_histogram = function() {
	var trace = {
		x: [],
		type: 'histogram',
	  };
	var data = [trace];
	Plotly.newPlot('histogram', data);

	var trace2 = {
		x: [],
		type: 'histogram',
	  };
	var data2 = [trace];
	Plotly.newPlot('histogram2', data);

	long_string = "";
	long_string_from_source = "";
	document.querySelector("#binary_input").value = long_string_from_source;
	document.querySelector("#binary_output").value = long_string;
};

const button_reset_histogram = document.querySelector("#reset_histogram");
button_reset_histogram.addEventListener('click', reset_histogram);

canvas_input.addEventListener('mousemove', function(e) {
	if (mouse.x == -1 && mouse.y == -1) {
		mouse.x = e.pageX - this.offsetLeft;
		mouse.y = e.pageY - this.offsetTop;
	}
	draw(context, e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
	mouse.x = e.pageX - this.offsetLeft;
	mouse.y = e.pageY - this.offsetTop;
	//context.fillRect(mouse.x, mouse.y, 5, 5);
}, false);

canvas_input.addEventListener('mouseleave', function(e) {
	mouse.x = -1;
	mouse.y = -1;
});

let tileWidth = canvas_input.width / 16;
let tileHeight = canvas_input.height / 16;
const button_binary = document.querySelector("#binary");
var string = '';
var text = "";
let text_table = [];//tablica z znakami z textu
const button_binary_action = function () {

	
var znaki = transform_to_bin(canvas_output);
//console.log(znaki);
	clear(context2);
	//Post-processing
	var discretized = get_post_processing_coordinates(canvas_input, 5);
	for (let b=0; b<50; b++) {
		discretized = discretized.map((value, index) => {
			return [
				parseInt((value[0]+value[1])%N),
				parseInt((value[1]+K*Math.sin(N/Math.PI))%N),
			];
		});
		// for (let a=0; a<discretized.length; a++) {
		// 	discretized[a][0] = parseInt((discretized[a][0]+discretized[a][1])%N);
		// 	discretized[a][1] = parseInt(((discretized[a][1]+K*Math.sin(N/Math.PI)))%N);
		// }
	}

	discretized.forEach((value, index) => {
		context2.fillRect(value[0], value[1], 5, 5);
	});
	
	string = transform_to_bin(canvas_output);
	string_from_source = transform_to_bin(canvas_input);
		
	document.querySelector("#inputText").value = string;
	long_string += string;	
	long_string_from_source += string_from_source;
	document.querySelector("#entropy1").innerHTML = entropy(long_string);
	document.querySelector("#entropy2").innerHTML = entropy(long_string_from_source);
	document.querySelector("#binary_input").value = long_string_from_source;
	document.querySelector("#binary_output").value = long_string;
	//console.log(string);
	
	text = bin_to_text(to_bin(string));
	for(let j=0;j<32;j++){
		text_table.push(text.charAt(j));
	} 
	document.getElementById("inputText1").value = text;
	console.log("Po zamianie na text: " + text);
	
};
//dzielinie ciagu znakow na 8-bitowe ciagi
function to_bin(string){
	let binCode = []; 
	for(let i=0;i<string.length;i++){
		if(i%8==0)
			binCode.push(string.slice(i,i+8));
	}
	return binCode;
}
//zamiana 8-bitowych ciagów na litery 
function bin_to_text(to_bin){
	var binString = '';
	to_bin.map(function(bin) {
		binString += String.fromCharCode(65 + (parseInt(bin, 2))%25);
	});
	return binString;
}
let value_key = "";//wartosc klucza szyfrujacego

const button_add_key = document.querySelector("#confirm");
button_add_key.addEventListener('click', confirm_action);

function confirm_action(){
	value_key = document.getElementById("inputText2").value;
	value_key = value_key.toUpperCase();
	value_key = [...value_key];
	let lenght = value_key.length;
	
	if(lenght!=32){
		while(value_key.length<32){
			value_key = value_key.concat(value_key);
		}
		value_key = value_key.splice(value_key-32,32);
	}
	console.log("Klucz szyfrujacy: " + value_key);
	Vigenere_cipher(value_key);
	
}
let table = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];

function Vigenere_cipher(value_key){
	let index = "";//index z table litery z badanego słowa
	let przesuniecie = "";//indexz table litery z klucza 
	let przesunieta_tab1 = [];//pomocnicza tablica
	let przesunieta_tab2 = [];//pomocnicza tablica
	let przesunieta_tab = [];//tablica z przesunietymi literami alfabetu
	let zakodowane_slowo = [];//tablica z zakodowanym słowem
	let znak1 = "";//badany znak z textu
	let znak2 = "";//badany znak z hasla

	for(let i=0; i<32;i++){
		//index litery z tekstu
		znak1=text_table[i];
		index = table.indexOf(znak1);
		//index litery z hasla
		znak2=value_key[i];
		przesuniecie = table.indexOf(znak2);
		przesunieta_tab1 = table.slice(0,przesuniecie);
		przesunieta_tab2 = table.slice(przesuniecie);
		przesunieta_tab = [...przesunieta_tab2,...przesunieta_tab1];
		zakodowane_slowo.push(przesunieta_tab[index]);
		
	}
	console.log("Zakodowane słowo: " + zakodowane_slowo);
	document.getElementById("inputText3").value = zakodowane_slowo.join("");
 }
button_binary.addEventListener('click', button_binary_action);

const button_clear = document.querySelector("#clear");

const clear_action = function() {
	clear(context);
	clear(context2);
}
button_clear.addEventListener('click', clear_action);

canvas_input.addEventListener('click', function(e) {
	clear(context2);
	button_binary_action();
	add_to_histogram_action();
	clear(context);
});

document.querySelector("#numbers_button").addEventListener("click", function() {
	K = document.querySelector("#K_number").value;
	if (document.querySelector("#N_number").value != N) {
		N = document.querySelector("#N_number").value;
		canvas_input.width = N;
		canvas_input.height = N;
		canvas_output.width = N;
		canvas_output.height = N;
	}
});
// Variables
var emptyCells = [];
var baghCell = [];
var bokriCells = [];
var bokri_captured = 0;
var iList, jList, bokriImages, baghImages;

const board = document.getElementById("board");
const menu = document.getElementById("menu");
const characterTurn = document.getElementById("characterTurn");
const characterImage = document.getElementById("characterImage");
const winningMessage = document.getElementById("winningMessage");
const message = document.getElementById("message");
const restartButton = document.querySelectorAll(".restartButton");
var hide = document.querySelectorAll(".bokri-choice, .button-container");

restartButton.forEach((button) =>
	button.addEventListener("click", () => {
		location.reload();
		return false;
	})
);

// Functions
function setCharacter(character) {
	bokriImages = document.getElementsByClassName("bokri-image");
	baghImages = document.getElementsByClassName("bagh-image");

	switch (character) {
		case "Bagh":
			Array.from(bokriImages).forEach((img) => {
				img.removeAttribute("draggable");
				img.removeAttribute("ondragstart");
			});

			Array.from(baghImages).forEach((img) => {
				img.setAttribute("draggable", "true");
				img.setAttribute("ondragstart", "dragBagh(event)");
			});

			characterTurn.innerHTML = "Bagh's Turn";
			characterImage.src = "./img/bagh.png";
			break;

		case "Bokri":
			Array.from(baghImages).forEach((img) => {
				img.removeAttribute("draggable");
				img.removeAttribute("ondragstart");
			});

			Array.from(bokriImages).forEach((img) => {
				img.setAttribute("draggable", "true");
				img.setAttribute("ondragstart", "dragBokri(event)");
			});

			characterTurn.innerHTML = "Bokri's Turn";
			characterImage.src = "./img/bokri.png";
			break;

		default:
			Array.from(bokriImages).forEach((img) => {
				img.setAttribute("draggable", "true");
				img.setAttribute("ondragstart", "dragBokri(event)");
			});

			emptyCells.forEach((id) => {
				cell = document.getElementById(id.toString());
				cell.setAttribute("ondrop", "dropBokri(event)");
				cell.setAttribute("ondragover", "allowDrop(event)");
			});

			characterTurn.innerHTML = "Bokri's Turn";
			characterImage.src = "./img/bokri.png";
			break;
	}
}

function twoDirectionCells([i, j]) {
	var returnList = [];

	if (i + 1 < 3) returnList.push((i + 2) * 10 + j);

	if (i < 3 && j + 1 < 4) returnList.push((i + 1) * 10 + j + 1);
	else if (j + 1 < 4) returnList.push((i - 1) * 10 + j + 1);

	if (i < 3 && i - 1 > 0) returnList.push((i - 1) * 10 + j);
	else if (i - 1 > 0) returnList.push((i - 2) * 10 + j);

	if (i < 3 && j - 1 > 0) returnList.push((i + 1) * 10 + j - 1);
	else if (j - 1 > 0) returnList.push((i - 1) * 10 + j - 1);

	return returnList;
}

function threeDirectionCells([i, j]) {
	var returnList = [];
	iList = [i - 1, i + 1];
	jList = [j - 1, j, j + 1];

	iList.forEach((ni) => {
		jList.forEach((nj) => {
			if ((i !== ni || j !== nj) & (nj < 5) & (nj > 0) & (ni < 4) & (ni > 0) & (ni + 1 !== (j + nj) / 2)) {
				returnList.push(ni * 10 + nj);
			}
			if ((i !== 3) & (j == nj)) {
				returnList.push((ni + 1) * 10 + nj);
			}
			if ((i == 3) & (j == nj)) {
				returnList.push((ni - 1) * 10 + nj);
			}
		});
	});

	const index = returnList.indexOf(i * 10 + j);

	if (index > -1) returnList.splice(index, 1);

	return returnList;
}

function fourDirectionCells([i, j]) {
	var returnList = [];
	iList = [i - 1, i + 1];
	jList = [j - 1, j + 1];

	iList.forEach((ni) => {
		jList.forEach((nj) => {
			if ((i !== ni || j !== nj) & (nj < 6) & (nj > 0) & (ni < 4) & (ni > 0)) {
				returnList.push(ni * 10 + nj);
			}
		});
	});

	const index = returnList.indexOf(i * 10 + j);

	if (index > -1) returnList.splice(index, 1);

	return returnList;
}

var possibleJumps, returnList, moveList;

function cellMoves([i, j]) {
	if ((i !== 2) & (j !== 3) & ((i + j) % 2 == 0)) {
		return (moveList = twoDirectionCells([i, j]));
	} else if ((i == 2) & (j % 2 == 0)) {
		return (moveList = fourDirectionCells([i, j]));
	} else {
		return (moveList = threeDirectionCells([i, j]));
	}
}

function possibleBokriMoves([i, j]) {
	possibleMoves = cellMoves([i, j]);
	returnList = [...possibleMoves];
	possibleMoves.forEach((cell) => {
		if (!emptyCells.includes(cell)) {
			returnList.splice(returnList.indexOf(cell), 1);
		}
	});
	return returnList;
}

function possibleBaghMoves([i, j]) {
	possibleMoves = cellMoves([i, j]);
	possibleJumps = [];
	possibleMoves.forEach((cell) => {
		if (bokriCells.includes(cell)) {
			var x2 = Math.floor(cell / 10);
			var y2 = cell % 10;
			var x3 = x2 + x2 - i;
			var y3 = y2 + y2 - j;

			if (emptyCells.includes(x3 * 10 + y3)) {
				possibleJumps.push(x3 * 10 + y3);
			}
		}
	});

	possibleMoves = possibleMoves.concat(possibleJumps);
	returnList = [...possibleMoves];
	possibleMoves.forEach((cell) => {
		if (!emptyCells.includes(cell)) {
			returnList.splice(returnList.indexOf(cell), 1);
		}
	});
	return returnList;
}

function prepPhase() {
	var bokriPlace,
		bCells = [];
	board.classList.add("hide");
	menu.classList.remove("show");
	[].forEach.call(hide, function (hidden) {
		hidden.classList.remove("hide");
	});

	document.getElementById("playButton").addEventListener("click", () => {
		var selector = document.querySelector('input[name="bokriPlacing"]:checked');
		if (selector) bokriPlace = selector.value;

		if (bokriPlace == "bLeft") {
			bCells = [11, 22, 31];
			startGame(bCells);
		} else if (bokriPlace == "bRight") {
			bCells = [15, 24, 35];
			startGame(bCells);
		} else {
			alert("Please select a placing for Bokri!");
		}
	});
}

prepPhase();

function startGame(bCells) {
	board.classList.remove("hide");
	board.innerHTML = "";
	message.innerHTML = "";

	[].forEach.call(hide, function (hidden) {
		hidden.classList.add("hide");
	});

	setCharacter("Bagh");
	emptyCells = [];

	iList = [1, 2, 3];
	jList = [1, 2, 3, 4, 5];
	iList.forEach((ni) => {
		jList.forEach((nj) => {
			if ((ni + nj) % 2 == 0) emptyCells.push(ni * 10 + nj);
			container = document.createElement("div");
			container.classList.add("cell");
			container.id = ni * 10 + nj;
			board.appendChild(container);
		});
	});

	emptyCells.forEach((id) => {
		cell = document.getElementById(id.toString());
		cell.setAttribute("onclick", "baghPlacing(this.id)");
	});

	baghCell = [];
	bokriCells = [];
	bokri_captured = 0;

	bokriCells = bCells;
	bokriCells.forEach((id) => {
		myImg = document.createElement("img");
		myImg.src = "./img/bokri.png";
		myImg.id = "bokri-" + id;
		myImg.classList.add("bokri-image");

		container = document.getElementById(id);
		container.removeAttribute("onclick");
		container.appendChild(myImg);

		emptyCells.splice(emptyCells.indexOf(id), 1);
	});

	winningMessage.classList.remove("show");
	menu.classList.add("show");
}

function allowDrop(event) {
	event.preventDefault();
}

var possibleMoves, index, data, idBagh, idBokri, movedImage, cell;

function dragBagh(event) {
	event.dataTransfer.setData("bagh-id", event.target.id);
}

function dropBagh(event) {
	data = event.dataTransfer.getData("bagh-id");
	idBagh = parseInt(data.slice(-2));

	possibleMoves = possibleBaghMoves([Math.floor(idBagh / 10), idBagh % 10]);
	index = possibleMoves.indexOf(parseInt(event.target.id));
	if (index > -1) {
		event.preventDefault();

		movedImage = document.getElementById(data);
		movedImage.id = "bagh-" + event.target.id;
		event.target.appendChild(movedImage);

		emptyCells.push(idBagh);
		emptyCells.splice(emptyCells.indexOf(parseInt(event.target.id)), 1);

		baghCell.splice(baghCell.indexOf(parseInt(idBagh)), 1);
		baghCell.push(parseInt(event.target.id));

		//has bagh jumped?
		if (possibleJumps.includes(parseInt(event.target.id))) {
			x1 = Math.floor(idBagh / 10);
			y1 = idBagh % 10;

			x3 = Math.floor(parseInt(event.target.id) / 10);
			y3 = parseInt(event.target.id) % 10;

			x2 = parseInt((x3 + x1) / 2);
			y2 = parseInt((y1 + y3) / 2);

			idB = parseInt(x2 * 10 + y2).toString();
			containerB = document.getElementById(idB);
			containerB.innerHTML = "";

			bokriCells.splice(bokriCells.indexOf(parseInt(x2 * 10 + y2)), 1);
			emptyCells.push(parseInt(x2 * 10 + y2));

			bokri_captured += 1;
		}

		if (hasBaghWon()) {
			winningMessage.classList.add("show");
			message.innerHTML = "Bagh has won!";
		}

		emptyCells.forEach((id) => {
			cell = document.getElementById(id.toString());
			cell.removeAttribute("ondrop");
			cell.removeAttribute("ondragover");
			cell.setAttribute("ondrop", "dropBokri(event)");
			cell.setAttribute("ondragover", "allowDrop(event)");
		});

		setCharacter("Bokri");
	}
}

function dragBokri(event) {
	event.dataTransfer.setData("bokri-id", event.target.id);
}

function dropBokri(event) {
	data = event.dataTransfer.getData("bokri-id");
	idBokri = parseInt(data.slice(-2));

	possibleMoves = possibleBokriMoves([Math.floor(idBokri / 10), idBokri % 10]);
	index = possibleMoves.indexOf(parseInt(event.target.id));

	if (index > -1) {
		event.preventDefault();

		movedImage = document.getElementById(data);
		movedImage.id = "bokri-" + event.target.id;
		event.target.appendChild(movedImage);

		emptyCells.push(idBokri);
		emptyCells.splice(emptyCells.indexOf(parseInt(event.target.id)), 1);

		bokriCells.splice(bokriCells.indexOf(parseInt(idBokri)), 1);
		bokriCells.push(parseInt(event.target.id));

		if (hasBokriWon()) {
			winningMessage.classList.add("show");
			message.innerHTML = "Bokri has won!";
		}

		emptyCells.forEach((id) => {
			cell = document.getElementById(id.toString());
			cell.removeAttribute("ondrop");
			cell.removeAttribute("ondragover");
			cell.setAttribute("ondrop", "dropBagh(event)");
			cell.setAttribute("ondragover", "allowDrop(event)");
		});

		setCharacter("Bagh");
	}
	bestMove();
	aiBaghMovement();
}

function baghPlacing(containerId) {
	myImg = document.createElement("img");
	myImg.src = "./img/bagh.png";
	myImg.id = "bagh-" + containerId;
	myImg.classList.add("bagh-image");

	container = document.getElementById(containerId);
	container.appendChild(myImg);
	container.removeAttribute("onclick");

	baghCell.push(parseInt(containerId));
	emptyCells.splice(emptyCells.indexOf(parseInt(containerId)), 1);

	Array.from(document.getElementsByClassName("cell")).forEach((cell) => {
		cell.removeAttribute("onclick");
	});

	setCharacter("default");
}

function hasBaghWon() {
	return bokri_captured == 1 ? true : false;
}

function hasBokriWon() {
	var possibleBaghMovesList = [];
	baghCell.forEach((cell) => {
		possibleBaghMovesList = possibleBaghMovesList.concat(possibleBaghMoves([Math.floor(cell / 10), cell % 10]));
	});
	return possibleBaghMovesList.length == 0 ? true : false;
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function bestMove() {
	var i1, i2, j1, j2, bi, bj, minIndex, nearestBokri, nearestBokriMove, moveLocation, bestCell;
	var distanceList = [],
		arrList = [],
		arrList2 = [],
		cellDistances = [],
		tempList = [];

	if (possibleJumps.length !== 0) bestCell = possibleJumps;
	else {
		baghCell.forEach((cell) => {
			i1 = Math.floor(cell / 10);
			j1 = cell % 10;
		});
		bokriCells.forEach((cell) => {
			i2 = Math.floor(cell / 10);
			j2 = cell % 10;
			if (possibleBokriMoves([i2, j2]).length > 0) {
				tempList.push(cell);
				distanceList.push(distance(i1, j1, i2, j2));
			}
		});
		minIndex = distanceList.indexOf(Math.min(...distanceList));
		nearestBokri = tempList.slice(minIndex, minIndex + 1);

		nearestBokri.forEach((cell) => {
			bi = Math.floor(cell / 10);
			bj = cell % 10;
		});
		nearestBokriMove = possibleBokriMoves([bi, bj]);

		possibleBaghMoves([i1, j1]).forEach((cell) => {
			bi = Math.floor(cell / 10);
			bj = cell % 10;
			arrList.push([bi, bj]);
		});

		nearestBokriMove.forEach((cell) => {
			bi = Math.floor(cell / 10);
			bj = cell % 10;
			arrList2.push([bi, bj]);
		});

		tempList = [];
		arrList.forEach((element1) => {
			arrList2.forEach((element2) => {
				tempList.push(element1);
				cellDistances.push(distance(element1[0], element1[1], element2[0], element2[1]));
			});
		});
		minIndex = cellDistances.indexOf(Math.min(...cellDistances));
		moveLocation = tempList.slice(minIndex, minIndex + 1);
		var ml = [].concat(...moveLocation);
		bestCell = [ml[0] * 10 + ml[1]];
	}
	return bestCell;
}

var aiMove;

function aiBaghMovement() {
	var prevBaghId = parseInt(baghCell);
	aiMove = parseInt(bestMove());

	index = bestMove().indexOf(aiMove);
	if (index > -1) {
		container2 = document.getElementById(prevBaghId);
		container2.innerHTML = "";

		myImg = document.createElement("img");
		myImg.src = "./img/bagh.png";
		myImg.id = "bagh-" + aiMove;
		myImg.classList.add("bagh-image");

		container = document.getElementById(aiMove);
		container.appendChild(myImg);

		emptyCells.push(prevBaghId);
		emptyCells.splice(emptyCells.indexOf(parseInt(aiMove)), 1);

		baghCell.splice(baghCell.indexOf(parseInt(aiMove)), 1);
		baghCell.push(parseInt(aiMove));

		//has bagh jumped?
		if (possibleJumps.includes(parseInt(aiMove))) {
			console.log("Bagh has jumped!");
			x1 = Math.floor(aiMove / 10);
			y1 = aiMove % 10;

			x3 = Math.floor(parseInt(aiMove) / 10);
			y3 = parseInt(aiMove) % 10;

			x2 = parseInt((x3 + x1) / 2);
			y2 = parseInt((y1 + y3) / 2);

			idB = parseInt(x2 * 10 + y2).toString();
			containerB = document.getElementById(idB);
			containerB.innerHTML = "";

			bokriCells.splice(bokriCells.indexOf(parseInt(x2 * 10 + y2)), 1);
			emptyCells.push(parseInt(x2 * 10 + y2));

			bokri_captured += 1;
		}

		if (hasBaghWon()) {
			winningMessage.classList.add("show");
			message.innerHTML = "Bagh has won!";
		}

		emptyCells.forEach((id) => {
			cell = document.getElementById(id.toString());
			cell.removeAttribute("ondrop");
			cell.removeAttribute("ondragover");
			cell.setAttribute("ondrop", "dropBokri(event)");
			cell.setAttribute("ondragover", "allowDrop(event)");
		});

		setCharacter("Bokri");
	}
}

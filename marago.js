/* This file contains JavaScript for the Marago game */

/* Control the input panel for number of players to be initialized */
function initOpponents () {
    inp = document.getElementById('numOpponents');
    var num = inp.value;

    // Make sure it does not go out of bounds.
    if (num < (minPlayers-1)) {
	num = (minPlayers-1);
	inp.value=num;
    }
    if (num > (maxPlayers-1)) {
	num = (maxPlayers-1);
	inp.value=num;
    }

    // Initial house-cleaning since we are just setting up.
    numPlayers = parseInt(num)+1; // This may not be the best place to do this...
    // Block off the color of player 1.
    debug ("Blocking color "+document.getElementById('p0ColorSelector').value+" for player 1");
    // Check if Player 1 switched color, in which case free it up.
    if (document.getElementById('p0ColorSelector').value > 0) {
	playerColors[0].taken=false;
    }
    // Block off the color selected by player 1.
    playerColors[document.getElementById('p0ColorSelector').value].taken=true;

    // Now hide the panel
    document.getElementById('openingPanel').style.display = "none";

    debug("Initializing "+num+" opponents");

    pdiv = document.getElementById("initOpponentPlayersDiv");

    // Start with the header line
    pdiv.innerHTML = '<h2>Set up opponents for '
	+document.getElementById('p0Name').value+'</h2>';

    // Create the list element for the opponents
    var ol = document.createElement('OL');

    // Now create one <li> for each opponent
    for (var p=0; p<num; p++) {
	var li = document.createElement('li');
	// Start with player number and name text box
	li.innerHTML += (p+2)+'. Name:<input id="p'+(p+1)+'Name" type="text" class="nameEntryBox" value="Player '+(p+2)+'"/> ';
	// Now create a color selector div and put a selector in there.
	li.innerHTML += ' <span style="margin-left: 0.5em;">Color:</span>';
	var cdiv = document.createElement('div');
	cdiv.id = 'p'+(p+1)+'ColorDiv';
	cdiv.style.display = "inline-block";
	li.appendChild(cdiv);
	// Create a player type div with a checkbox
	var tspan = document.createElement('span');
	tspan.style.marginLeft = "0.5em";
	tspan.innerHTML = 'AI <input type="checkbox" id="p'+(p+1)+'IsNotHuman" checked onchange="document.getElementById(\'p'+(p+1)+'StrategyDiv\').style.display=(document.getElementById(\'p'+(p+1)+'IsNotHuman\').checked)?\'inline-block\':\'none\'";/>';
	li.appendChild(tspan);
	/* Now add a strategy selector div. What we do is to create as many options as there
	   are available combos of card and points strategies, e.g., min-min, min-max, etc.*/
	sDiv = document.createElement('div');
	sDiv.id = 'p'+(p+1)+'StrategyDiv';
	sDiv.style.marginLeft = '0.5em';
	sDiv.style.display = "inline-block";
	sDiv.innerHTML = 'Strat: ';
	var sSel = document.createElement('select');
	sSel.id = 'p'+(p+1)+'StrategySelector';
	for (var cs in AICardStrategies) {
	    for (var ps in AIPointStrategies) {
		var opt = document.createElement('option');
		var sname = AICardStrategies[cs]+'-'+AIPointStrategies[ps];
		opt.value = sname;
		opt.text = sname;
		sSel.add(opt); // Add each new option to the selector
	    }
	}
	sDiv.appendChild(sSel); // Add the selector to the strategy selector div
	li.appendChild(sDiv); // Add the strategy selector div to the list item
	ol.appendChild(li); // Add the list item to the list
    }

    // Finally append all the opponents to the <ol> list
    pdiv.appendChild(ol);

    // Now go back and populate the color selectors for each player
    // First, wipe out all .takens except for player 1.
    for (c in playerColors) { // Wipe out all colors except Player 1
	playerColors[c].taken=false;
    }
    playerColors[document.getElementById('p0ColorSelector').value].taken = 1;

    // Now create the individual color selectors
    for (var p = 0; p < num; p++) {
	createColorSelector(parseInt(p)+1);
    }

    // Now make sure the color selectors are initialized properly as to who is disabled
    for (var p = 0; p < numPlayers; p++) { // Note: num is the # of opponents, but total players is num+1;
	var myCol = document.getElementById('p'+p+'ColorSelector').value;
	for (var o = 0; o < numPlayers; o++) {
	    if (o != p) { // DO it to all other players
		document.getElementById('p'+o+'ColorSelector').options[myCol].disabled = true;
	    }
	}
    }

    //    pdiv.innerHTML += '<button id="setupOpponentsButton" onclick="randomizeOpponents()">Randomize</button>';
    var btn = document.createElement('button');
    btn.id = "setupOpponentsButton";
    btn.onclick = function() {randomizeOpponents();};
    btn.innerHTML = 'Randomize';

    pdiv.appendChild(btn);

    // Now make sure the div is visible and hide the other div.
    document.getElementById("opponentPlayersPanel").style.display = "block";

}


/* This function restarts a new game from scracth, it is called by clicking
   the new game button in the action panel */
function restartGame() {
    var response = confirm("This will start a new game with new players.\nAre you sure?");
    if (!response) 
	return;

    // Clear all the .taken except player
    for (var c in playerColors) {
	playerColors[c].taken = false;
    }
    updateColorSelectorStatuses();
    debug("Restarting the game");

    newGame();
}

/* This fuction gets invoke when the page is loaded or a new game is started */
function newGame() {

    debug("Starting a new game from "+arguments.callee.caller.name);

    /* If the page was just (re)loaded, check the URL params */
    if (arguments.callee.caller.name == "onload") { 
	var URLParams = getURLParams();
	
	// Check if we should use dibs & bids
	if (URLParams.dibs) {
	    useDibsAndBids = URLParams.dibs;
	    debug("This game will use Dibs & Bids");
	}
    }

    document.getElementById("gameSetupPanel").style.display = "block";
    document.getElementById('openingPanel').style.display = "block";
    document.getElementById("opponentPlayersPanel").style.display = "none";
    document.getElementById("board").style.display = "none";
    document.getElementById("playersPanel").style.display = "none";
    document.getElementById("gameActionsPanel").style.display = "none";
}


/* Create the players object */
function gameSetup () {

    debug("inside gameSetup");

    // See what card groups the user wants to use (e.g., 'all' or '1-3');
    groupsUsed = document.getElementById("cardGroups").value;

    document.getElementById("gameSetupPanel").style.display = "none";
    document.getElementById("board").style.display = "block";
    document.getElementById("playersPanel").style.display = "block";
    document.getElementById("gameActionsPanel").style.display = "block";
    initializeGame();
    
}

/* Initialize the game. */
function initializeGame() {
    debug("Initializing game...");

    // Reset the game turns counter and history
    gameTurns=0;
    turnsHistory=[];

    currentPlayer = 0;

    // Make sure the player array is reset and created from scratch
    players = [];
    createPlayers();

    /* Group ownership initialization - has to come before players. Why??? PPG */
    // Initially nobody owns any groups.
    groupOwner = [];
    for (g in groupLabels) {
	groupOwner.push(-1);
    }
    debug("... setting group ownerships: "+JSON.stringify(groupOwner));

    // Now initialize the players (even if it's just a game reset)
    for (var p in players) {
	players[p].init(p);
    }
    createPlayersPanel(); // Note: this function has to come after player init!
    playerMoveConfirmed = false;

    /* ----- CARDS ----- */
    // Create the card objects if needed
    if (Object.keys(cardsList).length == 0) { // Only when the game was just started
	debug("...Creating cards:");
	createCards();
    } else {
	// Clear every card
	debug("   ...clearing all cards");
	for (c in cardsList) {
	    cardsList[c].release();
	}
    }

    // Create the game board
    drawGameBoard();

    // Make sure score panel is initially off
    hideScorePanel();

    // Make sure the card score overlays are off
    toggleCardScoreOverlays(false);

    // PPG TEST draggable class on card view panel
    // new Draggable('gameSetupPanel');
    new Draggable('cardView');
    new Draggable('alertPanel');

    // Set the first player and begin the turn
    currentPlayer = 0;

    // I don't like this - PPG.
    lastToggledCard = cardsList["1J"]; // Used as a dummy for LastToggledCard

    beginTurn(players[currentPlayer]);
}

/* Create the players object */
function createPlayers () {
    debug("...Creating "+numPlayers+" players:");

    for (var p=0; p<numPlayers; p++) {
	var pname = document.getElementById('p'+p+'Name').value;
	var pcol = playerColors[document.getElementById('p'+p+'ColorSelector').value];
	var phuman = !(document.getElementById('p'+parseInt(p)+'IsNotHuman').checked); // human if not AI...

	/* Create new player objects by passing name and color */
	players.push(new playerObj(pname,pcol,phuman));
	players[p].num = p;
	debug("    "+players[p].name+" is "+players[p].color.name+" and "+players[p].isHuman);
    }

    // Set the maximum number of wildcards
    maxWildcards = numPlayers;

}

/* Assing colors to players */
function updateColorSelectors(pn,cn) {
    debug("Calling "+arguments.callee.name+" with pn="+pn+", cn="+cn);
    var sel = document.getElementById('p'+pn+'ColorSelector');

    sel.style.backgroundColor=playerColors[cn].name;
    sel.style.color=playerColors[cn].textColor;

    // Now we need to update my ownership and all the disabled labels
    // First, reset all .taken values
    for (var c in playerColors) {
	playerColors[c].taken = false;
    }

    // Now set them based on current values
    for (var p = 0; p < numPlayers; p++) {
	playerColors[document.getElementById('p'+p+'ColorSelector').value].taken = true;
    }

    // Now disable the color selectors already taken
    updateColorSelectorStatuses();

}

/* Set up color selector options */
function createColorSelector (pn) {
    var sel = document.createElement('select');
    var cn = 0;

    if (playerColors[cn].taken) { // Uh-oh, someone already took this color
	// Let's go back to the start of the color array and pick the first available
	var i = 0;
	while (playerColors[i].taken) {
	    i++;
	}
	debug("Color "+cn+" already taken, switching to "+i);
	cn = i;
    }

    sel.id = 'p'+pn+'ColorSelector'; // Set the ID of this selector
    sel.value = cn; // Set the initial value to the color passed in
    sel.style.backgroundColor = playerColors[cn].name;
    sel.style.color = playerColors[cn].textColor;
    sel.onchange = function(){updateColorSelectors(pn,sel.value);};

    for (var i in playerColors) {
	var opt = document.createElement('option'); // Create a new selector option
	opt.value = i;
	opt.text = playerColors[i].name;
	if (i == cn) {
	    opt.selected = true;
	}
	sel.add(opt);
    }
    document.getElementById('p'+pn+'ColorDiv').appendChild(sel);

    // Now lock up this color
    playerColors[cn].taken = true;

    // Lastly, update the colors of the selector itself
    sel.style.backgroundColor=playerColors[cn].name;
    sel.style.color=playerColors[cn].textColor;
}

/* Function to create random players */
function randomizeOpponents () {
    var cn;
    var cnt; // Failsafe - in case of issues with the loop below...

    // First, clear all the .taken except player 0
    for (var c in playerColors) {
	playerColors[c].taken = false;
    }
    // But make sure you leave player 0 alone!
    playerColors[document.getElementById('p0ColorSelector').value].taken = true;

    // Now pick random colors for all players.
    for (var p = 1; p < numPlayers; p++) {
	var sel = document.getElementById('p'+p+'ColorSelector');
	cn = 0;
	cnt = 0;
	// Now pull random colors until you find one not being used
	do { 
	    cn = (Math.floor(Math.random()*10000))%playerColors.length;
	    cnt ++; // This is just for safety in case the logic blows up, which has happened :-)
	} 
	while (playerColors[cn].taken && cnt < 100);
	debug("Just went through "+cnt+" times to find color "+playerColors[cn].name+" for player "+p);

	// Now set the background and text colors of the selectors
	sel.style.backgroundColor = playerColors[cn].name;
	sel.style.color = playerColors[cn].textColor;
	sel.options[cn].selected = true;

	// Set the color as taken
	playerColors[cn].taken = true;
    }

    updateColorSelectorStatuses();

    // Now pick random names
    for (var p = 1; p < numPlayers; p++) {
	document.getElementById('p'+p+'Name').value = playerNames[Math.floor(Math.random()*10000)%playerNames.length]; //PPG
    }

}


/* Set the proper disabled options in all the color selectors */
function updateColorSelectorStatuses () {
    // Now disable the color selectors already taken
    for (var c in playerColors) {
	for (var p = 0; p < numPlayers; p++) {
	    if (playerColors[c].taken) {
		document.getElementById('p'+p+'ColorSelector').options[c].disabled = true;
	    } else {
		document.getElementById('p'+p+'ColorSelector').options[c].disabled = false;
	    }
	}
    }
}

/* Create the cards objects */
function createCards () {
    var g, r, i;
    var n=0;

    for (g in groupLabels) {
	for (r in rowLabels) {
	    i = groupLabels[g]+rowLabels[r]; // The id, e.g., "1X"
	    if (Object.keys(tableCells[g][r]).length > 0) {
		cardsList[i] = new cardObj(g,r);
		if (g < groupsUsed) {
		    cardsList[i].active = true;
		}
		n++;
	    }
	}
    }
    debug("   created "+n+" cards");

}

/* ----------------- SET UP THE BOARD AND OTHER PAGE ELEMENTS ------------------*/

/* This function creates the initial players panel */
function createPlayersPanel() {

    // We create a table, one header row and one row for each player
    var pt = document.getElementById('playersPanelTable');
    // Wipe out the table if needed (in case of reset)
    if (pt.childNodes[1])
	pt.removeChild(pt.childNodes[1]);
    
    var ptb = document.createElement('tbody');

    // Create the header.
    var pthr = document.createElement('tr'); // thr is the table header row
    var pth = document.createElement('th');
    // First two columns show the gane turns counter
    pth.colSpan = 2;
    pth.innerHTML = 'Turn <span id="playersPanelTurnsCounter">1</span>';
    pthr.appendChild(pth);
    // Next show the rank and points in individual columns
    pth = document.createElement('th');
    pth.innerHTML = 'Rnk';
    pthr.appendChild(pth);
    pth = document.createElement('th');
    pth.innerHTML = 'Pts';
    pthr.appendChild(pth);
    // Last three columns are the player actions
    pth = document.createElement('th');
    pth.colSpan = 3;
    pth.innerHTML = "Actions";
    pthr.appendChild(pth);

    ptb.appendChild(pthr); // finish the header row

    // Now create one row for each player
    for (var i in players) {
	var p = players[i];
	var ptr = document.createElement('tr');
	ptr.id = 'p'+p.num+'PanelRow';
	var ptd = document.createElement('td');
	// First column is the player color marker
	var pimg = document.createElement('img');
	pimg.className = 'tinyButton';
	pimg.src = p.imgURL;
	ptd.appendChild(pimg);
	ptr.appendChild(ptd);
	// Now the player name
	ptd = document.createElement('td');
	ptd.innerHTML = p.name;
	ptd.style.textAlign = 'left';
	ptr.appendChild(ptd);
	// Now the player rank
	ptd = document.createElement('td');
	ptd.innerHTML = '<span id="p'+p.num+'PanelRank">0</span>';
	ptr.appendChild(ptd);
	// Now the player score
	ptd = document.createElement('td');
	ptd.innerHTML = '<span id="p'+p.num+'PanelScore">0</span>';
	ptr.appendChild(ptd);
	// Now the action buttons
	// Finish turn
	ptr.appendChild(createPlayerActionButton(i,finishTurn,'checkmark'));
	// Player inspector
	ptr.appendChild(createPlayerActionButton(i,playerInspector,'magnifier'));
	// Player properties
	ptr.appendChild(createPlayerActionButton(i,playerProperties,'gear'));

	// Close out the row.
	ptb.appendChild(ptr);
    }

    pt.appendChild(ptb); // Finish the table

    // Now update the table to reflect player 0
    updatePlayersPanel(0);

    /* This function is used above to create the various action buttons. We pass the player number, callback
       function, and image name for the corresponding action button. The button's id is set accordingly. */
    function createPlayerActionButton (num,func,imgname) {
	ptd = document.createElement('td')
	var ptdb = document.createElement('button');
	ptdb.id = 'p'+num+func.name+'Button';
	ptdb.className = 'playerButton';
	ptdb.onclick = function() {func(num)};
	var pimg = document.createElement('img');
	pimg.className = 'playerButtonImg';
	pimg.src = 'Img/'+imgname+'_24.png';
	ptdb.appendChild(pimg);
	ptd.appendChild(ptdb);
	return ptd;
    }

}


/* This function updates the entire players panel. It should be invoked at the start of each turn, and it should: 
   - Update the turns counter
   - Update which player row is highlighted
   - Update the rank for each player
   - Update the score for each player
*/
function updatePlayersPanel(pnum) {

    // Update the turns counter
    refreshContent("playersPanelTurnsCounter",gameTurns+1); // Turns counter
    
    // Highlight the current player's row, leave the other ones with no background
    for (var i in players) {
	if (i == parseInt(pnum)) {
	    debug("Inside updatePlayersPanel, player number is "+pnum+", loop i="+i);
	    document.getElementById('p'+i+'PanelRow').style.backgroundColor = players[i].rgba(0.3);
	    document.getElementById('p'+i+'finishTurnButton').style.visibility = 'visible'; //PPPP
	    document.getElementById('p'+i+'finishTurnButton').disabled = true;
	    document.getElementById('p'+i+'finishTurnButton').className = 'disabledButton';
	} else {
	    document.getElementById('p'+i+'PanelRow').style.backgroundColor = 'initial';
	    document.getElementById('p'+i+'finishTurnButton').style.visibility = 'hidden';
	}
    }

    updatePlayersPanelRanks();
    updatePlayersPanelScores();

}


/* This function updates the ranks shown in the players panel for all players */
function updatePlayersPanelRanks() {

    // To start, reset the rankedPlayers array
    rankedPlayers = [];

    // Copy each player to the new array
    for (var p in players) {
	rankedPlayers.push(players[p]);
    }

    // Sort the array by score, highest score first
    rankedPlayers.sort(function(b,a) {
	    return a.score-b.score;
	});

    // Now update the players panel
    for (var i in rankedPlayers) {
	// After the first player, we check to see if there is a tie and adjust rank accordingly.
	if (i > 0 && players[rankedPlayers[i-1].num].score == players[rankedPlayers[i].num].score) {
	    players[rankedPlayers[i].num].rank = players[rankedPlayers[i-1].num].rank;
	} else { // Either this is the first player, or there was not tie.
	    players[rankedPlayers[i].num].rank = i;
	}

	// Now update the rank display in the panel
	document.getElementById('p'+players[rankedPlayers[i].num].num+'PanelRank').innerHTML = parseInt(players[rankedPlayers[i].num].rank)+1;
    }

}


/* This function updates the points/score shown in the players panel for all players */
function updatePlayersPanelScores() {

    // Update score for all players
    for (var i in players) {
	document.getElementById('p'+i+'PanelScore').innerHTML = players[i].score;

    }


}


/* This function creates a <table> to draw the game board. */
function drawGameBoard () {
    debug("...Drawing the game board");

    var c, r; // Column and row indices for the TABLE
    var row, cardCell; // Row and cell object variables for TABLE
    var myCard, cGroup, cRow, cId; // Group, row and id for the CARDS
    var cImg, cDiv; // Holders for various cell objects
    var topRowForCol = []; // Keep track of the top non-blank element of each row
    for (c in groupLabels) {
	topRowForCol.push(true);
    }

    // Find the cards table by ID
    var cardsTable = document.getElementById("cardsTable");
    // Check if it has children, in which case remove them
    if (cardsTable.childNodes[1])
	cardsTable.removeChild(cardsTable.childNodes[1]);

    
    
    /*  Set the inner and outer loops depending on whether it's in portrait or landscape mode:
	in portrait mode, the outer loop (each row) is a group [1-7], while in landscape mode
	each row is a letter [J,K,W,X,Y,Z] */
    for (r = 0; r < ((landscape) ? maxRows : maxGroups); r++) {
	// Create an empty <tr> and add it to the end of the table
	row = cardsTable.insertRow(r);

	for (c = 0; c < ((landscape) ? maxGroups : maxRows); c++) {
	    /* Create a new card for this cell */
	    cGroup = (landscape) ? c : r;
	    cRow = (landscape) ? r : c;
	    cId = groupLabels[cGroup]+rowLabels[cRow];
	    /* In NEW version, card objects already created */
	    /* if (Object.getOwnPropertyNames(tableCells[cGroup][cRow]).length > 0)
	       cardsList[cId] = new cardObj(cGroup,cRow); */
	    // Insert a new <td> for image, unless blank
	    cardCell = row.insertCell(c);
	    // Find the right card for this cell
	    myCard = cardsList[cId] || {};
	    if (myCard.id) { // If the card is empty {} we skip it
		cardCell.id = myCard.id; // Need this for the onclick function call below
		// Add the div containing the image
		var imgDiv = document.createElement('div');
		imgDiv.className = "cardImageDiv";
		imgDiv.id = "bg"+myCard.id; // This can be used to change the background color
		// Add the card image
		cImg = document.createElement('img');
		cImg.src = myCard.imgURL;
		cImg.className = "cardImage";
		cImg.id = "img"+myCard.id;
		imgDiv.appendChild(cImg); // First add the image to its div
		cardCell.appendChild(imgDiv); // Then add the div to the cell
		// Add the button image
		cImg = document.createElement('img');
		cImg.id = myCard.button.CSSId;
		cImg.className = "buttonImg";
		cardCell.appendChild(cImg);
		cardCell.className = "cardCellInactive"; // Cards are inactive by default
		// The remaining elements and callbacks are only for activated cards
		if (myCard.active) { 
		    cardCell.onclick=function(e){cardAction(e,this.id)}; // Set the callback for click
		    //		    cardCell.onmouseover=function(e){cardPopus(e,this.id)}; // Set the callback for click
		    cardCell.onmouseover=function(){cardHoverAction(this,true);}; // What you do when hovering over card
		    cardCell.onmouseout=function(){cardHoverAction(this,false);}; // What you do when hovering over card
		    cardCell.className = "cardCell"; // Use a different class
		    // Add the card view button, which shows a large-scale view of the card
		    cDiv = document.createElement('div');
		    cDiv.className = "cardViewButtonDiv";
		    cImg = document.createElement('img');
		    cImg.id = 'v'+myCard.id;
		    cImg.className = "cardViewButton";
		    cImg.src = imgDir+'eye.png';
		    cImg.onclick=function(e){cardView(e,this.id)}; // Callback to enlarge card view PPG
		    cDiv.appendChild(cImg);
		    cardCell.appendChild(cDiv);
		}
		    // If this is the top row, add a DIV for group onwership
		    if ((landscape) && topRowForCol[c]) {
			cDiv = document.createElement('div');
			cDiv.id = 'group'+cGroup;
			cDiv.className = "groupOwnershipMarker";
			cDiv.innerHTML = '<span id="'+cDiv.id+'Name"></span>';
			cardCell.appendChild(cDiv);
			topRowForCol[c] = false;
		    }
		    // Add the overlay
		    cDiv = document.createElement('div');
		    cDiv.id = 'o'+myCard.button.CSSId;
		    cDiv.className = "cardOverlay invisible";
		    // Now add as many rows as there are players
		    for (pn in players) {
			var oDiv = document.createElement('div');
			oDiv.id = cDiv.id+"p"+pn; // E.g., o1Yp0 is the overlay for card 1Y, player 0
			oDiv.className = "cardOverlayPlayerRow";
			oDiv.style.backgroundColor = players[pn].rgba(0.2);
			// Not needed			oDiv.style.color = players[pn].color.textColor;
			oDiv.style.height = (100/numPlayers)+'%';
			cDiv.appendChild(oDiv);
		    }
		    cardCell.appendChild(cDiv);
		    // Add a second overlay for showing link/partner connections
		    cDiv = document.createElement('div');
		    cDiv.id = 'o2'+myCard.button.CSSId;
		    cDiv.className = "cardLinksOverlay hidden";
		    cardCell.appendChild(cDiv);
		    //		} // If the card is active
	    } // If the card exists
	} // Loop over cards in a row
    } // Loop over all card groups

} // END of drawGameBoard

/* Turn on the score panel */
function showScorePanel () {
    document.getElementById("scorePanel").style.display = "block";
}

/* Hide the score panel */
function hideScorePanel () {
    document.getElementById("scorePanel").style.display = "none";
}

/* Update initial information about the current player in the score panel */
function updateScorePanelHeader (p,c) {
    // Update the score panel header
    refreshImage("scorePanelHeaderButton",p.imgURL); // Player button
    refreshContent("scorePanelHeaderPlayer",p.name); // Player name
    refreshContent("scorePanelHeaderCard",c.id); // Card whose score is being calculated
}

/* This function fills in the card points for the current player in the score panel */
function drawCardPoints (p,c) {
    refreshContent("currentPlayerLinkPoints",p.tempPoints.links);
    refreshContent("currentPlayerPartnerPoints",p.tempPoints.partners);
    
    drawStarPoints(p,c);
    drawBonusPoints(p,c);
    drawPlayerPointTotals(p,c);

}

/* This function updates the player's min, max and selected points */
function drawPlayerPointTotals (p,c) {
    refreshContent("currentPlayerCardCost",p.tempPoints.minPts);
    refreshContent("totalCardPoints",p.tempPoints.selectedPts);
    refreshContent("currentPlayerMaxPoints",p.tempPoints.maxPts);
}

/* This function draws the star points. For flexibility, we always assume the max number
 of stars, but then we hide any rows that are not being used. Notice that this function should
 only be called after checking if the card has any stars at all - so we don't check that here. */
function drawStarPoints (p,c) {
    
    var spDiv = document.getElementById("starPointsSection");
        
    // Always start by removing the star score table if it was there in the first place
    var temp = document.getElementById("starTable");
    if (temp) 
	temp.parentNode.removeChild(temp);

    if (c.stars <= 0) { // If no stars, set star score to zero and return
       	refreshContent("currentPlayerStarPoints","Star points: 0");
	document.getElementById("starPointsSection").style.display = "none";
	return;
    }

    debug("inside drawStarPoints, c.stars = "+c.stars);

    // First put a header asking user to choose star points.
    spDiv.innerHTML = '<span style="margin-left: 1em;font-style:italic;">Choose star score'+((c.stars>1)?'s':'')+':</span>';

    /* We need to do something tricky: draw the table as if the player had taken
       this card. Then take it away again. */
    p.cardsOwned[c.group].push(c.id); // Add this card to the cardsOwned table
    p.updateStarLevels(); // Make sure you remove the card later on!!!

    var starTable = document.createElement('table');
    starTable.id = "starTable";
    var tbody = document.createElement('tbody');
    
    // First row holds the numbers 1..maxRows */
    var tr = document.createElement('tr');
    tr.className = "starTableHeader";
    
    var td = document.createElement('td');
    td.appendChild(document.createTextNode('')); // First <td> element is blank
    tr.appendChild(td);

    for (var i=1; i<=maxRows; i++) {
	td = document.createElement('td');
	td.appendChild(document.createTextNode(i));
	tr.appendChild(td);
    }

    tbody.appendChild(tr);

    // Now, for each star, create the radio buttons.
    for (var s = 0; s < c.stars; s++) {
	tr = document.createElement('tr');
	td = document.createElement('td');
	td.appendChild(document.createTextNode("S"+(s+1)));
	tr.appendChild(td);
	for (var l = 1; l <= maxRows; l++) {
	    td = document.createElement('td');
	    td.innerHTML = '<input type="radio" name="star'+s+'" '+
		'onclick="updateStarPoints('+s+','+l+')"'+
		((p.starLevels[l])?'':' disabled')+
		((p.tempPoints.starsSelected[s] == l)?' checked':'')+
		'>';
	    tr.appendChild(td);
	}
	// Last column is the score for this star
	td = document.createElement('td');
	td.innerHTML = '<td><span id="starPoints'+s+'">'+p.tempPoints.starsSelected[s]*ptsPerStar+'</span></td>';
	tr.appendChild(td);

	// Now add the newly constructed row to the table.
	tbody.appendChild(tr);
    }

    starTable.appendChild(tbody);
    spDiv.appendChild(starTable);
    
    // Refresh the scores
    updateStarPointsDisplay(p,c);

    document.getElementById("starPointsSection").style.display = "block";
    
    p.cardsOwned[c.group].pop(); // Remove this card from the cardsOwned table
}


/* Refresh the various star scores */
function updateStarPointsDisplay(p,c) {
    refreshContent("currentPlayerStarPoints",((c.stars > 0)?"Selected star points: ":"Star points: ")+p.tempPoints.starSelectedPts); // PPG Here???
    for (s = 0; s < c.cards; s++) {
	refreshContent("starPoints"+s,p.tempPoints.starsSelected[s]*ptsPerStar);
    }
}


/* Draw the bonus points */
function drawBonusPoints(p,c) {
    
    if (p.cardsOwned[c.group].length == 0) { // Player does not own any cards in this group
	document.getElementById("bonusLine").innerHTML = 'Choose bonus (0-50): '+ 
	    '<input type="text" id="bonusPoints" value="50" size="2" min="0" onkeyup="updateBonusPoints();" min="0" max="50">';
    } else {
	document.getElementById("bonusLine").innerHTML = 'Bonus: 0';
    }

}


/* Function to draw the main elements of the score panel. Should be called at the start
   of the player's turn. */
function drawScorePanel (p,c) {

    // Draw the panel header with information on the current player and selected card
    updateScorePanelHeader(p,c);

    // Update the player's current score
    refreshContent("currentPlayerScore",p.score);

    // Draw the card points for the current player
    // PPG
    drawCardPoints(p,c);

    // Update the new score for the player
    refreshContent("newScore",p.updateTempScore());
}

/* Draw the table with other players' scores */
function drawOtherPlayersScoreBox (p,c)
{
    /* NOW fill in the scores for the other players */
    document.getElementById("otherPlayerScores").innerHTML = '';
    for (var i in players) {
	//	tick = (i == currentPlayer) ? '&check;' : '';
	// I used to skip the current player, but why?
       	if (i == currentPlayer) {
	    //	    debug("Skipping current player "+i);
	    } else {
	    document.getElementById("otherPlayerScores").innerHTML += 
		'<img class="tinyButton" src="'+players[i].imgURL+'"> '+players[i].name+': '+
		players[i].score+'p '+ ((useWildCards)? (parseInt(players[i].wildCards)+'/'+maxWildcards+'w<br>') : '<br>'); // Player name
	    // PPG NEED TO ADD BUTTON TO EVERY PLAYER. SUGGEST REDOING PLAYERS PANEL ALTOGETHER AS A TABLE.
	    // MAYBE do not put current player at top, just highlight.
	    //	    var pstat = document.createElement("button");

	}
    }

}

/* Function to view a card at large size */
function cardView(e,vid) {
    debug("Event "+e+" target: "+e.target.id);
    var c = cardsList[vid.slice(1)];
    c.view();
}

/* This function opens the calculate score panel. Note: this is invoked as a callback from
 the game table. */
function calculateScore() {

    /* If the player has not selected a card, alert and ignore */
    if (!lastToggledCard.hasButton || (lastToggledCard.player != currentPlayer && lastToggledCard.player > -1)) {
	mAlert("You must select a card to confirm your move!");
	return;
    }

    // If you already confirmed, give an alert and get out
    if (playerMoveConfirmed) {
	mAlert('Sorry, you already confirmed your move. Please press "Finish turn"');
	return;
    }

    // First off, update the score panel. Notice we have to pass player & card from globals.
    updateScorePanel(players[currentPlayer],lastToggledCard);

    // Now turn it on.
    showScorePanel();
    
} // End of calculateScore()


/* Callback to update the stars points for the current player and card */
function updateStarPoints (star,value) {
    var p = players[currentPlayer];

    // Update the score for the checked star, and update the display accordingly
    p.tempPoints.starsSelected[star] = value;

    // Now calculate the new star points
    p.tempPoints.starSelectedPts = 0; // Need to recalculate total star points and refresh display
    for (s=0; s < lastToggledCard.stars; s++) {
	p.tempPoints.starSelectedPts += p.tempPoints.starsSelected[s]*ptsPerStar;
    }

    // Based on the updated stars, calculate the player's new points
    p.updateTempScore();

    // Should be able to let the other function update the card score and total score
    drawPlayerPointTotals(p,lastToggledCard);
    updateNewScore(p,c);
    
}

/* Callback to update the bonus score points for the current player and card */
function updateBonusPoints () {
    var p = players[currentPlayer];
    var c = lastToggledCard;

    var bonusPts = parseInt(document.getElementById("bonusPoints").value);
    // Enforce 0-50 range                                                                           
    if (bonusPts > ptsPerBonus) {
        bonusPts = ptsPerBonus;
        document.getElementById("bonusPoints").value = bonusPts;
    };
    if (bonusPts <=0 || isNaN(bonusPts)) {
        bonusScore = 0;
        document.getElementById("bonusPoints").value = 0;
    }

    p.tempPoints.bonus = bonusPts;
    // Based on the updated bonus, calculate the player's new points
    p.updateTempScore();

    // Should be able to let the other function update the card score and total score
    drawPlayerPointTotals(p,c);
    updateNewScore(p,c);

}

/* This function calls all the functions needed to update the score panel */
function updateScorePanel (p,c){
    debug(arguments.callee.name+' called by '+arguments.callee.caller.name+' for player '
	  +p.num+' and card '+c.id);

    // Draw the panel header with information on the current player and selected card
    updateScorePanelHeader(p,c);

    // Update the player's current score
    refreshContent("currentPlayerScore",p.score);

    // Draw the card points for the current player
    drawCardPoints(p,c);

    // Draw the bonus points for the current player
    drawBonusPoints(p,c);

    // Draw the point totals
    drawPlayerPointTotals(p,c);

    // Fill in the rest of the scores
    updateNewScore(p,c);
    
}


/* Function to update New Score display in the score panel */
function updateNewScore(p,c) {

    document.getElementById("newScore").innerHTML = p.updateTempScore();

}


/* This is a callback function to update star scores */
function updateScores() {
    var pts = lastToggledCard.playerValues[currentPlayer];
    var totSScore = 0;
    var form = document.getElementById("starForm").elements;
    var score = 0;

    if (lastToggledCard.stars) {
	for (s = 0; s<lastToggledCard.stars; s++) {
	    score = ptsPerStar*form[('star'+s)].value;
	    document.getElementById('starScore'+s).innerHTML = score;
	    totSScore += score;
	}

	// Update total star score
	document.getElementById('starTotalScore').innerHTML = totSScore;
    }

    // Update total score
    var bonusScore = parseInt(document.getElementById("bonusBox").value);
    // Enforce 0-50 range
    if (bonusScore > 50) {
	bonusScore = 50;
	document.getElementById("bonusBox").value = 50;
    };
    if (bonusScore <=0 || isNaN(bonusScore)) {
	bonusScore = 0;
	document.getElementById("bonusBox").value = 0;
    }

    


    var totScore = pts.links+pts.partners+totSScore+bonusScore;
    document.getElementById('totalScore').innerHTML = totScore;
    newScore = totScore-pts.min;
    document.getElementById('newScore').innerHTML = newScore;

}

/* This function is passed a card id and returns the card's information */
function cardAction(e,cardId) {
    if (e.target.id.slice(0,1) == 'v') { // Return if the user clicked on view card
	return;
    }

    // If a card view pop-up is present, make sure to turn it off */
    // document.getElementById("cardView").style.display = "none";

    var myCard = cardsList[cardId];
    //    debug('You clicked card '+myCard.id+' with ID '+cardId+' of type '+typeof(cardId));

    if (playerMoveConfirmed) {
	mAlert("Sorry, you already confirmed your move! ");
	return;
    }
    if (!myCard.unclaimed) {
	mAlert("Sorry, that card is already selected.");
	return;
    }
    if (myCard.hasButton) { // Toggle the button off, close score panel if needed.
	myCard.clearButton();
	hideScorePanel();
	//disableCardScoreButton();
    } else { // If we get here we are placing a new button on the card.

	if (lastToggledCard.hasButton && lastToggledCard.unclaimed) { // Clear previous card
	    lastToggledCard.clearButton();
	}
	// Set the card's button
	myCard.setButton(currentPlayer);

	// Update the id of the card just toggled
	lastToggledCard = myCard;

	// Update the player's tempPoints to match the card selected
	players[currentPlayer].tempPoints = lastToggledCard.playerValues[currentPlayer];

	// Refresh the score panel
	updateScorePanel(players[currentPlayer],myCard); // This refreshes the score panel
	    
	// Now turn it on.
	showScorePanel();

    }

}


/* This function is invoked as the mouse moves over a card and out of it. */
function cardHoverAction (c,over) {

    //    debug ("Hovering "+((over) ? "over" : "out of")+" card "+c.id+" with partners "+cardsList[c.id]);

    // Highlight the card itself
    if (over) {
	document.getElementById(c.id).style.opacity = 0.8;
    } else {
	document.getElementById(c.id).style.opacity = 1.0;
    }

    return; 
    // Highlight the card's partners
    for (var i in cardsList[c.id].partners) {
	var card = cardsList[c.id];
	if (over && card.player == currentPlayer) { // Highglight only those I already own.
	    document.getElementById('img'+card.partners[i]).style.opacity = 0.6;
	    document.getElementById('o2b'+card.partners[i]).style.display = 'block';	    
	} else {
	    document.getElementById('img'+card.partners[i]).style.opacity = 1.0;
	    document.getElementById('o2b'+card.partners[i]).style.display = 'none';	    
	}
    }

}

/* This function toggles the score overlay for all the unclaimed cards */
function toggleCardScoreOverlays(turnOn) {
    var btn = document.getElementById("cardScoreOverlaysButton");
    // See how we were called. If no arguments, it came from the button click
    if (turnOn === undefined) { // If the call came from the click, check current state
    	turnOn = (btn.className.indexOf("Off") > -1) ? true : false;
    }

    debug ("Toggling card, turnOn is "+turnOn);
    if (turnOn) { // Turn it off
	btn.src = "Img/calculator_off_64.png";
	btn.className = "actionIcons toggleOn";
    } else { // Turn it back on
	btn.src = "Img/calculator_on_64.png";
	btn.className = "actionIcons toggleOff";
    }
    for (var c in cardsList) {
	if (cardsList[c].unclaimed && cardsList[c].active) cardsList[c].toggleScoreOverlay(turnOn);
    }

}


/* This function calculates player score and shows some stats */
function playerStats () {

    var p = players[currentPlayer];
    var gs = [];
    for (var g in groupOwner) {
	if (groupOwner[g] == currentPlayer) {
	    gs.push(groupLabels[g]);
	}
    }
    var cs = [];
    for (var g in p.cardsOwned) {
	for (var r in p.cardsOwned[g]) {
	    cs.push(p.cardsOwned[g][r]);
	}
    }
	    
    mAlert("Game statistics for "+p.name+" ("+p.color.name+"):"+
	  "\n Cards owned ("+cs.length+"): "+cs+
	  "\n Groups owned: "+gs.sort()+
	  "\n Wildcards held: "+p.wildCards+
	  "\n Score: "+p.score+
	  "\n Moves made: "+JSON.stringify(p.history,null,"\n")
	  );

}


/* This function calculates player score and shows some stats */
function playerInspector (pnum) {

    var p = players[pnum];
    var gs = [];
    
    // Copy the groups array into a new array
    for (var g in groupOwner) {
	if (groupOwner[g] == currentPlayer) {
	    gs.push(groupLabels[g]);
	}
    }

    // Copy the cardsOwned array into a new array
    var cs = [];
    for (var g in p.cardsOwned) {
	for (var r in p.cardsOwned[g]) {
	    cs.push(p.cardsOwned[g][r]);
	}
    }
	    
    // Now pop up some information
    mAlert("Game statistics for "+p.name+" ("+p.color.name+"):"+
	  "\n Cards owned ("+cs.length+"): "+cs+
	  "\n Groups owned: "+gs.sort()+
	  "\n Wildcards held: "+p.wildCards+
	  "\n Score: "+p.score+
	  "\n Moves made: "+JSON.stringify(p.history,null,"\n")
	  );

}


/* This function allows viewing and modifying certain player parameters */
function playerProperties (pnum) {
    mAlert("Displaying properties for "+players[pnum].name);
}

/* This function turns on the Finish Turn button */
function enableFinishButton () {
    //    document.getElementById("finishButton").disabled = false;
    // document.getElementById("finishButton").className = "playerButton";
    document.getElementById('p'+currentPlayer+'finishTurnButton').disabled = false;
    document.getElementById('p'+currentPlayer+'finishTurnButton').className = "playerButton";
}


/* This function disables the Finish Turn button */
function disableFinishButton () {
    // document.getElementById("finishButton").disabled = true;
    // document.getElementById("finishButton").className = "disabledButton";
    document.getElementById('p'+currentPlayer+'finishTurnButton').disabled = true;
    document.getElementById('p'+currentPlayer+'finishTurnButton').className = "disabledButton";
}


/* This function cancels the score calculation without saving the results */
function cancelCalculateScore() {

    document.getElementById("scorePanel").style.display = "none";

}


/* This function initializes a new turn */
function beginTurn(p) {

    playerMoveConfirmed = false;

    updateCardValues();

    if (p.isHuman) {
	// Update the action/player panel
	//updatePlayersPanel(players[currentPlayer]);
	updatePlayersPanel(currentPlayer);

	// Initialize the next player's turn
	p.startTurn();

	/* Update all the untaken card values based on the new configuration. */
	updateCardValues();

	/* Disable the Card Score button */
	// disableCardScoreButton();

	/* Disable the Finish Turn button */
	disableFinishButton();
    } else {
	AIRandomMove();
	finishTurn();
    }

} // End of beginTurn()


/* This function confirms the player's move. When playing with wildcards etc, this
   is where other players can come in and compete. FOr the simple version of the game,
   this simple ends the turn */
function confirmMove () {
    //    document.getElementById("scorePanel").style.display = "none";
    hideScorePanel();
    //disableCardScoreButton();
    enableFinishButton();

    // This is where we would let other players challenge in dibs&bids
    var wonBid = dibsAndBids();

    if (wonBid) {
	// Finalize the player's turn
	playerMoveConfirmed = true;

	// Also need to make sure card overlays are turned off
	toggleCardScoreOverlays(false);
    } else { // Need to go back and continue the turn
	playerMoveConfirmed = false;
	debug (players[currentPlayer].name+" failed to take "+lastToggledCard.id+" and needs to continue.");
    }

}


/* This is the function that controls the dibs & bids dynamics */
function dibsAndBids () {
    // If this is disabled just return true
    if (!useDibsAndBids) {
	return true;
    }

    var c = lastToggledCard;
    var pc = players[currentPlayer]; // Player claiming the card
    var po; // The player who owns the group, if any
    var go = groupOwner[c.group];
    var pcWon = false; // Return this at the end to inform the game

    // Check if the cards selected by the player is subject to dibs
    if (parseInt(go) > -1) { // The group is already taken
	po = players[go];
	if (go != pc.num) { // All the bidding logic will go here.
	    debug ("D&B: "+pc.name+" is in Dibs & Bids, "+po.name+" has dibs on "+c.id);
	    po.bid = makeBid(po,c)
	    pc.bid = makeBid(pc,c);

	    if (pc.bid >= po.bid) { // The claiming player wins (also if tied)
		pc.bid = parseInt(po.bid)+1;
		pcWon = true;
	    } else { // The group owner wins
		po.bid = parseInt(pc.bid)+1;
		po.takeCard(lastToggledCard); // Take the card
		c.setButton(po.num); // Show the card's new owner
		/* PPG CHECK: if you are the group owner and win the bid, how does your score change?
		   do you simply subtract the price you paid, or do you also add the card min, or ...? */
		po.score -= po.bid; // Update score
		pc.bothered[po.num] = true; // Mark this player as having been bothered
		po.numBothered++; // Increment the player counter
		pcWon = false;
		po.history.push('Turn '+gameTurns+' (by '+pc.name+'): won '+c.id+' and used '+po.bid+' points');
		// Now put the player back essentially to the start of the turn.
		//updatePlayersPanel(pc);
		updatePlayersPanel(pc.num);
		updateCardValues();
		//disableCardScoreButton();
		disableFinishButton();
		hideScorePanel();
	    }

	} else {
	    debug (pc.name+" is in Dibs & Bids, "+pc.name+" is the owner of group "+c.group+" and is clear to take "+c.id);
	    pcWon = true;
	}
    } else {
	debug(pc.name+" is in Dibs & Bids, the group is clear!");
	pcWon = true;
    }

    return pcWon;
}


/* This function returns a bid for a given player/card combo. */
function makeBid(p,c) {
    var bid;
    /* The logic: player can bid anywhere between 0 and max points */

    // Random choice between 0 and the player's score
    bid = Math.floor(Math.random()*1000000)%(p.score+1); // Note the +1 needed to allow max bid = score

    debug("  D&B: "+p.name+" just bid "+bid);

    return bid;
}


/* This function is called when the player finishes her/his turn. */
function finishTurn(pnum) {
    pnum = currentPlayer; // In some cases this may not get passed in. - temporary fix. PPG

    var p = players[currentPlayer];
    var c = lastToggledCard;

    if (p.isHuman) {
	// If the player hits "finish move" before confirming a selection, alert
	if (!playerMoveConfirmed) {
	    if (lastToggledCard.hasButton && lastToggledCard.unclaimed) { // Clicked but did not confirm
		response = confirm("You have an uncomfirmed game piece on card "+lastToggledCard.id+
				   "\nConfirm and finish?");
		if (response) {
		    // calculateScore();
		    return;
		    //		confirmMove();
		} else {
		    lastToggledCard.clearButton();
		    return;
		}
	    }

	    /* Note: this logic introduces a useful "bug": if we have just reset the board,
	       this value might come out as true and not ask to click through the players */
	    if (!lastToggledCard.hasButton) { // Did not choose a card
		response = confirm("You have not selected any cards. Finish turn anyway?");
		if (!response) return;
	    }
	} // (if !playerMoveConfirmed)

	playerMoveConfirmed = true;

	// Make sure the card is taken and assigned to the current player
	//    lastToggledCard.assign(currentPlayer); // PPG should be redundant
	players[currentPlayer].takeCard(lastToggledCard);
	debug("Locking card "+c.id+" for player "+p.num);

	// Finalize the player's turn
	p.endTurn(c);

	// Update the group markers // THIS SHOULD NOT BE HERE!
	updateGroupMarkers();
    
	// Update the overall history by adding the last item in the player's history
	turnsHistory.push("T"+gameTurns+"P"+currentPlayer+" - "+p.history[p.history.length-1]);

    } else { // If we get here, the player is not human
	// Set an alert if the player is not human
	if (!p.isHuman) {
	    alert(p.name+" finished the turn, took Marago "+lastToggledCard.id+"\nchose "+p.tempPoints.selectedPts+" points (possible: "+p.tempPoints.minPts+"-"+p.tempPoints.maxPts+")\nnow has "+p.score+" points.");
	}
    }

    // Increment global move counter
    gameTurns++;

    // Update the count of cards left
    cardsLeft = 0;
    for (var i in cardsList) {
	if (cardsList[i].unclaimed && cardsList[i].active) {
	    cardsLeft++;
	}
    }
	    
    // If the game is over, give some output
    if (cardsLeft < 1) {
	gameOver();
    } else {
	debug("Game not over yet...");
    // Increment to the next player
    currentPlayer = (++currentPlayer)%(numPlayers); // Increment player number
    
    // Start the next turn
    beginTurn(players[currentPlayer]);
    }

}


/* This function calculates the current value of all untaken cards for all players */
function updateCardValues () {
    cardsLeft = 0;

    for (c in cardsList) {
	cardsList[c].updateValues();
	if (cardsList[c].unclaimed && cardsList[c].active) cardsLeft++;
    }
    debug("There are "+cardsLeft+" cards left to play.");
}

/* Update the group markers */
function updateGroupMarkers () {
    for (var g in groupOwner) {
	if (groupOwner[g] > -1) {
	    document.getElementById('group'+g).style.backgroundColor = players[groupOwner[g]].color.name;
	    document.getElementById('group'+g).style.color = players[groupOwner[g]].color.textColor;
	    document.getElementById('group'+g).style.boxShadow = '0 0 0 2px '+players[groupOwner[g]].color.textColor+' inset';
	    document.getElementById('group'+g+'Name').innerHTML = players[groupOwner[g]].name;
	}
    }
}

/* This function clears the whole board and resets the game */
function gameReset () {

    // Better confirm...
    var response = confirm("Warning: this action will wipe out the board and all scores"+
	    "\nAre you sure?");
    if (!response) {
	return;
    }

    /* Re-initialize the game */
    initializeGame();

}

/* This function randomizes the board */
function randomBoard() {
    var p;

    var response = confirm("Do you want to randomize the board?");

    if (!response) {
	return;
    }

    // Clear the board.
    gameReset();

    //    var rg, rr;

    // Figure out how many cards are active
    var activeCards = 0;
    for (var c in cardsList) {
	if (cardsList[c].active) {
	    activeCards++;
	}
    }

    /* Select how many cards you are going to fill. Make it a meaningful number */
    var minMoves = numPlayers*2; // Whatever you want the min # of turns
    var maxMoves = activeCards - minMoves; // Does not need to be symmetrical, but nice.
    var numCards = minMoves + Math.floor((Math.random() * maxMoves));

    debug("Creating a random board with "+numCards+" cards occupied for "+
	  numPlayers+" players");

    // Need to set certain parameters to make sure the random moves are OK.
    playerMoveConfirmed=true;

    for (c=0; c<numCards; c++) {
	currentPlayer = c%numPlayers;
	p = players[currentPlayer];
	AIRandomMove();
	gameTurns++;		
    }

    updateCardValues();
    
    debug("Just ended random game. Did "+numCards+" moves. The last move was by "+players[currentPlayer].name);

    // Now we have to set things up so the next player can play
    // Increment to the next player
    currentPlayer = (++currentPlayer)%(numPlayers); // Increment player number
    
    // Start the next turn
    beginTurn(players[currentPlayer]);

}

/* Function for an AI player to make a random move */
function AIRandomMove () {
    var cardIdArray = Object.keys(cardsList); // A list of all the cards actually created

    var p = players[currentPlayer];
    var cnt = 0;

    // First, update the Players panel and start the player's turn
    //updatePlayersPanel(p);
    updatePlayersPanel(p.num);
    p.startTurn();

    // Calculate all the card values for all the players
    updateCardValues();

    // Choose a card (this should change depending on strategy)
    switch (p.cardStrategy) {
    case 'rand':
    default:
	do {
	    lastToggledCard = cardsList[cardIdArray[(Math.floor(Math.random()*10000))%(cardIdArray.length)]];
	    cnt++; // This should NOT be needed - safety. PPG
	} while ((!lastToggledCard.unclaimed || !lastToggledCard.active) && cnt < 50)
	    }

    if (cnt > 50) {
	mAlert("Problem with the while loop inside AIRandomMove - just crashed after "+cnt);
    }

    // Update the player's tempPoints object to reflect the card selected
    p.tempPoints = lastToggledCard.playerValues[currentPlayer];

    // Now checks dibs&bids
    var cardWon = dibsAndBids();

    if (cardWon) {
	p.takeCard(lastToggledCard);
	p.updateTempScore();
	p.endTurn(lastToggledCard);
	updateGroupMarkers();
	turnsHistory.push("T"+gameTurns+"P"+currentPlayer+" - "+p.history[p.history.length-1]);
    } else {
	debug("AI player "+p.name+" lost his bid and is skipping a turn");
    }
	
}

/* Set a card to have a certain player piece on it and lock it.
function setCardButton(c,p) {
    var buttonFile = buttonsDir+players[p].color.name+'.png';
    c.unclaimed = false;
    c.player = p;
    document.getElementById("b"+c.id).src = buttonFile;
    document.getElementById("b"+c.id).style.visibility = "visible";
    c.hasButton = true;
    players[p].cards.push(c.id);
    ++players[p].groups[(c.group)] // Increment group count

}
*/

/* A function that replaces a blank string with "none" */
function nonePrint(s) {

    return (s) ? s : "none";

}

/* What happens at the end of a game */
function gameOver() {
    var go = "Game over!\n";
    var topToLastDiff;
    var topToSecondDiff;
    var finalScores = []; 

    // Copy each player to the new array
    for (var p in players) {
	finalScores.push(players[p]);
    }

    // Sort the array by score, highest score first
    finalScores.sort(function(b,a) {
	    return a.score-b.score;
	});

    go += "  Final scores:\n";
    for (var p in finalScores) {
	go += "   - "+finalScores[p].name+" ("+finalScores[p].color.name+"):"+finalScores[p].score+"\n";
    }

    // Now figure out the logic
    topToLastDiff = finalScores[0].score - finalScores[finalScores.length-1].score;
    topToSecondDiff = finalScores[0].score - finalScores[1].score;

    if (topToLastDiff <= maxPointsDiff && topToSecondDiff >= minPointsDiff) {
	// The top player is the winner
        go += "\n"+finalScores[0].name+" WINS for having the most points!\n\n";
    } else if (topToLastDiff > maxPointsDiff && finalScores[finalScores.length-1].score < finalScores[finalScores.length-2].score) {
	// The bottom player is the buster
        go += "\n"+finalScores[finalScores.length-1].name+" WINS by being the buster!\n\n";
    } else {
	go += "\nALL SENSEI - nobody wins.\n\n";
    }

    if (cardsLeft < 1) { // All done, the game must be restarted!
	mAlert(go+"\nA new game will be started.");
	initializeGame();
    } else { // Sometimes (for now anyway) the player hits the end game just to see where things stand.
	go += "Do you want to restart this game?";

	var resp = confirm(go);
	if (resp) {
	    initializeGame();
	}
    }

}

/* A function to transform a links object */
function linkPrint(mlinks) {

    var ls = "";
    for (l in mlinks) {
	for (i=0; i < mlinks[l]; i++) {
	    ls += (l+1);
	}
    }

    return nonePrint(ls);

}

/* A simple console debugging function. Set the consoleDebug flag at the top of this file */
function debug(msg) {

    if (consoleDebug) console.log(msg);

}

/* Similar to debug, but here we include information about the function and caller */
function tDebug(args,msg) {
    debug("IN:"+args.callee.name+" FROM:"+args.callee.caller.name+" - "+msg);
}

/* A shorthand for updating the content of an element by Id */
function refreshContent(element,content) {
    if (!document.getElementById(element)) {
	debug('refreshContent called with empty element and "'+content+'" by '+arguments.callee.caller.name);
    }
    document.getElementById(element).innerHTML = content;
}

/* A shorthand for updating the content of an image element by Id */
function refreshImage(element,image) {
    document.getElementById(element).src = image;
}
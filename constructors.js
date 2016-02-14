/* Constructor for players */
function playerObj(name,col,human) {
    this.color = col;
    this.name = name;
    this.num;
    this.isHuman = human;
    this.cardStrategy;
    this.pointStrategy;
    this.tempPoints; // Used to keep track of temporary card points
    this.bid = 0; // Used for dibs & bids
    this.bothered = []; // Track who the player has bothered in a turn
    this.numBothered = 0;
    this.imgURL = buttonsDir+col.name+".png";
    this.cardsOwned = []; // Keep track of cards, organized by group
    this.minStarLevel; // Keep track of group sizes for star calculations
    this.maxStarLevel;
    this.starLevels; // This is an array that keeps track of the valid star levels
    this.availableStarScores = []; // Another array, keeps track of actual possible scores
    this.score = initialScore;
    this.tempScore = 0;
    this.rank = 0; // Initially, everyone is ranked at the top
    this.wildCards = 0;
    this.moves = 0;
    this.history = [];
    /* METHODS */
    // Init the player
    this.init = function (n) {
	//	this.num = n; // This should be taken care of at creation time
	if (!this.isHuman) { // Establish the card and point strategies
	    var strategies = document.getElementById('p'+this.num+'StrategySelector').value;
	    // The selector says something like min-rand, need to split it properly
	    this.cardStrategy = strategies.split('-')[0];
	    this.pointStrategy = strategies.split('-')[1];
	    debug("XXX "+this.name+" is an AI player using card strategy "+this.cardStrategy
		  +" and point strategy "+this.pointStrategy);
	} else { // Need to choose something for humans too for random board games
	    this.cardStrategy = 'rand';
	    this.pointStrategy = 'rand';
	}
	this.tempPoints = new pointsObj();
	for (var g in groupLabels) {
	    this.cardsOwned[g] = new Array();
	}
	this.updateStarLevels();
	this.score = initialScore;
	this.tempScore = 0;
	this.wildCards = parseInt(this.num)+1; // 1 for the first player, 2 for the second, and so on...
	this.rank = 0;
	this.moves = 0;
	this.history = [];
    };

    // Things the player should do at start of turn //PPGX
    this.startTurn = function () {
	this.tempScore = this.score;
	this.updateStarLevels();
	this.bid = 0; // Used for dibs & bids
	this.bothered = [];
	for (var i in players) { // Reset the bothered players array
	    this.bothered.push(false);
	}
	this.numBothered = 0;
    };
    // Actions to execute at the very beginning of a game turn
    this.initTurn = function () {
	this.updateStarLevels();
	this.bothered = [];
	for (var i in players) { // Reset the bothered players array
	    this.bothered.push(false);
	}
	this.numBothered = 0;
    };

    // Actions to execute when the player's move begins - which could be after losing a bid
    this.beginMove = function () {
	this.bid=0;
	this.tempScore = this.score;
    }

    // Reset the star values array
    this.resetStarLevelArray = function () {
	this.starLevels = [];
	for (var r=0; r <= maxRows; r++) {
	    this.starLevels.push(((r < 2)?1:0)); // Can never have < 1 star.
	}
    }

    // Update the min and max group levels for star score calculations
    /* How this works: we need to know the number of maragos the player owns in any group.
       We look through the cardsOwned array, which is organized by groups. We look at
       the array length of each group, which represents how many cards are in that group.
       We then set the corresponding star level array element to 1.
       For available star scores, we simply go back through the array and multiply each
       element of the star levels array by 25*index.
     */
    this.updateStarLevels = function () {
	this.resetStarLevelArray(); // For starters, fill it with zeros (except the zeroeth element)
	// Update the starLevels array
	for (var g in groupLabels) {
	    this.starLevels[this.cardsOwned[g].length] = 1; // Used to say length+1
	}

	// Set min and max by iterating through all groups
	this.minStarLevel = maxRows;
	this.maxStarLevel = 0;
	for (var g in groupLabels) {
	    var tgl = this.cardsOwned[g].length;
	    if (tgl < this.minStarLevel)
		this.minStarLevel = tgl;
	    if (tgl > this.maxStarLevel)
		this.maxStarLevel = tgl;
	}
	/* But now we need to make sure that min and max can never be less than 1 */
	if (this.minStarLevel == 0) this.minStarLevel = 1;
	if (this.maxStarLevel == 0) this.maxStarLevel = 1;
    };

    /* Update the available star scores array */
    this.updateAvailableStarScores = function () {
	this.availableStarScores = []; // Start by resetting the array
	for (var l in this.starLevels) {
	    if (l > 0 && this.starLevels[l] > 0) {
		this.availableStarScores.push(l*ptsPerStar);
	    }
	}

    };

    // Update player temp score - this updates the temp Score based on calculations done elsewhere
    this.updateTempScore = function () {
	if (this.isHuman) {
	    this.tempPoints.selectedPts = this.tempPoints.links+this.tempPoints.partners+this.tempPoints.starSelectedPts+this.tempPoints.bonus;
	} else {
	    switch (this.pointStrategy) {
	    case "min":
	    this.tempPoints.selectedPts = this.tempPoints.minPts;
	    break;
	    case "max":
	    this.tempPoints.selectedPts = this.tempPoints.maxPts;
	    break;
	    case "rand":
	    default: // Note the default is random for now
	    // Start with a random bonus score between 0 and max available bonus
	    var randomPoints = Math.floor(Math.random()*1000000)%(this.tempPoints.bonus+1);
	    debug('>>> '+this.name+' chose '+randomPoints+' bonus points');
	    // Now go through the available star points for each star
	    this.updateAvailableStarScores();
	    for (var s=0; s < lastToggledCard.stars; s++) {
		// Select a random element from the available star scores array
		var l = Math.floor(Math.random()*1000000)%(this.availableStarScores.length);
		// debug('>>> '+this.name+' chose level '+l+' for star['+s+'], which is '+this.availableStarScores[l]+'pts');
		debug('>>> '+this.name+' chose '+this.availableStarScores[l]+'pts for star['+s+'] ('+this.tempPoints.starsMin+'-'+this.tempPoints.starsMax+')');
		randomPoints += this.availableStarScores[l];
	    }
	    debug('>>> '+this.name+' chose a total of '+randomPoints+' random points');
	    // Notice that minPts already includes the min star points available, so re-calculate the sel. pts.
	    this.tempPoints.selectedPts = this.tempPoints.links + this.tempPoints.partners + randomPoints;
	    }
	    debug (this.name+" chose "+this.tempPoints.selectedPts+" points on strategy "+this.pointStrategy);
	}
	this.tempScore = this.score+this.tempPoints.selectedPts;
	return this.tempScore;
    };
    // Player takes card
    this.takeCard = function (card) {
	this.cardsOwned[card.group].push(card.id); // Add this card to the cardsOwned table
	card.assign(this.num); // Finalize card assignment
	if (groupOwner[card.group] < 0) { // Check if groups was not previously owned.
	    debug("Setting groupOwner["+card.group+"] from "+groupOwner[card.group]+" to "+this.num);
	    groupOwner[card.group] = this.num;
	}
    };

    // Things the player should do at end of turn
    this.endTurn = function (c) {
	this.updateStarLevels(); // Why do I need this here??? PPG
	this.history.push('Move '+this.moves+': '+this.name+' has taken card '+c.id+' and changed score from '+this.score+' to '+this.tempScore);
	this.score = this.tempScore-this.bid;
	this.moves++;
    };

    this.rgba = function (op) {
        return 'rgba('+this.color.rgb+','+op+')';
    }

}; // END of player constructor

/* Constructor for points objects */
function pointsObj() {
    this.links = 0;
    this.partners = 0;
    this.starsMin = 0;
    this.starsMax = 0;
    this.starsSelected=[];
    this.starSelectedPts=0;
    this.bonus = 0;
    this.minPts = 0;
    this.maxPts = 0;
    this.selectedPts = 0;
    /* METHODS */
    // Clear the points object
    this.clear = function() {
	this.links=0;
	this.partners=0;
	this.starsMin=0;
	this.starsMax=0;
	this.starsSelected=[];
	this.starSelectedPts=0;
	this.bonus=0;
	this.minPts=0;
	this.selectedPts=0;
	this.maxPts=0;
    }; // end of points.clear()
}

/* Constructor for card objects */
function cardObj(group,row) {
    this.id = groupLabels[group]+rowLabels[row];
    this.CSSId = "c"+this.id;
    this.imgURL = cardsDir+this.id+".png";
    this.active = false;
    this.stars = tableCells[group][row].stars;
    this.links = tableCells[group][row].links;
    this.partners = tableCells[group][row].partners;
    this.group = group;
    this.row = row;
    this.hasButton = false; // Note: hasButton reflects when a button is on even temporarily
    this.button = new buttonObj(this); // Each card can own a button
    this.unclaimed = true; // This becomes false when the player confirms the move to take this
    this.player = -1; // Initially we have an invalid player
    this.playerValues = []; // An array of objects holding card value for all players
    /* Methods */
    this.setButton = function (pNum) { // Set card button to a specific player color
	this.hasButton = true;
	this.button.set(pNum); // This passes the right src file to the img
	this.button.show();
    };
    /* Method to clear the button off this card */
    this.clearButton = function () { // Clear all button data and hide it
	this.button.hide();
	this.hasButton = false;
    };
    /* Method to toggle the card's opacity and background to make it easier to tell it's taken*/
    this.bgSet = function (pNum) {
	document.getElementById("bg"+this.id).style.backgroundColor = players[pNum].color.name;
	document.getElementById("img"+this.id).style.opacity = 0.6;
    }
    /* Method to clear card backgorund (no owner) */
    this.bgClear = function () {
	document.getElementById("bg"+this.id).style.backgroundColor = "white";
	document.getElementById("img"+this.id).style.opacity = 1.0;
    }
    /* Method to assign this card to a player */
    this.assign = function (pNum) { // Assign card to a player and update button
	debug("Card "+this.id+" going to player "+players[pNum].name);
	this.player = pNum;
	this.unclaimed = false;
	this.setButton (pNum);
	this.bgSet(pNum); // Make the cards; background the color of the owner for ease
    };
    /* Method to release this card from any player */
    this.release = function () { // Clear this card.
	this.clearButton();
	this.unclaimed = true;
	this.bgClear();
	this.player = -1;
    };

    /* A method to return the value of this card for all players */
    this.updateValues = function () {
	this.playerValues = []; // Reset the array of values!
	for (p in players) {
	    // The values are updaed in player's tempPoints and copied to card's local array
	    this.playerValues.push(this.calculateValue(players[p]));
	}
	if (this.unclaimed) this.updateScoresOverlay();
    };

    /* Method to refresh the scores in the score overlay on each card. */
    this.updateScoresOverlay = function () {
	for (p in players) {
	    var olRow = document.getElementById("ob"+this.id+'p'+p);
	    var olrH = olRow.style.clientHeight;
	    olRow.innerHTML = '<div class="overlayPlayerScoreDiv"'+((p == currentPlayer)?' style="background-color:white;"':'')+'>'+
	    players[p].name+': '+this.playerValues[p].minPts+" - "+this.playerValues[p].maxPts+
	    '</div>';
	}
    }

    /* Method to toggle a card's score overlay on or off */
    this.toggleScoreOverlay = function(show) {
	document.getElementById("ob"+this.id).style.visibility = (show) ? "visible" : "hidden";
    }

    /* Method to toggle a pop-up of the card image */
    this.view = function () {
	var cv = document.getElementById('cardView');
	var cvi;
	var wh = window.innerHeight;
	var ww = window.innerWidth;
	var ih, iw;

	// First, remove everything from the holding div
	while (cv.hasChildNodes())
	    cv.removeChild(cv.firstChild);

	// Now create a new image and give it various properties
	cvi = new Image();
	cvi.id = 'cardViewImage';
	cvi.className = 'card';

	// This function is necessary in order to get/set the right image size
	cvi.onload = function () {
	    ih = cvi.height;
	    iw = cvi.width;
	    debug ("Viewing card "+this.id+": ww="+ww+", wh="+wh+", iw="+iw+", ih="+ih);
	    
	    // Now check the screen aspect ratio and adjust the image accordingly
	    if (wh > ww) { // Portrait window - the window width is the constraint
		if (ih > iw) { // Portrait image
		    cvi.height = 0.8*ww;
		} else { // Landscape image
		    cvi.width = 0.8*ww;
		}
	    } else { // Landscape window: the height is the constraint
		if (ih > iw) { // Portrait image
		    cvi.height = 0.8*wh;
		} else { // Landscape image
		    cvi.width = 0.8*wh;
		}
	    }
	}
		
	// Load the source img
	cvi.src = "Cards/Original/"+this.id+"-original.png"; 
	// Turn off the cardView div on click
	cvi.onclick = function () {document.getElementById('cardView').style.display='none';};
	// Now add the image to the div
	cv.appendChild(cvi);

	// Make sure you turn it on if it wasn't turned on already.
	cv.style.display = 'block';

    }

    /* This method returns the value of this card for the player whose ID is passed in */
    this.calculateValue = function(player) {
	// OK - this damn thing about scoping just made me waste a half day.
	// I was manipulating directly the player's tempPoints, so it was
	// always being set to the last card's values for all cards, all players!!! :-(
	var p = new playerObj("nobody",playerColors[0],true); // Create a dummy player for score calculations
	    
	p.init();
	
	// If this card is already taken, no need to calculate its value
	if (this.player > 0) {
	    //	    debug(" [card.calculateValue()]: Skipping card "+this.id+" for evaluation");
	    return;
	}

	// Sanity check - reject if the card is occupied
	if (!this.unclaimed) {
	    //	    alert("Sorry, you can't calculate points for an occupied card!");
	    return;
	}	    

	// We are doing all the temp points calculations using the player's tempPoints object
	var pts = p.tempPoints;
	// Clear out the points array
	pts.clear(); 

	/* LINKS POINTS */
	/* Check links to other groups. You get 10 points for each link corresponding
	   to a group in which you own a card. */
	for (var cl in this.links) { // Iterate over links for the card
	    // As long as the player has >= 1 of the cards, points are awarded per link.
	    pts.links += ptsPerLink*this.links[cl]*((player.cardsOwned[cl].length>0)?1:0);
	}
	//	debug("Card "+this.id+": based on links, player "+player.num+" has "+pts.links+" points.");
	/* Check the group for the card we clicked. If the player does not have any cards in
	   this group (p.groups==0), but the card has a link to its own group, then getting
	   the card would give the player one extra link point. */
	if (player.cardsOwned[(this.group)].length == 0) pts.links += ptsPerLink*this.links[(this.group)];

	/* PARTNER POINTS */
	/* Check partner cards. You get 25 points for each partner card that you own.  */
	for (cp in this.partners) { // Iterate over partners for this card
	    if (cardsList[this.partners[cp]].player == player.num) { // See if each card is owned by player
		pts.partners += ptsPerPartner;
	    }
	    // Check if this card has a partner with itself
	    if (this.partners[cp] == this.id) {
		pts.partners += ptsPerPartner;
	    }		
	}

	/* STAR POINTS */
	/* Check stars. For each star, you can get 25 points times the number of cards you own
	   in any group. You can apply different levels to different stars.
	   Here we calculate the min and max star points. */

	/* We need to check something. If the group I am clicking on already has 
	   player.maxStarLevel buttons on it, then clicking this group will effectively increase
	   maxStarLevel. In fact, it may mess things up because it could also invalidate
	   maxStarLevel, if for instance I have two buttons already in this group, one button in
	   another group, and nothing else, then if I click on the group with one button,
	   then the possible levels would be 1 or 2. But if I click on the group with two buttons,
	   the new possible levels would be 1 or 3 only. What I should do is to create a
	   temp array that matches the player's array, but then run the calculation on it
	   as if the player had taken the cell it has clicked on.
	*/

	/* Try something sly: make p cardsOwned the same as player.cardsOwned, then let it
	   take the new card and recalculate its star scores */
	p.cardsOwned = player.cardsOwned;
	p.cardsOwned[this.group].push(this.id); // Add this card to the cardsOwned table
	p.updateStarLevels();
	
	//	debug("Compare player and p:\n"+JSON.stringify(player)+"\n"+JSON.stringify(p));

	p.cardsOwned[this.group].pop();

	// Min is the number of stars times the min level for this player times points per star
	pts.starsMin = p.minStarLevel*this.stars*ptsPerStar;
	
	// Max is the number of stars times the max level for this player times points per star
	pts.starsMax = p.maxStarLevel*this.stars*ptsPerStar;

	// Here we need to choose: should the default star points be the min or the max?
	pts.starsSelected = [];
	pts.starSelectedPts = 0;
	for (var s = 0; s < this.stars; s++) {
	    pts.starsSelected.push(p.maxStarLevel); // Substitute minStarLevel if you want that default
	    pts.starSelectedPts += pts.starsSelected[s]*ptsPerStar;
	}

	/* BONUS POINTS */
	/* Check if bonus applies. If it's your first card in this group, you can
	   choose whether to take 0 or 50 points. */
	if (player.cardsOwned[this.group].length <= 0) {
	    pts.bonus = ptsPerBonus;
	} else {
	    pts.bonus = 0;
	}

	// Now calculate min, max and actual scores
	pts.minPts = pts.links+pts.partners+pts.starsMin;
	pts.maxPts = pts.links+pts.partners+pts.starsMax+pts.bonus;
	pts.selectedPts = pts.maxPts; // Arbitrary default - can swap to minPts.
	p.tempScore = p.score + pts.selectedPts;


	//	debug (" Just updated card "+this.id+" value for player "+player.num+" "+JSON.stringify(pts));

	return pts;


    }; // End of card.value() method


} // end of Card

/* Constructor for buttons */
function buttonObj(card) {
    // Initially you only specify some basic information about the card
    this.id = card.id;
    this.CSSId = "b"+card.id;
    // This places the button file in the <img> tag and makes it visible.
    this.set = function(pNum) {
	document.getElementById(this.CSSId).src = buttonsDir+players[pNum].color.name+".png";
	this.show();
    }
    // This makes the button visible
    this.show = function() {
	document.getElementById(this.CSSId).style.visibility = "visible"; // Bring it forward
    }
    // This makes the button invisible
    this.hide = function() {
	document.getElementById(this.CSSId).style.visibility = "hidden"; // Throw it to the back
    }
}

/* Constructor for color objects */
function colorObj() {
    this.name;
    this.rgb;
    this.hex;
    this.textColor;
    this.taken;
    this.rgba = function (op) {
	return 'rgba('+this.rgb+','+op+')';
    }


}
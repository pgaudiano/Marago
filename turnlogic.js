/* This file contains functions related to the logic of each turn. Here is the overall logic flow:
   beginGameTurn() - Things are initialized that only should be initialized at the start of a turn
   beingPlayerMove() - Things done when a player starts or restarts (after failed bid) the turn
   endPlayerMove() - Things the player does at the end of the turn
   endGameTurn() - Anything that needs to be done at the game level before starting the next turn
*/

/* Begin a new game turn. In general, should do the following:
   refresh the entire players panel
   refresh all the player inspector panels
   call the player method to initialize the turn
      reset current player's bothered array
      reset numBothered = 0
      set star levels array properly
   begin the player's move
*/
function beginGameTurn () {
    var p = players[currentPlayer];

    updatePlayersPanel(p.num); // Refresh the entire players panel
    updatePlayerInspectors(p.num); // Refresh/draw all the player inspector panels
    p.initTurn(); // Initialize the turn for the current player
    beginPlayerMove(p);
}


/* Begin the player's move, or start a new move after losing a bid. Should the the following:
   - *ensure card value panel is closed
   - *hide card score overlays if they are on
   - *clear any claimed bu untaken buttons
   - *refresh the player's panel
     [above items with * should not need to happen here!]
   - set moveConfirmed to false [H/AI]
   - calculate the value of all untaken cards for all players [H/AI]
   - call the player method to begin Move (set bid=0 and tempScore=score) [H/AI]
   - disable the card score button [H]
   - disable the confirm move button [H]
   - disable the finish turn button [H]
   - execute an AI turn [AI]
*/
function beginPlayerMove (p) {
    playerMoveConfirmed = false;
    updateCardValues();
    p.beginMove();

    if (p.isHuman) {
	updatePlayersPanel(p); // This may not be needed PPGO
	disableCardScoreButton();
	disableFinishButton();
	/* Notice: at this point, the game waits for the human player to do something. */
    } else {
	beginAIMove();
    }	
}


/* End the player's move. At this point either the player has taken a card, or he has already
   bothered all the other players and is effectively skipping a turn. In the wildcar version
   the player may be able to purchase a wildcard at this point. So there should be a popup that
   gives you the choice of buying a wildcard (if they are used) or else it says "Sorry, but
   you are not able to take a marago during this turn" and then a "finish turn" button. And whether
   the player clicks this button or the one in the players panel, make sure to close the dialog...

   Here is what should be done here - which is specific to the player's turn (as opposed to the
   game turn as a whole):
   - update the player's score
   - update the player's score in the player panel
   - update all the player ranks (this
   - add entry to player's history
*/
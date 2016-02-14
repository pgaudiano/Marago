/* General debug flag */
var consoleDebug = 1;

/* ------ GENERAL GAME PARAMETERS ------ */
/* Flags to control overall behavior */
var landscape = 1; // Landscape or potrait?
var useDibsAndBids = true; // Include the dibs & bids
var useWildCards = false; // Play with or without wildcards?
/* Global turn tracker */
var gameTurns;
/* Array to keep track of history */
var turnsHistory = [];


/* ------ POINTS-RELATED PARAMETERS ------ */
/* Points variables  */
var ptsPerLink = 10;
var ptsPerPartner = 25;
var maxStars = 3;
var ptsPerStar = 25;
var ptsPerBonus = 50;
var maxPointsDiff = 250;
var minPointsDiff = 25;

/* ------ BOARD PARAMETERS ------ */
/* Specify how many groups of cards to include on the board */
var groupLabels = ["1","2","3","4","5","6","7"];
var maxGroups = groupLabels.length;
var groupsUsed = 3;
var groupOwner = new Array();

var rowLabels = ["K","W","X","Y","Z","J"];
var maxRows = rowLabels.length;
if (!landscape) rowLabels.reverse(); // In portrait mode, groups run vertical

/* Specify the directory containing the card images */
var cardsDir = (landscape) ? "Cards/Horizontal/" : "Cards/Horizontal/";
var buttonsDir = "Buttons/";
var imgDir = "Img/";

/* ------ CARD PARAMETERS ------ */
/* Put the properties of cells into a 2D array of objects */
var tableCells = [
		  [
{stars: 2, links: [5,1,1,1,1,1,5], partners: []}, //1K
{stars: 1, links: [5,1,1,1,1,1,5], partners: []}, //1W
{stars: 1, links: [5,1,1,1,1,1,5], partners: []}, //1X
{stars: 1, links: [5,1,1,1,1,1,5], partners: []}, //1Y
{stars: 1, links: [5,1,1,1,1,1,5], partners: []}, //1Z
{stars: 2, links: [5,1,1,1,1,1,5], partners: []} //1J
		   ],
		  [
{},
{stars: 3, links: [0,0,0,0,0,0,0], partners: ["1Z","2Z","3Z","4Z","5Z","6Z","7Z"]}, //2W
{stars: 1, links: [0,0,0,0,0,0,0], partners: ["1W","2X","3Y","4Z","5W","6X","7Y"]}, //2X
{stars: 1, links: [0,0,0,0,0,0,0], partners: ["1J","1K","1W","1X","1Y","1Z"]}, //2Y
{stars: 3, links: [1,1,1,1,1,1,1], partners: []}, //2Z
{}
		   ],
		  [
{},
{stars: 0, links: [5,1,1,1,1,1,1], partners: ["1W","1X","1Y","1Z","3W"]}, //3W
{stars: 0, links: [1,1,1,1,1,1,1], partners: ["1Z","2Y","3W","3X","4X","5Z","6Y","7X"]}, //3X
{stars: 0, links: [1,1,1,1,1,1,1], partners: ["1W","1X","1Y","1Z","3W","3X","3Y"]}, //3Y
{stars: 0, links: [5,1,1,1,1,1,1], partners: ["1J","1K","3W","3X","3Y","3Z"]}, //3Z
{}
		   ],
		  [
{},
{stars: 1, links: [0,0,0,2,2,2,2], partners: []}, //4W
{stars: 1, links: [0,0,0,2,2,2,2], partners: []}, //4X
{stars: 1, links: [0,0,0,2,2,2,2], partners: []}, //4Y
{stars: 1, links: [0,0,0,2,2,2,2], partners: []}, //4Z
{}
		   ],
		  [
{},
{stars: 2, links: [0,0,0,0,5,2,1], partners: []}, //5W
{stars: 1, links: [0,0,0,0,2,4,2], partners: []}, //5X
{stars: 1, links: [0,0,0,0,2,4,2], partners: []}, //5Y
{stars: 2, links: [0,0,0,0,2,2,4], partners: []}, //5Z
{}
		   ],
		  [
{},
{stars: 0, links: [0,0,0,0,2,2,2], partners: ["5W","5X","5Y","6W","6X","6Y","7W","7X","7Y"]}, //6W
{stars: 2, links: [0,0,0,0,2,2,2], partners: []}, //6X
{stars: 2, links: [0,0,0,0,2,2,2], partners: []}, //6Y
{stars: 0, links: [0,0,0,0,2,2,2], partners: ["5Z","5Z","5Z","6Z","6Z","6Z","7Z","7Z","7Z"]}, //6Z
{}
		   ],
		  [
{},
{stars: 0, links: [0,0,0,0,4,4,1], partners: ["5W","5X","5Y","6W","6X","6Y","7W"]}, //7W
{stars: 0, links: [0,0,0,0,4,1,4], partners: ["5Z","5Z","6Z","6Z","7W","7X"]}, //7X
{stars: 0, links: [0,0,0,0,1,4,4], partners: ["5Z","6Z","7W","7X","7Y"]}, //7Y
{stars: 0, links: [0,0,0,0,3,3,5], partners: ["7W","7X","7Y","7Z"]}, //7Z
{}
		   ]
		  ];

/* This object array holds the information for each set of cards */
var cardsList = {};

// This variable tracks how many cards are left in the game
var cardsLeft;

// For later use make an array of all the keys (i.e., card IDs)
var lastToggledCard; // Used to keep track of toggling buttons on cards

// Wildcards
var maxWildCards;

/* ------- PLAYER PARAMETERS ------ */
var playerNames = ['Pollo','Maris','Giorgio','Anora','Franco','Annalisa','Samuele','Antonella','Stefano','Elena','Pietro','HAL 9000','iRobot','Marvin','Deep Thought','Neuromancer','Terminator','Siri','Alexa','Agent Smith','The Matrix','Lucy','Roy Batty','Leon','Pris','Borg Queen','Max 404','Cassandra One','Ash','MOTHER','Veronica'];
var players = [];
var rankedPlayers = []; // Keep track of player ranks.
var numPlayers; // Will be calculated later
var minPlayers = 2;
var maxPlayers = 5;
var initialScore = 100;
var currentPlayer;
var playerMoveConfirmed;
/* AI Player Strategies */
// This should be changed later to be per-player.
var AICardStrategy = 'min';
var AIPointStrategy = 'min';
// Create arrays of all the possible strategies for card, points, etc.
var AICardStrategies = ["rand"];
var AIPointStrategies = ["min","rand","max"];

/* ------- COLOR PARAMETERS ------- */
/* Keep track of colors*/

var playerColors = [ // Available button colors
    {name: "green", rgb: "0, 128, 0", textColor: "white", taken: false},
    {name: "red", rgb: "255, 0, 0", textColor: "white", taken: false},
    {name: "black", rgb: "16, 16, 16", textColor: "white", taken: false},
    {name: "gray", rgb: "96, 96, 96", textColor: "white", taken: false},
    {name: "yellow", rgb: "255, 255, 0", textColor: "#333333", taken: false},
    {name: "blue", rgb: "0, 0, 255", textColor: "white", taken: false},
    {name: "orange", rgb: "255, 165, 0", textColor: "#333333", taken: false},
    {name: "purple", rgb: "128, 0, 128", textColor: "white", taken: false},
    {name: "white", rgb: "255, 255, 255", textColor: "#333333", taken: false},
    {name: "brown", rgb: "165, 42, 42", textColor: "white", taken: false}
];

var numColors = Object.keys(playerColors).length;

var buttonColors = Object.keys(playerColors);

var buttonsAvailable = { // Keep track of player buttons
    "green": "white",
    "red": "white",
    "yellow": "black",
    "blue": "white",
    "orange": "black",
    "white": "black",
    "brown": "white",
    "purple": "white"
}

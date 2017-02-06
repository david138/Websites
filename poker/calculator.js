/**
 * This file contains the back-end Javascript code for the Poker Calculator.
 */


var NUM_PLAYERS = 6; // Maximum number of players
var INITIAL_PLAYERS = 2; 
var CURRENT_PLAYERS = INITIAL_PLAYERS;
var ROUNDS = 50000; // Number of times the poker scenario is simulated

/*
  A playing card, it contains a number and a suit.
 */
function Card(num, suit) {

    this.num = num;
    this.suit = suit;
}

/*
  Possible ranks on a card.
 */
var ranks = {two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
               jack: 11, queen: 12, king: 13, ace: 14, random: '?'};

/*
  Possible suits on a card.
 */
var suits = {hearts: "♥", clubs: "♣", diamonds: "♦", spades: "♠", random: "?"};


/*
  Dictionairy that holds all in hands and on board.
  Key: rank + suit of card
  Value: returns true if card is true, false otherwise.
 */
var cardsInPlay = {};

/*
  This dictionairy will hold all the random cards in play.
  Key: rank + suit of card
  Value: returns true if card is true, false otherwise.
 */
var randomCardsInPlay = {};

/*
  This dictionary will give a count of each rank and suit in play,
  it is useful for partially complete cards.
 */
var cardsInPlayCount = {};

var tempAdditions = {}; //temporary additions to cardsInPlayCount from random cards


/*
  Adds all possible cards to cardsInPlay and randomCardsInPlay and sets them to false (out of play)
*/
for (var rank in ranks) {
    for (var suit in suits) {

        cardsInPlay[ranks[rank] + suits[suit]] = false;
        //randomCardsInPlay[ranks[rank] + suits[suit]] = false; perhaps only put random cards in array to begin with
    }
}

/*
   Add each rank and suit to the cards in play count and set each to 0.
 */
for (var rank in ranks) {
    cardsInPlayCount[ranks[rank]] = 0;
}
for (var suit in suits) {
    cardsInPlayCount[suits[suit]] = 0;
}

/*
  A player, has 2 cards and a win and tie rate.
  inPlay is true when the player is currently playing
  HandStrength is the strength of the players current hand
 */
function Player() {
    this.card1 = new Card(ranks.random, suits.random);
    this.card2 = new Card(ranks.random, suits.random);
    this.inPlay = false;
    this.winRate = "";
    this.tieRate = "";
    this.handStrength = 0;
}


/*
   Creation of players.
 */
var players = {};

for (var player = 1; player <= NUM_PLAYERS; player ++) {
    players["player" + player] = new Player();

    if (player < INITIAL_PLAYERS) {
        players["player" + player].inPlay = true;
    }
}

/*
   Creation of the community and it's five cards.
 */
var community = {card1: new Card(ranks.random, suits.random), card2: new Card(ranks.random, suits.random),
                 card3: new Card(ranks.random, suits.random), card4: new Card(ranks.random, suits.random),
                 card5: new Card(ranks.random, suits.random)};


/*
   The strength of a players hand.

   primaryStrength:
    1: High Card
    2: Pair
    3: Double Pair
    4: Three of a Kind
    5: Straight
    6: Flush
    7: Full House
    8: Four of a Kind
    9: Straight Flush
   secondStrength to sixthStrength:
    The next most powerful attributes of the hand in descending order ex. the highest card in a flush
    is secondStrength and the lowest card in a flush is sixthStrength.
 */
function HandStrength(cards) {

    // sort the cards by rank
    cards = sortHand(cards);

    // Check for flush
    var straight, flush = checkFlush(cards);

    this.strength = [0, 0, 0, 0, 0, 0];
    // if flush...
    if (flush.length > 0) {

        // checks for straight flush
        straight = checkStraight(flush);

        // if straight flush...
        if (straight != 0) {
       //     this.handType = "Straight Flush";
            this.strength[0] = 9;
            this.strength[1] = straight;

        } else {
       //     this.handType = "Flush";
            this.strength[0] = 6;
            this.strength[1] = flush[0];
            this.strength[2] = flush[1];
            this.strength[3] = flush[2];
            this.strength[4] = flush[3];
            this.strength[5] = flush[4];
        }
        return;
    }



    cards = [cards[0].num, cards[1].num, cards[2].num, cards[3].num, cards[4].num, cards[5].num, cards[6].num];

    // Checks for straights
    straight = checkStraight(cards);

    if (straight[0]) {
       // this.handType = "Straight";
        this.strength[0] = 5;
        this.strength[1] = straight;
        return;
    }


    // Checks for matches
    var matches = checkMatches(cards);

    switch(matches[0]) {
        case 1:
           // this.handtype = "High Card";
            this.strength[0] = 1;
            this.strength[1] = matches[1];
            this.strength[2] = matches[2];
            this.strength[3] = matches[3];
            this.strength[4] = matches[4];
            this.strength[5] = matches[5];
            break;
        case 2:
         //   this.handType = "Pair";
            this.strength[0] = 2;
            this.strength[1] = matches[1];
            this.strength[2] = matches[2];
            this.strength[3] = matches[3];
            this.strength[4] = matches[4];
            break;

        case 3:
         //   this.handType = "Double Pair";
            this.strength[0] = 3;
            this.strength[1] = matches[1];
            this.strength[2] = matches[2];
            this.strength[3] = matches[3];
            break;

        case 4:
          //  this.handType = "Three of a Kind";
            this.strength[0] = 4;
            this.strength[1] = matches[1];
            this.strength[2] = matches[2];
            this.strength[3] = matches[3];
            break;

        case 7:
          //  this.handType = "Full House";
            this.strength[0] = 7;
            this.strength[1] = matches[1];
            this.strength[2] = matches[2];
            break;

        case 8:
         //   this.handType = "Four of a Kind";
            this.strength[0] = 8;
            this.strength[1] = matches[1];
            this.strength[2] = matches[2];
            break;

    }

}

/*
  Sorts the ranks of the given cards in descending order and returns them.
 */

function sortHand(cards) {
    var temp, i, j;

    for (i = 1; i < cards.length; i++) {
        temp = cards[i];
        for (j = i; j > 0; j--) {
            if (temp.num > cards[j - 1].num) {
                cards[j] = cards[j - 1];
                cards[j - 1] = temp;
            }
        }
    }
    return cards;

}


/*
   Checks for Flush in given cards.
   If there is a flush, returns the flush cards, else returns empty array.
 */
function checkFlush (cards) {
    var curSuit,
        curCount,
        flushCards = [], //cards of the same suit of flush
        i,
        j,
        c;

    /*
       Checks if the first 3 cards in the hand have the same suit as
       4 other cards.
     */
    for (i = 0; i < 3; i++) {
        curCount = 1;
        curSuit = cards[i].suit;
        for (j = i + 1; j < cards.length; j++) {
            if (curSuit == cards[j].suit) {
                curCount ++;
            }
            if (curCount >= 5) {
                for (c = 0; c < cards.length; c++) {
                    if (cards[c].suit == curSuit) {
                        flushCards.push(cards[c].num);
                    }
                }
                return flushCards;
            }
        }
    }
    return [];
}

/*
   Checks for straight in given cards.
   If straight exists it returns the highest number of the straight, it returns 0 otherwise.

 */
function checkStraight(numbers) {

    // Add aces to beginning of array.
    if (numbers[0] == 14) {
        numbers = numbers.concat([1]);
    }


    var straight,
        j;
    for (var i = 0; i < numbers.length - 4; i++) {
        straight = true;
        j = i;
        while (straight && j < numbers.length - 1) {
            if (numbers[j] - 1 != numbers[j + 1] && numbers[j] != numbers[j + 1]) {
                straight = false;
            }

            if (straight && (numbers[i] - numbers[j + 1] == 4)) {
                return numbers[i];
            }

            j ++;
        }
    }
    return 0;
}

/*
   Checks for multiples of the same rank.
   Returns the power of the hand and the number of the matching ranks.
 */
function checkMatches (cards) {

    var count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], removed, i, toBeRemoved;


    for (i = 0; i < cards.length; i++) {
        count[cards[i]]++;
    }

    i = 0;
    removed = 0;
    toBeRemoved = 1;
    while (removed < 2) {
        if (i >= count.length) {
            i = 0;
            toBeRemoved ++;
        }

        if (count[i] == toBeRemoved) {
            count[i] --;
            removed ++;
        }
        i ++;
    }

    var max = 0, maxNumber = 0, secondMax = 0, secondMaxNumber = 0,
        ones = [1, 0, 0, 0, 0, 0], onesIndex = 1;


    for (i = count.length - 1; i >= 0; i--) {
        if (count[i] > max) {
            secondMax = max;
            secondMaxNumber = maxNumber;
            max = count[i];
            maxNumber = i;
        } else if (count[i] > secondMax) {
            secondMax = count[i];
            secondMaxNumber = i;
        }

        if (count[i] == 1) {
            ones[onesIndex] = i;
            onesIndex ++;
        }
    }


    switch(max) {
        case 1:
            return ones;
            break;
        case 2:
            if (secondMax == 1) {
                return [2, maxNumber, ones[1], ones[2], ones[3], ones[4]];
            } else {
                return [3, maxNumber, secondMaxNumber, ones[1], ones[2], ones[3]];
            }
            break;
        case 3:
            if (secondMax == 1) {
                return [4, maxNumber, ones[1], ones[2]];
            } else {
                return [7, maxNumber, secondMaxNumber];
            }
            break;
        case 4:
            return [8, maxNumber, secondMaxNumber];
        break;
    }
}


/*
   Returns more powerful hand, returns 0 if hands are equal strength.
 */
function checkHand (handStrength1, handStrength2) {
    var strength1 = handStrength1.strength, strength2 = handStrength2.strength;
    for (var i = 0; i < strength1.length; i ++) {
        if (strength1[i] > strength2[i]) {
            return 1;
        } else if (strength1[i] < strength2[i]) {
            return 2;
        }
    }
    return 0;
}

/*
   Calculates the win and tie rates for each player
   Interacts directly with players winRate and tieRate attributes.
 */
function calculateWinPercentages (rounds) {
        var round, //current round being simulated
        r,
        curPlayer, // player whose cards are currently being checked
        curComp = [],
        winningPlayers, // array of currently winning players
        strengthOutcome; // outcome of calculateStrength function calls
    
    // simulates ROUNDS rounds of show downs
    for (round = 0; round < rounds; round ++) {

        // generates random cards for each player that needs it
        for (r = 1; r <= CURRENT_PLAYERS; r++) {
            curPlayer = players['player' + r];
            curPlayer.randomCard1 = createRandomCard(curPlayer.card1);
            curPlayer.randomCard2 = createRandomCard(curPlayer.card2);
        }

        // generates random community cards
        for (r = 1; r <= 5; r++) {
            community["randomCard" + r] = createRandomCard(community["card" + r]);
        }

        // calculate initial players hand strength
        curPlayer = players['player1'];
        curComp = [curPlayer.randomCard1, curPlayer.randomCard2, community.randomCard1, community.randomCard2,
            community.randomCard3, community.randomCard4, community.randomCard5];

        curPlayer.handStrength = new HandStrength(curComp);

        winningPlayers = [players['player' + 1]]; // add player to winners

        // loops through each player to find player with best hand
        for (r = 2; r <= CURRENT_PLAYERS; r++) {
            curPlayer = players['player' + r];
            curComp = [curPlayer.randomCard1, curPlayer.randomCard2, community.randomCard1, community.randomCard2,
                community.randomCard3, community.randomCard4, community.randomCard5];
            curPlayer.handStrength = new HandStrength(curComp);
            strengthOutcome = checkHand(winningPlayers[0].handStrength, curPlayer.handStrength);

            if (strengthOutcome == 2) {
                winningPlayers = [curPlayer];
            } else if (strengthOutcome == 0) {
                winningPlayers.push(curPlayer);
            }
        }

        // add wins or ties to players with best hands
        if (winningPlayers.length == 1) {
            winningPlayers[0].winRate ++;
        } else {
            for (r = 0; r < winningPlayers.length; r++) {
                winningPlayers[r].tieRate ++;
            }
        }
        removeRandomCards();
        
    }
    
}


/*
   Creates a random card, with the same attributes as card.
 */
function createRandomCard (card) {
    var randomCard = new Card(card.num, card.suit),
        cardFound = false,
        rankKeys, suitKeys;

    if (randomCard.num == ranks.random && randomCard.suit == suits.random) {
        rankKeys = Object.keys(ranks);
        suitKeys = Object.keys(suits);
        while (!cardFound) {
            randomCard.num = ranks[rankKeys[Math.floor(13 * Math.random())]];
            randomCard.suit = suits[suitKeys[Math.floor(4 * Math.random())]];

            if (!cardsInPlay[randomCard.num + randomCard.suit] &&
                cardsInPlayCount[randomCard.num] < 4 && cardsInPlayCount[randomCard.suit] < 13) {
                cardsInPlay[randomCard.num + randomCard.suit] = true;
                randomCardsInPlay[randomCard.num + randomCard.suit] = true;
                cardFound = true;
                cardsInPlayCount[randomCard.num] ++;
                if (randomCard.num in tempAdditions) {
                    tempAdditions[randomCard.num] ++;
                } else {
                    tempAdditions[randomCard.num] = 1;
                }
                cardsInPlayCount[randomCard.suit] ++;
                if (randomCard.suit in tempAdditions) {
                    tempAdditions[randomCard.suit] ++;
                } else {
                    tempAdditions[randomCard.suit] = 1;
                }
            }
        }
    } else if (randomCard.num == ranks.random) {
        rankKeys = Object.keys(ranks);
        while (!cardFound) {

            randomCard.num = ranks[rankKeys[Math.floor(13 * Math.random())]];

            if (!cardsInPlay[randomCard.num + randomCard.suit] && cardsInPlayCount[randomCard.num] < 4) {
                cardsInPlay[randomCard.num + randomCard.suit] = true;
                randomCardsInPlay[randomCard.num + randomCard.suit] = true;
                cardFound = true;
                cardsInPlayCount[randomCard.num] ++;
                if (randomCard.num in tempAdditions) {
                    tempAdditions[randomCard.num] ++;
                } else {
                    tempAdditions[randomCard.num] = 1;
                }
            }
        }
    } else if (randomCard.suit == suits.random) {
        suitKeys = Object.keys(suits);
        while (!cardFound) {
            randomCard.suit = suits[suitKeys[Math.floor(4 * Math.random())]];
            if (!cardsInPlay[randomCard.num + randomCard.suit]  && cardsInPlayCount[randomCard.suit] < 13) {
                cardsInPlay[randomCard.num + randomCard.suit] = true;
                randomCardsInPlay[randomCard.num + randomCard.suit] = true;
                cardFound = true;
                cardsInPlayCount[randomCard.suit] ++;
                if (randomCard.suit in tempAdditions) {
                    tempAdditions[randomCard.suit] ++;
                } else {
                    tempAdditions[randomCard.suit] = 1;
                }
            }
        }
    }

    return randomCard;
}

/*
   Removes all random cards.
 */
function removeRandomCards() {
    for (var card in randomCardsInPlay) {
        cardsInPlay[card] = false;
    }
    randomCardsInPlay = {};

    for (var key in tempAdditions) {
        cardsInPlayCount[key] -= tempAdditions[key];
    }
    tempAdditions = {};
}
/**
 * Created by luked on 4/28/2016.
 */


var NUM_PLAYERS = 6;
var INITIAL_PLAYERS = 2;
var ROUNDS = 100000;

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
var ranks = {two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
               jack: '11', queen: '12', king: '13', ace: '14', random: '?'};

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
  Adds all possible cards to cardsInPlay and randomCardsInPlay and sets them to false (out of play)
*/
for (var rank in ranks) {
    for (var suit in suits) {

        cardsInPlay[ranks[rank] + suits[suit]] = false;
        //randomCardsInPlay[ranks[rank] + suits[suit]] = false; perhaps only put random cards in array to begin with
    }
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

    // if flush...
    if (flush.length > 0) {

        // checks for straight flush
        straight = checkStraight(flush);

        // if straight flush...
        if (straight != 0) {
       //     this.handType = "Straight Flush";
            this.strength = 9 * 100000 + straight * 10000;

        } else {
       //     this.handType = "Flush";
            this.strength = 6 * 100000
                   + flush[0] * 10000
                   + flush[1] * 1000
                   + flush[2] * 100
                   + flush[3] * 10
                   + flush[4];
        }
        return;
    }

    cards = [cards[0].num, cards[1].num, cards[2].num, cards[3].num, cards[4].num, cards[5].num, cards[6].num];

    // Checks for straights
    straight = checkStraight(cards);

    if (straight[0]) {
       // this.handType = "Straight";
        this.strength = 5 * 100000
            + straight[1] * 10000;
        return;
    }

    // Checks for matches
    var matches = checkMatches(cards);

    switch(outcome[0]) {
        case 1:
           // this.handtype = "High Card";
            this.strength = 100000
                + matches[1] * 10000
                + matches[2] * 1000
                + matches[3] * 100
                + matches[4] * 10
                + matches[5] * 1;
            break;
        case 2:
         //   this.handType = "Pair";
            this.strength = 2 * 100000
                 + matches[1] * 10000
                 + matches[2] * 1000
                 + matches[3] * 100
                 + matches[4] * 10;
            break;

        case 3:
         //   this.handType = "Double Pair";
            this.strength = 3 * 100000
                 + matches[1] * 10000
                 + matches[2] * 1000
                 + matches[3] * 100;
            break;

        case 4:
          //  this.handType = "Three of a Kind";
            this.strength = 4 * 100000
                 + matches[1] * 10000
                 + matches[2] * 1000
                 + matches[3] * 100;
            break;

        case 7:
          //  this.handType = "Full House";
            this.strength = 7 * 100000
                 + matches[1] * 10000
                 + matches[2] * 1000;
            break;

        case 8:
         //   this.handType = "Four of a Kind";
            this.strength = 8 * 100000
                 + matches[1] * 10000
                 + matches[2] * 1000;
            break;

    }

}

/*
  Sorts the ranks of the given cards in descending order and returns them.
 */

function sortHand(cards) {
    var temp, i, j;

    for (i = 0; i < 7; i++) {
        temp = cards[i + 1];
        for (j = i + 1; j > 0; j--) {
            if (temp.num > cards[j - 1].num) {
                cards[j] = cards[j - 1];
            }  else {
                cards[j] = temp;
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
    if (strength1 > strength2) {
        return 1;
    } else if (strength1 < strength2) {
        return 2;
    } else {
        return 0;
    }
}

/*
   Calculates the win and tie rates for each player
   Interacts directly with players winRate and tieRate attributes.
 */
function calculateWinPercentages () {
    var playersPlaying = [], // Players currently playing
        round, //current round being simulated
        r,
        communityCards = [], // array which stores the community cards
        curPlayer, // player whose cards are currently being checked
        winningPlayers, // array of currently winning players
        strengthOutcome; // outcome of calculateStrength function calls

    /*
       Creates array of players currently playing and resets the win and tie rates
     */
    for (var i = 1; i <= NUM_PLAYERS; i++) {
        if (players["player" + i].inPlay) {
            players["player" + i].tieRate = 0;
            players["player" + i].winRate = 0;
            playersPlaying.push(players["player" + i]);
        }
    }

    // simulates ROUNDS rounds of show downs
    for (round = 0; round < ROUNDS; round ++) {

        // generates random cards for each player that needs it
        for (r = 0; r < playersPlaying.length; r++) {
            playersPlaying[r].randomCard0 = createRandomCard(playersPlaying[r].card1);
            playersPlaying[r].randomCard1 = createRandomCard(playersPlaying[r].card2);
        }

        // generates random community cards
        for (r = 0; r < community.length; r++) {
            community["randomCard" + r] = createRandomCard(community["card" + r]);
            communityCards.push(community["randomCard" + r]);
        }

        // calculate initial players hand strength
        playersPlaying[0].handStrength =
            new HandStrength([playersPlaying[0].randomCard0, playersPlaying[0].randomCard1].concat(communityCards));

        winningPlayers = [playersPlaying[0]]; // add player to winners


        // loops through each player to find player with best hand
        for (r = 1; r < playersPlaying.length; r ++) {
            curPlayer = playersPlaying[r];
            curPlayer.handStrength =
                new HandStrength([curPlayer.randomCard0, curPlayer.randomCard1].concat(communityCards));
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
            for (r = 0; r < winningPlayers.length; r ++) {
                winningPlayers[r].tieRate ++;
            }
        }

        removeRandomCards();
    }

    for (r = 0; r < playersPlaying.length; r ++) {
        playersPlaying[r].winRate = playersPlaying[r].winRate / ROUNDS;
        playersPlaying[r].tieRate = playersPlaying[r].tieRate / ROUNDS;
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

            if (!cardsInPlay[randomCard.num + randomCard.suit]) {
                cardsInPlay[randomCard.num + randomCard.suit] = true;
                randomCardsInPlay[randomCard.num + randomCard.suit] = true;
                cardFound = true;
            }
        }
    } else if (randomCard.num == ranks.random) {
        rankKeys = Object.keys(ranks);
        while (!cardFound) {
            randomCard.num = ranks[rankKeys[Math.floor(13 * Math.random())]];

            if (!cardsInPlay[randomCard.num + randomCard.suit]) {
                cardsInPlay[randomCard.num + randomCard.suit] = true;
                randomCardsInPlay[randomCard.num + randomCard.suit] = true;
                cardFound = true;
            }
        }
    } else if (randomCard.suit == suits.random) {
        suitKeys = Object.keys(suits);
        while (!cardFound) {
            randomCard.suit = ranks[suitKeys[Math.floor(4 * Math.random())]];

            if (!cardsInPlay[randomCard.num + randomCard.suit]) {
                cardsInPlay[randomCard.num + randomCard.suit] = true;
                randomCardsInPlay[randomCard.num + randomCard.suit] = true;
                cardFound = true;
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
}
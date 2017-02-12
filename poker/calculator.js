/**
 * This file contains the back-end Javascript code for the Poker Calculator.
 */


var STRENGTH_CONSTANT = 100;

/*
  Possible ranks on a card.
 */
var Rank = {Two: 2, Three: 3, Four: 4, Five: 5, Six: 6, Seven: 7, Eight: 8, Nine: 9, Ten: 10,
               Jack: 11, Queen: 12, King: 13, Ace: 14, Unknown: 'u'};

/*
  Possible suits on a card.
 */
var Suit = {Hearts: "♥", Clubs: "♣", Diamonds: "♦", Spades: "♠", Unknown: "u"};

var HandType = {HighCard: 1, Pair: 2, TwoPair: 3, Triple: 4, Straight: 5, Flush: 6, FullHouse: 7, Quad: 8,
                 StraightFlush: 9};


/*
 A playing card, it contains a rankber and a suit.
 */
function Card(value, suit) {
    this.rank = value || Rank.Unknown;
    this.suit = suit || Suit.Unknown;
    this.id = this.value + this.suit;
}

/*
   A players hand, contains an array of the players cards.
 */
function Hand() {
    this.cards = [new Card(), new Card()];
}

/*
  A player, has 2 cards and a win and tie rate.
  inPlay is true when the player is currently playing
  HandStrength is the strength of the players current hand
 */
function Player() {
    if (typeof Player.counter === "undefined") {
        Player.counter = 0;
    }
    this.id = Player.counter++;
    this.hand = new Hand();
}

$.extend(Player.prototype, {
   addCard: function(cardSlot, card) {
       this.hand.cards[cardSlot] = card;
   }
});

/*
   A board, contains all information on the table.
 */
function Board() {
    this.players = []; // only players actually playing
    this.communityCards = [];
    this.cardsInPlayById = {};
    this.playerStrengthById = [];
    this.ranksInPlayCount = {};
    this.suitsInPlayCount = {};
}

$.extend(Board.prototype, {

    /*
       Add new player to the board.
     */
    addPlayer: function () {
        var player = new Player();
        this.players.push(player);
        return player;
    },
    setPlayerCard: function (playerId, cardSlot, rank, suit) {
        this.players[playerId].addCard(cardSlot, new Card(rank, suit));

        this.cardsInPlayById[this.players[playerId].hand.cards[cardSlot].id] = true;
        this.ranksInPlayCount[rank] = this.ranksInPlayCount[rank] + 1 || 1;
        this.suitsInPlayCount[suit] = this.suitsInPlayCount[suit] + 1 || 1;
    },
    setCommunityCard: function (cardSlot, rank, suit) {
        this.communityCards[cardSlot] = new Card(rank, suit);

        this.cardsInPlayById[this.communityCards[cardSlot].id] = true;
        this.ranksInPlayCount[rank] = this.ranksInPlayCount[rank] + 1 || 1;
        this.suitsInPlayCount[suit] = this.suitsInPlayCount[suit] + 1 || 1;
    },
    isCardInPlay: function (id) {
        return this.cardsInPlayById[id] || false;
    },
    isRankAvailable: function(rank) {
        return this.ranksInPlayCount[rank] < 4 || this.ranksInPlayCount[rank] === undefined;
    },
    isSuitAvailable: function(suit) {
        return this.suitsInPlayCount[suit] < 13 || this.suitsInPlayCount[suit] === undefined;
    },
    setPlayerStrengths: function() {
        for (var i = 0; i < this.players.length; i++) {
            this.playerStrengthById.push(calculateStrength(this.players[i].hand.cards.concat(this.communityCards)));
        }
    },
    getHighestStrengthPlayerIds: function() {
        if (typeof this.playerStrengthById === "undefined") {
            return -1;
        }

        var winningPlayers = [],
            currentHighestStrength = 0;

        for (var i = 0; i < this.playerStrengthById.length; i++) {
            if (this.playerStrengthById[i] > currentHighestStrength) {
                winningPlayers = [i];
                currentHighestStrength = this.playerStrengthById[i];
            } else if (this.playerStrengthById[i] === currentHighestStrength) {
                winningPlayers.push(i);
            }
        }
        return winningPlayers;

    },
    randomizeUnknownCards: function () {
        var i, j;

        for (i = 0; i < this.players.length; i++) {
            for (j = 0; j < this.players[i].hand.cards.length; j++) {
                this.randomizeCard(this.players[i].hand.cards[j]);
            }
        }
        for (i = 0; i < this.communityCards.length; i++) {
            this.randomizeCard(this.communityCards[i]);
        }
    },
    randomizeCard: function(currentCard) {

        var rank = currentCard.rank,
            suit = currentCard.suit,
            cardFound = (rank !== Rank.Unknown && suit !== Suit.Unknown),
            randomCard = {},
            randomRank = false,
            randomSuit = false;
        while (!cardFound) {
            if (rank === Rank.Unknown) {
                randomRank = true;
                randomCard.rank = Rank[Object.keys(Rank)[Math.floor(13 * Math.random())]];
                while (!this.isRankAvailable(randomCard.rank) && randomCard.rank !== Rank.Unknown) {
                    randomCard.rank = Rank[Object.keys(Rank)[Math.floor(13 * Math.random())]];
                }
            }
            if (suit === Suit.Unknown) {
                randomSuit = true;
                randomCard.suit = Suit[Object.keys(Suit)[Math.floor(4 * Math.random())]];
                while (!this.isSuitAvailable(randomCard.suit) && randomCard.suit !== Suit.Unknown) {
                    randomCard.suit = Suit[Object.keys(Suit)[Math.floor(4 * Math.random())]];
                }
            }
            if (!this.isCardInPlay(randomCard.rank + randomCard.suit)) {
                cardFound = true;

                if (randomRank) {
                    this.ranksInPlayCount[randomCard.rank] = this.ranksInPlayCount[randomCard.rank] + 1 || 1;
                }
                if (randomSuit) {
                    this.suitsInPlayCount[randomCard.suit] = this.suitsInPlayCount[randomCard.suit] + 1 || 1;
                }
                currentCard.rank = randomCard.rank;
                currentCard.suit = randomCard.suit;
                currentCard.id = randomCard.rank + randomCard.suit;
                this.cardsInPlayById[currentCard.id] = true;
            }
        }

    },
    resetCardsInPlay: function () {
        this.cardsInPlayById = {};
        this.playerStrengthById = [];
        this.ranksInPlayCount = {};
        this.suitsInPlayCount = {};
    }
});

/*
   The strength of a players hand.
 */
function calculateStrength(cards) {

    var strength = 0, i;

    // Check for flush
    var flush = checkFlush(cards);

    // if flush...
    if (flush.length > 0) {

        flush.sort(function(a, b){return b-a});

        // checks for straight flush
        var straight = checkStraight(flush);

        // if straight flush...
        if (straight > 0) {
            strength = HandType.StraightFlush;
            strength *= STRENGTH_CONSTANT;
            strength += straight;
            strength *= Math.pow(STRENGTH_CONSTANT, 5);

        } else {
       //     this.handType = "Flush";
            strength = HandType.Flush;
            strength *= STRENGTH_CONSTANT;
            for (i = 0; i < 5; i++) {
                strength += flush[i];
                strength *= STRENGTH_CONSTANT;
            }
        }
        return strength;
    }



    cards = [cards[0].rank, cards[1].rank, cards[2].rank, cards[3].rank, cards[4].rank, cards[5].rank, cards[6].rank];
    cards.sort(function(a, b){return b-a});

    // Checks for straights
    var straight = checkStraight(cards);

    if (straight > 0) {
       // this.handType = "Straight";
        strength = HandType.Straight;
        strength *= STRENGTH_CONSTANT;
        strength += straight;
        strength *= Math.pow(STRENGTH_CONSTANT, 5);
        return strength;
    }


    // Checks for matches
    var matches = checkMatches(cards);

    strength = matches.handType;
    strength *= STRENGTH_CONSTANT;
    for (i = 0; i < matches.cards.length; i++) {
        strength += matches.cards[i];
        strength *= STRENGTH_CONSTANT;
    }

    return strength;

}

/*
   Checks for Flush in given cards.
   If there is a flush, returns the flush cards, else returns empty array.
 */
function checkFlush (cards) {
    var curSuit, curCount, flushCards = []; //cards of the same suit of flush

    /*
       Checks if the first 3 cards in the hand have the same suit as
       4 other cards.
     */
    for (var i = 0; i < 3; i++) {
        curCount = 1;
        curSuit = cards[i].suit;
        for (var j = i + 1; j < cards.length; j++) {
            if (curSuit === cards[j].suit) {
                curCount ++;
            }
            if (curCount >= 5) {
                for (var c = 0; c < cards.length; c++) {
                    if (cards[c].suit === curSuit) {
                        flushCards.push(cards[c].rank);
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
   If straight exists it returns the highest rankber of the straight, it returns 0 otherwise.

 */
function checkStraight(numbers) {

    // Add aces to beginning of array.
    if (numbers[0] === 14) {
        numbers = numbers.concat([1]);
    }

    var straight,
        j;
    for (var i = 0; i < numbers.length - 4; i++) {
        straight = true;
        j = i;
        while (straight && j < numbers.length - 1) {
            if (numbers[j] - 1 !== numbers[j + 1] && numbers[j] !== numbers[j + 1]) {
                straight = false;
            }

            if (straight && (numbers[i] - numbers[j + 1] === 4)) {
                return numbers[i];
            }

            j ++;
        }
    }
    return 0;
}

/*
   Checks for multiples of the same rank.
   Returns the power of the hand and the rankber of the matching ranks.
 */
function checkMatches (cards) {

    var count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    /*
       Adds each card rank to its index in an array.
     */
    for (i = 0; i < cards.length; i++) {
        count[cards[i]]++;
    }

    /*
       Removes the two lowest cards in the lowest index values to bring the total to 5.
     */
    var i = 0,
    removed = 0, // Amount of cards current removed.
    indexCount = 1; // Index value of the removed cards, increases by 1 through each array traversal.
    while (removed < 2) {
        if (i >= count.length) {
            i = 0;
            indexCount++;
        }

        if (count[i] === indexCount) {
            count[i] --;
            removed ++;
        }
        i ++;
    }

    var max = 0, maxNumber = 0, secondMax = 0, secondMaxNumber = 0,
        onesIndexes = [0, 0, 0, 0, 0, 0], // Holds the indexes where 1's are located.
        currentOnesIndex = 0; // Current index being filled in onesIndex.


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

        if (count[i] === 1) {
            onesIndexes[currentOnesIndex] = i;
            currentOnesIndex ++;
        }
    }

    switch(max) {
        case 1:
            return {
                handType: HandType.HighCard,
                cards: onesIndexes
            };
            break;
        case 2:
            if (secondMax === 1) {
                return {
                    handType: HandType.Pair,
                    cards: [maxNumber, maxNumber].concat(onesIndexes)
                }
            } else {
                return {
                    handType: HandType.TwoPair,
                    cards: [maxNumber, maxNumber, secondMaxNumber, secondMaxNumber, onesIndexes[0]]
                };
            }
            break;
        case 3:
            if (secondMax === 1) {
                return {
                    handType: HandType.Triple,
                    cards: [maxNumber, maxNumber, maxNumber, onesIndexes[0], onesIndexes[1]]
                }
            } else {
                return {
                    handType: HandType.FullHouse,
                    cards: [maxNumber, maxNumber, maxNumber, secondMaxNumber, secondMaxNumber]
                };
            }
            break;
        case 4:
            return {
                handType: HandType.Quad,
                cards: [maxNumber, maxNumber, maxNumber, maxNumber, onesIndexes[0]]
            };
            break;
    }
}

/*
   Calculates the win and tie rates for each player
   Interacts directly with players winRate and tieRate attributes.
 */
function getOddsPerPlayer(board, iterations) {

    var playerCardsCopy = [],
        currentCard = undefined,
        i, j;

    for (i = 0; i < board.players.length; i++) {
        playerCardsCopy.push([]);
        for (j = 0; j < board.players[i].hand.cards.length; j++) {
            currentCard = board.players[i].hand.cards[j];
            playerCardsCopy[i].push({rank: currentCard.rank, suit: currentCard.suit});
        }
    }

    var communityCardsCopy = [];
    for (i = 0; i < board.communityCards.length; i++) {
        currentCard = board.communityCards[i];
        communityCardsCopy.push({rank: currentCard.rank, suit: currentCard.suit});
    }

    var winningPlayers = [],
        results = [];

    for (i = 0; i < board.players.length; i++) {
        results.push({wins: 0, ties: 0});
    }

    for (var iteration = 0; iteration < iterations; iteration++) {
        board.randomizeUnknownCards();
        board.setPlayerStrengths();
        winningPlayers = board.getHighestStrengthPlayerIds();

        if (winningPlayers.length === 1) {
            results[winningPlayers[0]].wins++;
        } else {
            for (i = 0; i < winningPlayers.length; i++) {
                results[winningPlayers[i]].ties ++;
            }
        }

        board.resetCardsInPlay();

        for (i = 0; i < board.players.length; i++) {
            for (j = 0; j < board.players[i].hand.cards.length; j++) {
                board.setPlayerCard(i, j, playerCardsCopy[i].rank, playerCardsCopy[i][j].suit);
            }
        }
        for (i = 0; i < communityCardsCopy.length; i++) {
            board.setCommunityCard(i, communityCardsCopy[i].rank, communityCardsCopy[i].suit)
        }
    }

    return results;
}
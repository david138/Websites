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
    this.id = this.rank + this.suit;
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
            } else {
                randomCard.rank = rank;
            }
            if (suit === Suit.Unknown) {
                randomSuit = true;
                randomCard.suit = Suit[Object.keys(Suit)[Math.floor(4 * Math.random())]];
                while (!this.isSuitAvailable(randomCard.suit) && randomCard.suit !== Suit.Unknown) {
                    randomCard.suit = Suit[Object.keys(Suit)[Math.floor(4 * Math.random())]];
                }
            } else {
                randomCard.suit = suit;
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
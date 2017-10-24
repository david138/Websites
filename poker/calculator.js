/**
 * This file contains the back-end Javascript code for the Poker Calculator.
 */

var STRENGTH_CONSTANT = 100;

var HandType = {HighCard: 1, Pair: 2, TwoPair: 3, Triple: 4, Straight: 5, Flush: 6, FullHouse: 7, Quad: 8,
                StraightFlush: 9};

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
    for (i = 0; i < 5; i++) {
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
    var straight, j;
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
            i = 0;
            indexCount = 1;
        } else {
            i ++;
        }
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
            playerCardsCopy[i].push(new Card(currentCard.rank, currentCard.suit));
        }
    }
    var communityCardsCopy = [];
    for (i = 0; i < board.communityCards.length; i++) {
        currentCard = board.communityCards[i];
        communityCardsCopy.push(new Card(currentCard.rank, currentCard.suit));
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
                board.setPlayerCard(i, j, playerCardsCopy[i][j].rank, playerCardsCopy[i][j].suit);
            }
        }
        for (i = 0; i < communityCardsCopy.length; i++) {
            board.setCommunityCard(i, communityCardsCopy[i].rank, communityCardsCopy[i].suit)
        }
    }
    return results;
}

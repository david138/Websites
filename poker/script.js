/**
 * Created by luked on 4/28/2016.
 */


function Card(num, suit) {

    this.num = num;
    this.suit = suit;
    this.inPlay = false;

}

var randCard = new Card(-1, "r");

function Player() {
    this.cards = new Array(2);
    this.cards[0] = randCard;
    this.cards[1] = randCard;
    this.inPlay = false;
    this.randomed = false;
}

var community = new Array(5).fill(randCard);

/*
 Create the deck.
 */
var deck = new Array(52);

var symbols = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];
var suits = ["h", "c", "d", "s"];
var suitsSymbols = ["&hearts;", "&clubs;", "&diams;", "&spades;"];

for (var i = 0; i < suits.length; i++) {
    for (var j = 0; j < symbols.length; j++) {
        deck[i * symbols.length + j] = new Card(j + 2, suits[i]);
    }
}

var players = new Array(6);
var numPlayers = 2;

for (var p = 0; p < players.length; p++) {
    players[p] = new Player();
}

players[0].inPlay = true;
players[1].inPlay = true;

function sortHand (cards) {
    var numbers = [];

    for (i = 0; i < cards.length; i ++) {
        numbers.push(cards[i].num);
    }
    return numbers.sort(function(a, b){return b-a});
}

/*
 Returns the strength of a given hand.
 */


function calcPlayerHand(cards) {


    var flush = checkFlush(cards),
        straight,
        cardNumsSorted,
        outcome;

    if (flush[0]) {
        cardNumsSorted = sortHand(flush[1]);
        straight = checkStraightSorted(cardNumsSorted);

        if (straight[0]) {
            return [8, straight[1]];
        } else {
            return [5].concat(cardNumsSorted.slice(0, 5));
        }
    }

    cardNumsSorted = sortHand(cards);
    straight = checkStraightSorted(cardNumsSorted);

    if (straight[0]) {
        return [4, straight[1]];
    }

    outcome = checkMatches(cards);

    var highPair,
        handStrength,
        i;

    switch(outcome[0]) {
        case 1:
            return [0].concat(cardNumsSorted.slice(0, 5));
        case 2:

            if (outcome[2]) {
                return [2, outcome[1], outcome[2], outcome[3]];
            } else {
                highPair = outcome[1];
                handStrength = [1, outcome[1], 0, 0, 0];
                for (i = 2, j = 0; i < 5; i++) {
                    cardNumsSorted[j] == highPair ? j = j + 2: null;
                    handStrength[i] = cardNumsSorted[j];
                    j++;
                }
                return handStrength;
            }
        case 3:
            if (outcome[2]) {
                return [6, outcome[1], outcome[2]];
            }
            highPair = outcome[1];
            handStrength = [3, outcome[1], 0, 0];
            for (i = 2, j = 0; i < 4; i++) {
                cardNumsSorted[j] == highPair ? j = j + 3: null;
                handStrength[i] = cardNumsSorted[j];
                j++;
            }
            return handStrength;
        case 4:
            if (outcome[2] > outcome[3]) {
                return [7, outcome[1], outcome[2]];
            }
            return [7, outcome[1], outcome[3]];

    }

}

function checkMatches (cards) {

    var max = 1,
        curNum,
        curIndex,
        maxNum = 0,
        secondPair = 0,
        first = 0,
        second = 0,
        third = 0,
        count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


    for (var i = 0; i < cards.length; i++) {
        curNum = cards[i].num;
        count[curNum] ++;
        curIndex = count[curNum];
        if (maxNum == curNum) {
            max ++;
        } else if(curIndex == 2 && secondPair) {
            if (curNum > secondPair) {
                secondPair = curNum;
            }
            if (max == 2 && curNum > maxNum) {
                secondPair = maxNum;
                maxNum = curNum;
            }
        }else if (curIndex == 2) {
            if (max == 1) {
                max++;
                maxNum = curNum;
            } else if (max > 2) {
                secondPair = curNum
            } else if (curNum > maxNum) {
                secondPair = maxNum;
                maxNum = curNum;
            } else {
                secondPair = curNum;
            }
        } else if (curIndex > 2) {
            if (curIndex > max) {
                if (maxNum > secondPair) {
                    secondPair = maxNum;
                }
                maxNum = curNum;
            } else if (curIndex == max) {
                if (curNum > secondPair) {
                    secondPair = curNum;
                }
                if (curNum > maxNum) {
                    secondPair = maxNum;
                    maxNum = curNum;
                }
            }
        }
        if (curNum > first) {
            third = second;
            second = first;
            first = curNum;
        } else if (curNum > second && curNum < first) {
            third = second;
            second = curNum;
        }else if (curNum > third && curNum < second) {
            third = curNum;
        }
    }
    if (first != maxNum && first != secondPair) {
        return [max, maxNum, secondPair, first];
    } else if (second != maxNum && second != secondPair) {
        return [max, maxNum, secondPair, second];
    } else {
        return [max, maxNum, secondPair, third];
    }
}

function checkStraightSorted(numbers) {

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
                return [true, numbers[i]];
            }

            j ++;
        }
    }
    return [false]
}


function checkFlush (cards) {
    var curSuit,
        curCount,
        flushCards = [],
        i,
        j,
        c;

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
                        flushCards.push(cards[c]);
                    }
                }
                return [true, flushCards];
            }
        }
    }
    return [false];
}

function highCard(cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;

    if (outcome[0] >= 2) {
        return -1;
    }

    sortedNums = sortHand(cards);
    var i = 1,
        j = 0;
    while (villainBeat == 0 && i < handRank.length) {
        if (sortedNums[i - 1] > handRank[i]) {
            return -1;
        } else if (sortedNums[j] < handRank[i]) {
            villainBeat = 1;
        }
        i++;
        j++;
    }

    if (checkFlush(cards)[0]) {
        return -1;
    }

    if (checkStraightSorted(sortedNums)[0]) {
        return -1;
    }

    return villainBeat;
}

function pair (cards, handRank) {

    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;

    switch (outcome[0]) {
        case 1:
            villainBeat = 1;
            sortedNums = sortHand(cards);
            break;
        case 2:
            var pairNum = outcome[1];
            if (outcome[2] || pairNum > handRank[1]) {
                return -1;
            }
            sortedNums = sortHand(cards);
            if (pairNum == handRank[1]) {
                var i = 2,
                    j = 0;
                while (villainBeat == 0 && i < handRank.length) {
                    sortedNums[j] == pairNum ? j = j + 2 : null;
                    if (sortedNums[j] > handRank[i]) {
                        return -1;
                    } else if (sortedNums[j] < handRank[i]) {
                        villainBeat = 1;
                    }
                    i++;
                    j++;
                }
            } else {
                villainBeat = 1;
            }
            break;
        default:
            return -1;
    }

    if (checkFlush(cards)[0]) {
        return -1;
    }

    if (checkStraightSorted(sortedNums)[0]) {
        return -1;
    }

    return villainBeat;
}

function doublePair(cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;

    switch (outcome[0]) {
        case 1:
            villainBeat = 1;
            break;
        case 2:
            outcome[2] == 0 ? villainBeat = 1 : null;

            var i = 1;
            while (villainBeat == 0 && i < outcome.length) {
                if (outcome[i] > handRank[i]) {
                    return -1;
                } else if (outcome[i] < handRank[i]) {
                    villainBeat = 1;
                }
                i++
            }
            break;
        default:
            return -1;
    }

    sortedNums = sortHand(cards);

    if (checkFlush(cards)[0]) {
        return -1;
    }

    if (checkStraightSorted(sortedNums)[0]) {
        return -1;
    }

    return villainBeat;
}

function triple(cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;
    switch (outcome[0]) {
        case 1:
        case 2:
            sortedNums = sortHand(cards);
            villainBeat = 1;
            break;
        case 3:
            var pairNum = outcome[1];
            if (outcome[2] || pairNum > handRank[1]) {
                return -1;
            }
            sortedNums = sortHand(cards);
            if (pairNum == handRank[1]) {
                var i = 2,
                    j = 0;
                while (villainBeat == 0 && i < handRank.length) {
                    sortedNums[j] == pairNum ? j = j + 3 : null;
                    if (sortedNums[j] > handRank[i]) {
                        return -1;
                    } else if (sortedNums[j] < handRank[i]) {
                        villainBeat = 1;
                    }
                    i++;
                    j++;
                }
            } else {
                villainBeat = 1;
            }
            break;
        default:
            return -1;
    }

    if (checkFlush(cards)[0]) {
        return -1;
    }

    if (checkStraightSorted(sortedNums)[0]) {
        return -1;
    }

    return villainBeat;
}

function straight(cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0;

    if (outcome[0] > 3 || (outcome[0] == 3 && outcome[2])) {
        return -1
    }

    if (checkFlush(cards)[0]) {
        return -1;
    }

    var straight = checkStraightSorted(sortHand(cards));
    if (straight[0]) {
        if (straight[1] > handRank[1]) {
            return -1;
        } else if (straight[1] < handRank[1]) {
            villainBeat = 1;
        }
    } else {
        villainBeat = 1;
    }

    return villainBeat;
}

function flush(cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;

    if (outcome[0] > 3 || (outcome[0] == 3 && outcome[2])) {
        return -1
    }

    var flush = checkFlush(cards);
    if (flush[0]) {
        sortedNums = sortHand(flush[1]);
        var i = 0;
        while (villainBeat == 0 && i < handRank.length) {
            if (sortedNums[i] > handRank[i+ 1]) {
                return -1;
            } else if (sortedNums[i] < handRank[i + 1]) {
                villainBeat = 1;
            }
            i++;
        }

        if (checkStraightSorted(sortedNums)[0]) {
            return -1;
        }
    } else {
        villainBeat = 1;
    }

    return villainBeat;
}

function fullHouse (cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;

    if (outcome[0] == 3 && outcome[2]) {
        var i = 1;
        while (villainBeat == 0 && i < outcome.length) {
            if (outcome[i] > handRank[i]) {
                return -1;
            } else if (outcome[i] < handRank[i]) {
                villainBeat = 1;
            }
            i++
        }
    } else if (outcome[0] > 3 ) {
        return -1;
    } else {
        villainBeat = 1;
    }

    var flush = checkFlush(cards);
    if (flush[0]) {
        sortedNums = sortHand(flush[1]);

        if (checkStraightSorted(sortedNums)[0]) {
            return -1;
        }
    }

    if (villainBeat == 0) {
    }
    return villainBeat;
}

function quads (cards, handRank) {
    var outcome = checkMatches(cards),
        villainBeat = 0,
        sortedNums;
    if (outcome[0] == 4) {
        if (outcome[1] > handRank[1]) {
            return -1;
        } else if (outcome[1] < handRank[1]) {
            villainBeat = 1;
        } else {
            var max = Math.max(outcome[2], outcome[3]);
            if (max > handRank[2]) {
                return -1
            } else if (max < handRank[2]) {
                villainBeat = 1;
            }
        }
    } else {
        villainBeat = 1;
    }

    var flush = checkFlush(cards);
    if (flush[0]) {
        sortedNums = sortHand(flush[1]);

        if (checkStraightSorted(sortedNums)[0]) {
            return -1;
        }
    }

    return villainBeat;
}

function straightFlush (cards, handRank) {
    var flush = checkFlush(cards),
        straight;
    if (flush[0]) {
        straight = checkStraightSorted(sortHand(flush[1]));
        if (straight[0]) {
            if (straight[1] > handRank[1]) {
                return -1;
            } else if (straight[1] == handRank[1]) {
                return 0;
            }
        }
    }

    return 1;
}

function checkHand (cards, handRank) {


    switch (handRank[0]) {
        case 0:
            return highCard(cards, handRank);
        case 1:
            return pair(cards, handRank);
        case 2:
            return doublePair(cards, handRank);
        case 3:
            return triple(cards, handRank);
        case 4:
            return straight(cards, handRank);
        case 5:
            return flush(cards, handRank);
        case 6:
            return fullHouse(cards, handRank);
        case 7:
            return quads(cards, handRank);
        case 8:
            return straightFlush(cards, handRank);
    }
}

function calculateWinPercentage (trials) {
    var playersPlaying = [],
        wins = 0,
        ties = 0,
        outcome,
        p1HandStrength,
        p1Wins,
        p1Ties,
        playerCards,
        i,
        r;

    for (i = 0; i < players.length; i++) {
        players[i].inPlay ? playersPlaying.push( players[i] ) : null;
    }
    
    for (i = 0; i < trials; i ++) {

        !playersPlaying[0].cards[0].inPlay ? playersPlaying[0].cards[0] = randomCard() : null;
        !playersPlaying[0].cards[1].inPlay ? playersPlaying[0].cards[1] = randomCard() : null;

        for (r = 0; r < community.length; r++) {
            !community[r].inPlay ? community[r] = randomCard() : null;
        }

        //   p1HandStrength = bestHand(players[0].cards.concat(community)),
        p1HandStrength = calcPlayerHand(players[0].cards.concat(community));
        p1Wins = true;
        p1Ties = false;
        j = 1;
        while (p1Wins && j < playersPlaying.length) {

            playerCards = playersPlaying[j].cards;
            !playerCards[0].inPlay ? playerCards[0] = randomCard() : null;
            !playerCards[1].inPlay ? playerCards[1] = randomCard() : null;

            switch (checkHand(playerCards.concat(community), p1HandStrength)) {
                case 0:
                    p1Ties = true;
                    break;
                case -1:
                    p1Wins = false;
            }
            j++;

        }
        if (p1Wins) {
            if (p1Ties) {
                ties ++;
            } else {
                wins ++;
            }
        }

        for (r = 0; r < playersPlaying.length; r++) {
            removeRandom(playersPlaying[r].cards);
        }
        removeRandom(community);

    }

    for (r = 0; r < community.length; r++) {
        !community[r].inPlay ? community[r] = randCard : null;
    }
    for (r = 0; r < playersPlaying.length; r++) {
        !playersPlaying[r].cards[0].inPlay ? playersPlaying[r].cards[0] = randCard : null;
        !playersPlaying[r].cards[1].inPlay ? playersPlaying[r].cards[1] = randCard : null;
    }



    return ([Math.round(wins / trials * 100), Math.round(ties / trials * 100)]);
}

function randomCard () {
    var card = deck[Math.floor(Math.random() * 52)];
    while (card.inPlay || card.randomed) {
        card = deck[Math.floor(Math.random() * 52)];
    }
    card.randomed = true;
    return card;
}

function removeRandom(cards) {
    for (var i = 0; i < cards.length; i++) {
        cards[i].randomed = false;
    }
}


$(window).bind("load", function() {
    var $card;
    var i, j, doubled, container, cardHeight;

    if ($(".filler").width() > 740) {
        cardHeight = 1.6;
    } else {
        cardHeight = 1;
    }

    var objWidth = $('.hide').width() / 2 - 10;

    $('.filler').css('min-height', (objWidth + 4) * cardHeight * 7 + 4 + 10 + 'px');
    $('main').css('min-height', (objWidth + 4) * cardHeight * 7 + 4 + 'px');

    var objHeight = $('main').height();

    for (i = 0; i < suits.length; i++) {
        var $suitsDiv = $('<div class="cardRow"></div>');
        doubled = false;
        container = 12;

        for (j = 0; j < symbols.length; j++) {
            $card = $('<div></div>');
            $card.addClass(suits[i]  + " card " + i + j + " c" + i + j);
            $card.data("card", "." + i.toString() + j.toString());

            var $remove = $("<div> <p> &#x2716; </p> </div>");
            var $top = $("<div>" + symbols[j] + "<div class='symbol'>" + suitsSymbols[i] + "</div></div>");
            var $mid = $("<div>" + symbols[j] + "</div>");
            var $bot = $("<div>" + symbols[j] + "<div class='symbol'>" + suitsSymbols[i] + "</div></div>");

            $remove.addClass("remove");
            $top.addClass("top");
            $mid.addClass("mid");
            $bot.addClass("bot");

            $card.append($remove);
            $card.append($top);
            $card.append($mid);
            $card.append($bot);

            container += objWidth * cardHeight + 4;


            if (!doubled && j > 6 && container > objHeight) {
                $("#" + suits[i]).append($suitsDiv);
                $suitsDiv = $('<div class="cardRow"></div>');
                doubled = true;
            }
            $suitsDiv.append($card);
        }
        $("#" + suits[i]).append($suitsDiv);
    }

    $('.cardRow').width(objWidth + 4);
    $('.card').width(objWidth);
    $('.card').height(objWidth * cardHeight);

    $('.cardGroup').height($('main').height() - 4);
        console.log($('main').height());

    setTimeout(function(){ resizeBoard() }, 200);

});

$(document).ready(function() {
    $(window).resize(function() {
        resizeBoard();
        setTimeout(function(){ resizeBoard() }, 200);
    })});

function resizeBoard() {
    var i, j, doubled, count, container, cardHeight;

    if ($(".filler").width() > 740) {
        cardHeight = 1.6;
    } else {
        cardHeight = 1;
    }

    var objWidth = $('.hide').width() / 2 - 10;

    $('.filler').css('min-height', (objWidth + 4) * cardHeight * 7 + 4 + 10 + 'px');
    $('main').css('min-height', (objWidth + 4) * cardHeight * 7 + 4 + 'px');

    var objHeight = $('main').height();

    $('.cardGroup').each(function() {

        count = 0;
        doubled = false;
        container = 12;

        var $suitsDiv = $('<div class="cardRow"></div>');
        var firstGroup = $(this).children().first();

        firstGroup.children().each(function() {
            container = container + objWidth * cardHeight + 4;

            if (!doubled && count > 6 && container > objHeight) {
                $suitsDiv.after($('<div class="cardRow"></div>'));
                $suitsDiv = $suitsDiv.next();
                doubled = true;
            }
            $suitsDiv.append($(this));
            count ++;
        });

        firstGroup.next().children().each(function () {
            container = container + objWidth * cardHeight + 4;

            if (!doubled && count > 6 && container > objHeight) {
                $suitsDiv.after($('<div class="cardRow"></div>'));
                $suitsDiv = $suitsDiv.next();
                doubled = true;
            }
            $suitsDiv.append($(this));
            count ++;
        });
        $(this).empty();
        if (doubled) {
            $(this).append($suitsDiv.prev());
            $(this).append($suitsDiv);
        } else {
            $(this).append($suitsDiv);
        }

    });

    $('.cardRow').width(objWidth + 4);
    $('.card').width(objWidth);
    $('.card').height(objWidth * cardHeight);


    $('.cardGroup').height($('main').height() - 4);
    // $('.filler').height($('main').height() - 4);
}

var cardSelect = false,
    playerSelect = false;

$(document).ready(function() {
    $(".cardGroup").on("click", ".card:not(.selected):not(.inPlay)", function() {
        cardSelect = true;
        $(".cardGroup").find(".selected").removeClass("selected");
        $(this).addClass("selected");
        if (playerSelect) {
            var card = $(this);
            var position = $("main").find(".selected");
            if (position.data("card") != null) {
                removeCard($(".cardGroup").find(position.data("card")), position);
            }
            addCard(card, position);
            cardSelect = false;
            playerSelect = false;
        }
    });
});

$(document).ready(function() {
    $(".cardGroup").on("click", ".selected:not(.inPlay)", function() {
        cardSelect = false;
        $(".selected").removeClass("selected");
    });
});

$(document).ready(function() {
    $("main").on("click", ".card:not(.selected)", function() {

        if (playerSelect) {


            var position,
                prevPosition,
                card = false,
                prevCard = false;

            prevPosition = $("main").find(".selected");
            if (prevPosition.data('card')) {
                prevCard = $('.cardRow').find(prevPosition.data('card'));
                removeCard(prevCard, prevPosition);
            }

            var position = $(this);
            if (position.data('card')) {
                var card = $('.cardRow').find(position.data('card'));
                removeCard(card, position);
            }

            if (prevCard) {
                addCard(prevCard, position);
            }
            if (card) {
                addCard(card, prevPosition);
            }

            playerSelect = false;

            if (!card && !prevCard) {
                $("main").find(".selected").removeClass("selected");
                $(this).addClass("selected");
                playerSelect = true;
            }

        } else {
            playerSelect = true;
            $("main").find(".selected").removeClass("selected");
            $(this).addClass("selected");
            if (cardSelect) {
                var position = $(this);
                if ($(this).data("card") != null) {
                    removeCard($(".cardGroup").find($(this).data("card")), position);
                }
                addCard($(".cardGroup").find(".selected"), position);
                cardSelect = false;
                playerSelect = false;
            }
        }
    });
});

$(document).ready(function() {
    $("main").on("click", ".selected", function() {
        playerSelect = false;
        $(".selected").removeClass("selected");
    });
});

function addCard(card, position) {

    var inPlay = card.data("card"); //information of new card
    var cardIndex = parseInt(inPlay.charAt(1) * 13) + parseInt(inPlay.substring(2)); // Index of new card in cards array
    var positionData = position.data("position");

    deck[cardIndex].inPlay = true;

    card.removeClass("selected");
    var cardClone = card.clone(true);
    card.addClass("inPlay");
    cardClone.css('width', $('.cardRow .card').css('width'));
    cardClone.find('.remove').show()

    cardClone.data("position", positionData);

    position.replaceWith(cardClone);


    if (positionData.substring(2) == "player") {
        players[positionData.charAt(0)].cards[positionData.charAt(1)] = deck[cardIndex];
    } else {
        community[positionData.charAt(0)] = deck[cardIndex];
    }


    //position.css('width', $('.cardRow .card').css('width'));
    cardClone.css('visibility', 'visible');
}

function removeCard(card, position) {

    position.removeData("card");

    position.removeClass();
    position.addClass("card");

    position.empty();


    card.removeClass("inPlay");

    var cardData = card.data("card"), //information of new card
        cardIndex = parseInt(cardData.charAt(1) * 13) + parseInt(cardData.substring(2)),
        positionData = position.data("position");

    deck[cardIndex].inPlay = false;

    if (positionData.substring(2) == "player") {
        players[positionData.charAt(0)].cards[positionData.charAt(1)] = randCard;
    } else {
        community[positionData.charAt(0)] = randCard;
    }
}

$(document).ready(function() {
    $(".calculate").on("click", function() {
        //$('.overlay').show();
        //$('.loadingBar').show();
        outcome = calculateWinPercentage (100000);
        $('.winRate').text("Win: " + outcome[0] + "%");
        $('.tieRate').text("Tie: " + outcome[1] + "%");
        //  $('.overlay').hide();
        //  $('.loadingBar').hide();
    });
});

$(document).ready(function() {
    $(document).on("click", ".card .remove", function() {
        var position = $(this).parent();
        if (position.hasClass('selected')) {
            playerSelect = false;
        }
        removeCard($(".cardGroup").find(position.data("card")), position);

    });
});

$(document).ready(function() {
    $(document).on("click", ".add-player", function() {

        console.log('dumb');
        $(this).find('p').text('-').css('top', '35%');
        $(this).removeClass('add-player').addClass('remove-player');
        var player = $(this).parent();
        player.find(".card").css("visibility", "visible");
        player.find('.removePlayer').css("visibility", "visible");
        players[player.data("player")].inPlay = true;
    });
});

$(document).ready(function() {
    $(document).on("click", ".remove-player", function() {

        console.log('hi');
        $(this).find('p').text('+').css('top', '45%');
        $(this).removeClass('remove-player').addClass('add-player');

        var player = $(this).parent();
        players[player.data("player")].inPlay = false;
        if (player.find('.card').hasClass('selected')) {
            playerSelect = false;
        }
        player.find(".card").each(function() {
            $(this).removeClass('selected');
            if ($(this).data('card') != null) {
                removeCard($(".cardGroup").find($(this).data("card")), $(this));
            }
            $(this).css('visibility', 'hidden');
        });
    });
});
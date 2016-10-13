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
    for (var i = 0; i < 3; i++) {
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
            j = 1;
        while (p1Wins && j < playersPlaying.length) {

            playerCards = playersPlaying[j].cards;
            !playerCards[0].inPlay ? playerCards[0] = randomCard() : null;
            !playerCards[1].inPlay ? playerCards[1] = randomCard() : null;

          outcome = checkHand(playerCards.concat(community), p1HandStrength);
   //       outcome = betterHand(p1HandStrength, bestHand(players[j].cards.concat(community)));
          outcome == 1 ? wins ++ : p1Wins = false; //7.5 s
          outcome == 0 ? ties ++ : p1Wins = false; //7.5 s
            j++;

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



    return (wins / trials * 100 + " ties: " + ties / trials * 100);
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



$(document).ready(function() {
    var $card;
    var i, j, doubled;

    var objHeight = $('main').css('height'),
        objWidth = $('.cardGroup').css('width');
    objHeight = objHeight.substring(0, objHeight.length - 2);
    objWidth = objWidth.substring(0, objWidth.length - 2) * .75;

    for (i = 0; i < suits.length; i++) {
        var $suitsDiv = $('<div class="cardRow"></div>');
        doubled = false;

        for (j = 0; j < symbols.length; j++) {
            $card = $('<div></div>');
            $card.addClass(suits[i]  + " card " + i + j);
            $card.data("card", "." + i + j);
            var $top = $("<div>" + symbols[j] + "</div>");
            var $mid = $("<div>" + symbols[j] + "</div>");
            var $bot = $("<div>" + symbols[j] + "</div>");

            $top.addClass("top");
            $mid.addClass("mid");
            $bot.addClass("bot");

            $card.append($top);
            $card.append($mid);
            $card.append($bot);

            //curWidth = $card.css('width');

           // curWidth = curWidth.substring(0, curWidth.length - 2);
         //  $card.css('height', curWidth * 1.5 + "px");
            $card.css('height', objWidth + 'px');
            if (!doubled && objWidth * (j + 2) > objHeight) {
             //   var split = $("<div class=\"split\"></div>");
             //   $(card).after(split);
                $("#" + suits[i]).append($suitsDiv);
                $suitsDiv = $('<div class="cardRow"></div>');
                doubled = true;
            }
            $suitsDiv.append($card);
        }
        $("#" + suits[i]).append($suitsDiv);
    }
    $('.cardGroup').css('height', $('main').css('height'));
});

$(document).ready(function() {
    $( window ).resize(function() {

        var i, j, doubled, count;

        var objHeight = $('main').css('height'),
            objWidth = $('.cardGroup').css('width'),
            curCard;
        objHeight = objHeight.substring(0, objHeight.length - 2);
        objWidth = objWidth.substring(0, objWidth.length - 2) * .75;

        $('.cardGroup').each(function() {

            count = 0;
            doubled = false;

            var $suitsDiv = $('<div class="cardRow"></div>');
            var firstGroup = $(this).children().first();

            firstGroup.children().each(function() {
                $(this).css('height', objWidth + 'px');
                if (!doubled && count > 6 && objWidth * (count + 2) > objHeight) {
                    $suitsDiv.after($('<div class="cardRow"></div>'));
                    $suitsDiv = $suitsDiv.next();
                    doubled = true;
                    count = 0;
                }
                $suitsDiv.append($(this));
                count ++;
            });

            firstGroup.next().children().each(function () {
                $(this).css('height', objWidth + 'px');
                if (!doubled && count > 6 && objWidth * (count + 2) > objHeight) {
                    $suitsDiv.after($('<div class="cardRow"></div>'));
                    $suitsDiv = $suitsDiv.next();
                    doubled = true;
                    count = 0;
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
                console.log(count);
                console.log(objWidth);
            }

        });


       // var oldDiv = $(".cardRow").contents();
       // $(".cardRow").replaceWith(oldDiv);

        $('.card').css('height', objWidth + 'px');

    });
});

var cardSelect = false;
var playerSelect = false;

$(document).ready(function() {
    $(".cardGroup").on("click", ".card:not(.inPlay)", function() {
        cardSelect = true;
        $(".cardGroup").find(".selected").removeClass("selected");
        $(this).addClass("selected");
        cardPlaced();
    });
});

$(document).ready(function() {
    $(".cardGroup").on("click", ".selected:not(.inPlay)", function() {
        cardSelect = false;
        $(".selected").removeClass("selected");
    });
});

$(document).ready(function() {
    $("main").on("click", ".card", function() {
        playerSelect = true;
        $("main").find(".selected").removeClass("selected");
        $(this).addClass("selected");
        cardPlaced();
    });
});

$(document).ready(function() {
    $("main").on("click", ".selected", function() {
        playerSelect = false;
        $(".selected").removeClass("selected");
    });
});


function cardPlaced() {
    if (playerSelect && cardSelect) {
        setTimeout(function() {

            var selected = $(".cardGroup").find(".selected");
            var old = $("main").find(".selected");

            var inPlay = selected.data("card");
            var outPlay = old.data("card");

            var cardIndex = parseInt(inPlay.charAt(1) * 13) + parseInt(inPlay.substring(2));

            if (outPlay != null) {
                deck[parseInt(outPlay.charAt(1) * 13) + parseInt(outPlay.substring(2))].inPlay = false;
            }
            deck[cardIndex].inPlay = true;

            var card = selected.clone(true);
            selected.addClass("inPlay");
            $(card).removeClass("selected");
            selected.removeClass("selected");

           // var removedCard = "." + old.text().substring(0, 2);
            $(".cardGroup").find(old.data("card")).removeClass("inPlay");

            $(card).data("position", old.data("position"));

            old.after(card);
            old.remove();



            var placement;
            var position = $(card).data("position");


            if (position.substring(2) == "player") {

                players[position.charAt(0)].cards[position.charAt(1)] = deck[cardIndex];
            } else {
                community[position.charAt(0)] = deck[cardIndex];
            }


            playerSelect = false;
            cardSelect = false;
        }, 100);
    }
}

$(document).ready(function() {
    $(".calculate").on("click", "button", function() {
        $('.winrate').text(calculateWinPercentage (100000));
    });
});

/*function playerCalc(curPlayer) {

 if (curPlayer == players.length - 1) {
 return communityCalc(0, 0)
 }

 if (!players[curPlayer].inPlay) {
 return playerCalc(curPlayer + 1);
 }

 if (players[curPlayer].cards[0] != null && players[curPlayer].cards[1] != null) {
 return playerCalc(curPlayer + 1);
 }

 var total = new Array(players.length).fill(0);
 var sum;

 if (players[curPlayer].cards[0] == null && players[curPlayer].cards[1] == null) {
 for (var i = 0; i < 52; i++) {
 if (deck[i].inPlay == false) {
 deck[i].inPlay = true;
 players[curPlayer].cards[0] = deck[i];
 for (var j = i + 1; j < 52; j++) {
 if (deck[j].inPlay == false) {
 deck[j].inPlay = true;
 players[curPlayer].cards[1] = deck[j];

 total =  sumArrays(total, playerCalc(curPlayer + 1));

 deck[j].inPlay = false;
 players[curPlayer].cards[0] = null;
 }
 }

 deck[i].inPlay = false;
 players[curPlayer].cards[0] = null;
 }
 }
 } else {

 var missing;
 if (players[curPlayer].cards[0] == null) {
 missing = 0;
 } else {
 missing = 1;
 }
 for (var i = 0; i < 52; i++) {
 if (deck[i].inPlay == false) {
 deck[i].inPlay = true;
 players[curPlayer].cards[missing] = deck[i];

 total =  sumArrays(total, playerCalc(curPlayer + 1));

 deck[i].inPlay = false;
 players[curPlayer].cards[missing] = null;
 }
 }


 }
 return total;
 }

 function communityCalc(curCard, counter) {

 if (community[curCard] == null) {
 var total = new Array(players.length).fill(0);

 for (var i = counter; i < 52; i++) {
 if (deck[i].inPlay == false) {
 community[curCard] = deck[i];
 deck[i].inPlay = true;

 if (curCard < 4) {
 total = sumArrays(total, communityCalc(curCard + 1, i + 1));
 } else {
 total[winner(players, community)] += 1;
 }
 deck[i].inPlay = false;
 community[curCard] = null;
 }

 }

 return total;

 } else {
 if (curCard < 4) {
 return communityCalc(curCard + 1, counter);
 } else {
 return new Array(players.length).fill(0)[winner(players, community)] ++;
 }
 }

 return -1;
 }*/

var order = new Array(15);

function handStrength(hand) {

    var straight = true;
    var flush = true;
    var i;

    var numbers = [];
    for (i = 0; i < 5; i ++) {
        numbers.push(hand[i].num);
    }
    numbers.sort(function(a, b){return a-b});

    for (i = 0; i < 3; i++) {
        if (numbers[i] + 1 != numbers[i + 1]) {
            straight = false;
        }
    }

    if (numbers[3] + 1 != numbers[4] && (numbers[0] != 2 || numbers[4] != 14)) {
        straight = false;
    }

    for (i = 0; i < 4; i++) {
        if (hand[i].suit != hand[i + 1].suit) {
            flush = false;
        }
    }

    if (straight == true) {
        if (flush == true) {
            return [8, numbers[4]];
        } else {
            return [4, numbers[4]];
        }
    }

    if (flush == true) {
        return [5, numbers[4], numbers[3], numbers[2], numbers[1], numbers[0]];
    }

    order.fill(0);

    for (i = 0; i <= 4; i++) {
        order[hand[i].num] += 1;
    }

    if (order.indexOf(4) != -1) {
        return [7, order.indexOf(4), order.lastIndexOf(1)];
    }

    if (order.indexOf(3) != -1) {
        if (order.indexOf(2) != -1) {
            return [6, order.indexOf(3), order.indexOf(2)];
        } else {
            return [3, order.indexOf(3), order.lastIndexOf(1), order.indexOf(1)];
        }
    }

    if (order.indexOf(2) != -1) {
        var lowerPair = order.indexOf(2);
        order[lowerPair] = 0;
        if (order.indexOf(2) != -1) {
            return [2, order.indexOf(2), lowerPair, order.indexOf(1)]
        } else {
            var lowest = order.indexOf(1);
            order[lowest] = 0;
            var lowest2 = order.indexOf(1);
            order[lowest2] = 0;
            var lowest3 = order.indexOf(1);
            order[lowest3] = 0;
            return [1, lowerPair, lowest3, lowest2, lowest];
        }

    }
    return [0, numbers[4], numbers[3], numbers[2], numbers[1], numbers[0]];


}

function sortHand (cards) {
    var numbers = [];

    for (i = 0; i < cards.length; i ++) {
        numbers.push(cards[i].num);
    }
    return numbers.sort(function(a, b){return b-a});
}

/*
 returns 1 if hand 1 is stronger than hand 2,
 or 2 if hand 2 is strong than hand 1.
 Returns -1 in case of tie.
 */
function betterHand(h1Strength, h2Strength) {

    for (var i = 0; i < h1Strength.length; i++) {
        if (h1Strength[i] > h2Strength[i]) {
            return 1;
        }
        if (h1Strength[i] < h2Strength[i]) {
            return 2;
        }
    }
    return 0;
}

/*
 given an array of cards, returns an array of
 the best hand.
 */
function bestHand (cards)  {
    var curBest = [-2];


    for (var i = 0; i < 6; i++) {
        for (var j = i + 1; j < 7; j++) {
            var hand = cards.slice(0, i).concat(cards.slice(i + 1));
            hand = hand.slice(0, j - 1).concat(hand.slice(j));
            var cur = handStrength(hand);
            if (betterHand(curBest, cur) == 2) {
                curBest = cur;
            }
        }
    }

    return curBest;
}

function checkStraight(cards) {
    var numbers = [];
    for (i = 0; i < cards.length; i ++) {
        numbers.push(cards[i].num);
    }
    numbers.sort(function(a, b){return a-b});

    if (numbers[numbers.length - 1] == 14) {
        numbers = [1].concat(numbers);
    }

    var straight = true,
        j;
    for (var i = cards.length - 1; i > 3; i--) {
        straight = true;
        j = i;
        while (straight && j >= 0) {
            if (numbers[j] - 1 != numbers[j - 1] && numbers[j] != numbers[j - 1]) {
                straight = false;
            }

            if (straight && i - j == 3) {
                return [true, numbers[i]];
            }

            j --;
        }
    }
    return [false]
}
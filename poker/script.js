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
}

var community = new Array(5).fill(randCard);

function sumArrays(array1, array2) {
    var total = new Array(array1.length);
    for (var i = 0; i < array1.length; i++){
        total.push(array1[i] + array2[i]);
    }
    return total;
}

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

var order = new Array(15)

/*
  Returns the strength of a given hand.
 */
function handStrength(hand) {

    var straight = true;
    var flush = true;
    var i;

    var numbers = new Array();
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
            return [8, hand[4].num];
        } else {
            return [4, hand[4].num];
        }
    }

    if (flush == true) {
        return [5, hand[4].num, hand[3].num, hand[2].num, hand[1].num, hand[0].num];
    }

    order.fill(0);

    for (i = 0; i <= 4; i++) {
        order[hand[i].num] += 1;
    }

    if (order.indexOf(4) != -1) {
        return [7, order.indexOf(4)];
    }

    if (order.indexOf(3) != -1) {
        if (order.indexOf(2) != -1) {
            return [6, order.indexOf(3)];
        } else {
            return [3, order.indexOf(3)];
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
    return -1;
}

/*
  given an array of cards, returns an array of
  the best hand.
 */
function bestHand (cards)  {
    var curBest = [-2];

    console.log(cards);

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

    console.log(curBest);
    return curBest;
}

function CalculateWinPercentage (trials) {
    var playersPlaying = [];
    var wins = 0;
    for (var i = 0; i < players.length; i++) {
        console.log(players[i]);
        players[i].inPlay ? playersPlaying.push( players[i] ) : null;
    }
    for (var i = 0; i < trials; i ++) {

        for (var r = 0; r < playersPlaying.length; r++) {

            !playersPlaying[r].cards[0].inPlay ? playersPlaying[r].cards[0] = randomCard() : null;
            !playersPlaying[r].cards[1].inPlay ? playersPlaying[r].cards[1] = randomCard() : null;
        }

        for (var r = 0; r < community.length; r++) {
            !community[r].inPlay ? community[r] = randomCard() : null;
        }

        var p1HandStrength = bestHand(players[0].cards.concat(community)),
            p1Wins = true,
            j = 1;
        while (p1Wins && j < playersPlaying.length) {
            betterHand(p1HandStrength, bestHand(players[j].cards.concat(community))) == 1 ? wins ++ : p1Wins = false;
            j++;
        }

     }

    for (var r = 0; r < playersPlaying.length; r++) {

        !playersPlaying[r].cards[0].inPlay ? playersPlaying[r].cards[0] = randCard : null;
        !playersPlaying[r].cards[1].inPlay ? playersPlaying[r].cards[1] = randCard : null;
    }

    for (var r = 0; r < community.length; r++) {
        !community[r].inPlay ? community[r] = randCard : null;
    }

    return wins / trials * 100;
}

function randomCard () {
    var randomCard = Math.floor(Math.random() * 52);
    while (deck[randomCard].inPlay) {
        var randomCard = Math.floor(Math.random() * 52);
    }
    return deck[randomCard];
}



$(document).ready(function() {
    var i, j;
    for (i = 0; i < suits.length; i++) {
        for (j = 0; j < symbols.length; j++) {
            var card = $('<div></div>');
            card.addClass(suits[i]  + " card " + i + j);
            //card.text(suits[i] + symbols[j]);
            card.data("card", "." + i + j);
            $("#" + suits[i]).append(card);
            var top = $("<div>" + symbols[j] + "</div>");
            var mid = $("<div>" + symbols[j] + "</div>");
            var bot = $("<div>" + symbols[j] + "</div>");

            top.addClass("top");
            mid.addClass("mid");
            bot.addClass("bot");

            $(card).append(top);
            $(card).append(mid);
            $(card).append(bot);
            if (j == 3 || j == 7) {
                var split = $("<div class=\"split\"></div>");
                $(card).after(split);
            }
        }
    }
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
            console.log(deck);
            console.log(cardIndex);
            var position = $(card).data("position");


            if (position.substring(2) == "player") {

                players[position.charAt(0)].cards[position.charAt(1)] = deck[cardIndex];
            } else {
                community[position.charAt(0)] = deck[cardIndex];
            }

            console.log(players[0]);
            console.log(community);
                
            playerSelect = false;
            cardSelect = false;
        }, 100);
    }
}

$(document).ready(function() {
    $(".calculate").on("click", "button", function() {
        $('.winrate').text(CalculateWinPercentage (10000));
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
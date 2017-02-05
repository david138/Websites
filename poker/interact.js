/**
 * Created by luked on 1/28/2017.
 */

var cardsInPlayCount = {};
for (var rank in ranks) {
    cardsInPlayCount[ranks[rank]] = 0;
}

for (var suit in suits) {
    cardsInPlayCount[suits[suit]] = 0;
}

$(document).ready(function() {

    var top = $("<div class = 'top'> <div class='rank'> </div> <div class='suit'> </div> </div>");
    var mid = $("<div class = 'mid rank'></div>");
    var bot = $("<div class = 'bot'> <div class='rank'> </div> <div class='suit'> </div> </div>");

    $('.card').append(top).append(mid).append(bot);

    for (var rank in ranks) {
        if (ranks[rank] <= 10) {
            $('.ranks').append('<p>' + ranks[rank] + '</p>');
        } else if (ranks[rank] == '11') {
            $('.broadways').append('<p>' + 'J' + '</p>');
        } else if (ranks[rank] == '12') {
            $('.broadways').append('<p>' + 'Q' + '</p>');
        } else if (ranks[rank] == '13') {
            $('.broadways').append('<p>' + 'K' + '</p>');
        } else if (ranks[rank] == '14') {
            $('.broadways').append('<p>' + 'A' + '</p>');
        } else {
            $('.broadways').append('<p>' + ranks[rank] + '</p>');
        }
    }

    for (var suit in suits) {
        $('.suits').append('<p>' + suits[suit] + '</p>');
    }

    $('.selectors').hide();

    for (var i = 1; i <= NUM_PLAYERS; i++) {
        if (i > INITIAL_PLAYERS) {
            $('#' + i).hide();
        }
    }

    updateCard("11c");
    updateCard("12c");
    updateCard("21c");
    updateCard("22c");
    updateCard("31c");
    updateCard("32c");
    updateCard("41c");
    updateCard("42c");
    updateCard("51c");
    updateCard("52c");
    updateCard("61c");
    updateCard("62c");

    updateCard("c1");
    updateCard("c2");
    updateCard("c3");
    updateCard("c4");
    updateCard("c5");


    function updateCard(code) {
        var rank = convertSymbol(getCard(code).num),
            suit = getCard(code).suit;


        $('#' + code).find('.rank').text(rank);
        $('#' + code).find('.suit').text(suit);
    }

    function getCard(code) {
        if(code[0] == 'c') {
            return community["card" + code[1]];
        } else {
            return players["player" + code[0]]["card" + code[1]];
        }
    }


    function addCard(rank, suit, removeType) {
        cardsInPlayCount[removeType] ++;
        if (rank != ranks.random && suit != ranks.random) {
            cardsInPlay[rank + suit] = true;
        }
    }

    function removeCard(rank, suit, removeType) {
        cardsInPlayCount[removeType] --;
        if (rank != ranks.random && suit != suits.random) {
            cardsInPlay[rank + suit] = false;
        }
    }

    function convertSymbol(symbol) {
        if (symbol == "11") {
            return "J";
        } else if (symbol == "12") {
            return "Q";
        } else if (symbol == "13") {
            return "K";
        } else if (symbol == "14") {
            return "A";
        } else if (symbol == "J") {
            return "11";
        } else if (symbol == "Q") {
            return "12";
        } else if (symbol == "K") {
            return "13";
        } else if (symbol == "A") {
            return "14";
        } else if (symbol == '♥') {
            return '&hearts;';
        } else if (symbol == '♣') {
            return '&clubs;';
        } else if (symbol == '♦') {
            return '&diams;';
        } else if (symbol == '♠') {
            return '&spades;';
        }
        return symbol;
    }

    function invalidChoice(choice) {
        var pos = 0;
        var id = setInterval(frame, 10);
        function frame() {
            if (pos == 20) {
                choice.css('background-color', 'hsl(330, 6%, 95%)');
                clearInterval(id);
            } else {
                pos++;
                choice.css('background-color', 'darkred');
            }
        }
    }


    $(document).on("click", ".add-player", function() {
        if (CURRENT_PLAYERS < NUM_PLAYERS) {
            CURRENT_PLAYERS ++;
            $('#' + CURRENT_PLAYERS).show();
            players["player" + CURRENT_PLAYERS].inPlay = true;
        }
    });

    $(document).on("click", ".remove-player", function() { //function doesnt work suits not being converted
        if (CURRENT_PLAYERS > INITIAL_PLAYERS) {
            players["player" + CURRENT_PLAYERS].inPlay = false;

            var rank, suit, code, card;

            $('#' + CURRENT_PLAYERS).find('.card').each(function() {
                rank = convertSymbol($(this).find('.rank').first().text());
                suit = $(this).find('.suit').first().text();
                code = $(this).data('card');
                card = getCard(code);

                removeCard(rank, suit, rank);
                removeCard(rank, suit, suit);
                addCard(ranks['random'], suits['random'], ranks['random']);
                addCard(ranks['random'], suits['random'], suits['random']);

                card.num = ranks['random'];
                card.suit = suits['random'];
                $(this).css('color', 'black');
                updateCard(code); //doesnt change the actual player PLayers[player] so the player still has the old rank and suit
            });

            $('#' + CURRENT_PLAYERS).hide();
            CURRENT_PLAYERS --;
        }
    });

    $("main").on("click", function() {
        $('.selectors').hide();
        $(".selected").removeClass("selected");
    });

    $('div').on("click", ".card", function() {
        $('.selectors').show();
        $(this).addClass('selected');
    });

    $('.ranks, .broadways').on("click", "p", function() {
        var rank = convertSymbol($(this).text()),
            visualCard = $('.selected'),
            code = visualCard.data('card'),
            card = getCard(code),
            oldRank = convertSymbol(visualCard.find('.rank').first().text()),
            oldSuit = visualCard.find('.suit').first().text();

        if (cardsInPlayCount[rank] >= 4 || cardsInPlay[rank + oldSuit] == true) {
            invalidChoice($(this));
            return;
        }

        addCard(rank, oldSuit, rank);
        removeCard(oldRank, oldSuit, oldRank);

        card.num = parseInt(rank);
        updateCard(code);

    });

    $('.suits').on("click", "p", function() {
        var suit = $(this).text(),
            visualCard = $('.selected'),
            code = visualCard.data('card'),
            card = getCard(code),
            oldRank = convertSymbol(visualCard.find('.rank').first().text()),
            oldSuit = visualCard.find('.suit').first().text();

        if (cardsInPlayCount[rank] >= 13 || cardsInPlay[oldRank + suit] == true) {
            invalidChoice($(this));
            return;
        }

        addCard(oldRank, suit, suit);
        removeCard(oldRank, oldSuit, oldSuit);

        card.suit = suit;
        updateCard(code);

        visualCard.css('color', $(this).css('color'));

    });

     $(".calculate").on("click", function() {

         var i, winRate, tieRate;

         for (i = 1; i <= CURRENT_PLAYERS; i++) {
             players['player' + i].winRate = 0;
             players['player' + i].tieRate = 0;
         }

         updateRates(.1, .1);

         setTimeout(function () {
             updateRates(.2, .1);
             setTimeout(function () {
                 updateRates(.3, .1);
                 setTimeout(function () {
                     updateRates(.4, .1);
                     setTimeout(function () {
                         updateRates(.5, .1);
                         setTimeout(function () {
                             updateRates(.6, .1);
                             setTimeout(function () {
                                 updateRates(.7, .1);
                                 setTimeout(function () {
                                     updateRates(.8, .1);
                                     setTimeout(function () {
                                         updateRates(.9, .1);
                                         setTimeout(function () {
                                             updateRates(1, .1);
                                         }, 200);
                                     }, 200);
                                 }, 200);
                             }, 200);
                         }, 200);
                     }, 200);
                 }, 200);
             }, 200);
         }, 200);
     });



    function updateRates(percentDone, percent) {
        calculateWinPercentages(ROUNDS * percent);
        for (var i = 1; i <= CURRENT_PLAYERS; i++) {

            $('#' + i).find('.winRate').text('Win %: ' +
                Math.round(players['player' + i].winRate / (ROUNDS * percentDone) * 10000) / 100);

            $('#' + i).find('.tieRate').text('Tie %: ' +
                Math.round(players['player' + i].tieRate / (ROUNDS * percentDone) * 10000) / 100);
        }
        $('#loadingBar').css('width', percentDone * 100 + '%');
    }


});
/**
 * This file contains the Jquery for the website, 
 * it acts as the middleman between the user and the calculator.
 */

$(document).ready(function() {

    /*
       Gives cards initial rank and suit.
     */
    var top = $("<div class = 'top'> <div class='rank'> </div> <div class='suit'> </div> </div>");
    var mid = $("<div class = 'mid rank'></div>");
    var bot = $("<div class = 'bot'> <div class='rank'> </div> <div class='suit'> </div> </div>");
    $('.card').append(top).append(mid).append(bot);
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

    /*
       Sets up initial selector panel, which displays when user selects a card.
     */
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


    /*
       Hides additional players.
     */
    for (var i = 1; i <= NUM_PLAYERS; i++) {
        if (i > INITIAL_PLAYERS) {
            $('#' + i).hide();
        }
    }

    /*
       Triggered when Add Player button is clicked,
       adds player.
     */
    $(document).on("click", ".add-player", function() {
        if (CURRENT_PLAYERS < NUM_PLAYERS) {
            CURRENT_PLAYERS ++;
            $('#' + CURRENT_PLAYERS).show();
            players["player" + CURRENT_PLAYERS].inPlay = true;
        }
    });

    /*
     Triggered when Remove Player button is clicked,
     removes player.
     */
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

    /*
       When background is clicked, the selected player is deselected
       and the selector panel hides.
     */
    $("main").on("click", function() {
        $('.selectors').hide();
        $(".selected").removeClass("selected");
    });

    /*
       When card is clicked, the card becomes selected
       and the selector panel displays.
     */
    $('div').on("click", ".card", function() {
        $('.selectors').show();
        $(this).addClass('selected');
    });

    /*
       When a rank is selected, the current card is updated with
       the new rank.
     */
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
        
        if (rank == ranks["random"]) {
            card.num = rank;
        } else {
            card.num = parseInt(rank);
        }
        updateCard(code);

    });

    /*
     When a suit is selected, the current card is updated with
     the new suit.
     */
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

    /*
       Runs the poker calculator when the calculate button is clicked.
     */
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

    /*
       Updates loading bar and winRate and tieRate of players.
     */
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

    /*
       Updates the information on cards visual cards.
     */
    function updateCard(code) {
        var rank = convertSymbol(getCard(code).num),
            suit = getCard(code).suit;


        $('#' + code).find('.rank').text(rank);
        $('#' + code).find('.suit').text(suit);
    }

    /*
       returns the card object represented by the given code.
     */
    function getCard(code) {
        if(code[0] == 'c') {
            return community["card" + code[1]];
        } else {
            return players["player" + code[0]]["card" + code[1]];
        }
    }

    /*
       Puts a given card in play.
     */
    function addCard(rank, suit, removeType) {
        cardsInPlayCount[removeType] ++;
        if (rank != ranks.random && suit != ranks.random) {
            cardsInPlay[rank + suit] = true;
        }
    }

    /*
       Removes a card from play.
     */
    function removeCard(rank, suit, removeType) {
        cardsInPlayCount[removeType] --;
        if (rank != ranks.random && suit != suits.random) {
            cardsInPlay[rank + suit] = false;
        }
    }

    /*
       Converts symbols from their text representation to their
       visual representation.
     */
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

    /*
       Queues that the given selection is invalid.
     */
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
});
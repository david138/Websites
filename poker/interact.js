/**
 * This file contains the Jquery for the website, 
 * it acts as the middleman between the user and the calculator.
 */

$(document).ready(function() {

    var INITIAL_PLAYERS = 1;
    var CURRENT_PLAYERS = INITIAL_PLAYERS;
    var MAX_PLAYERS = 5;
    var ITERATIONS = 5000;

    /*
       Gives cards initial rank and suit.
     */
    var top = $("<div class = 'top'> <div class='rank'> </div> <div class='suit'> </div> </div>");
    var mid = $("<div class = 'mid rank'></div>");
    var bot = $("<div class = 'bot'> <div class='rank'> </div> <div class='suit'> </div> </div>");
    $('.card').append(top).append(mid).append(bot);
    $('.card').find('.rank').text(convertSymbol(Rank.Unknown));
    $('.card').find('.suit').text(convertSymbol(Suit.Unknown));

    /*
       Sets up initial selector panel, which displays when user selects a card.
     */
    for (var rank in Rank) {
        if (Rank[rank] <= 10) {
            $('.ranks').append('<p>' + Rank[rank] + '</p>');
        } else {
            $('.broadways').append('<p>' + convertSymbol(Rank[rank]) + '</p>');
        }
    }
    for (var suit in Suit) {
        $('.suits').append('<p>' + convertSymbol(Suit[suit]) + '</p>');
    }
    $('.selectors').hide();


    /*
       Hides additional players.
     */
    for (var i = 0; i <= MAX_PLAYERS; i++) {
        if (i > INITIAL_PLAYERS) {
            $('#' + i).hide();
        }
    }

    /*
       Triggered when Add Player button is clicked,
       adds player.
     */
    $(document).on("click", ".add-player", function() {
        if (CURRENT_PLAYERS < MAX_PLAYERS) {
            CURRENT_PLAYERS++;
            $('#' + CURRENT_PLAYERS).show();
        }
    });

    /*
     Triggered when Remove Player button is clicked,
     removes player.
     */
    $(document).on("click", ".remove-player", function() {

        if (CURRENT_PLAYERS > INITIAL_PLAYERS) {
            $('#' + CURRENT_PLAYERS).find('.card').find('.rank').text(convertSymbol(Rank.Unknown));
            $('#' + CURRENT_PLAYERS).find('.card').find('.suit').text(convertSymbol(Suit.Unknown));
            $('#' + CURRENT_PLAYERS).find('.card').css('color', 'black').removeClass().addClass('card');
            $('#' + CURRENT_PLAYERS).hide();
            CURRENT_PLAYERS--;
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
        var $card = $('.selected'),
            oldRank = convertSymbol($card.find('.rank').first().text()),
            newRank = convertSymbol($(this).text()),
            suit = convertSymbol($card.find('.suit').first().text());

        if (newRank === Rank.Unknown) {
            $card.removeClass(oldRank).find('.rank').text('?');
        } else if ($('.' + newRank).length < 4 && $('.' + newRank + '.' + suit).length === 0) {
            $card.removeClass(oldRank).addClass(newRank).find('.rank').text($(this).text());
        } else {
            invalidChoice($(this));
        }
    });

    /*
     When a suit is selected, the current card is updated with
     the new suit.
     */
    $('.suits').on("click", "p", function() {
        var $card = $('.selected'),
            oldSuit = convertSymbol($card.find('.suit').first().text()),
            newSuit = convertSymbol($(this).text()),
            rank = convertSymbol($card.find('.rank').first().text());

        if (newSuit === Suit.Unknown) {
            $card.removeClass(oldSuit).find('.suit').text('?');
            $card.css('color', $(this).css('color'));
        } else if ($('.' + newSuit).length < 13 && $('.' + rank + '.' + newSuit).length === 0) {
            $card.removeClass(oldSuit).addClass(newSuit).find('.suit').text($(this).text());
            $card.css('color', $(this).css('color'));
        } else {
            invalidChoice($(this));
        }
    });

    /*
       Runs the poker calculator when the calculate button is clicked.
     */
     $(".calculate").on("click", function() {

         var board = new Board(), i, j, results = [], tempResults = [];

         for (i = 0; i <= CURRENT_PLAYERS; i++) {
             board.addPlayer();
             results.push({wins: 0, ties: 0});
             j = 0;
             $('#' + i).find('.card').each(function () {
                 board.setPlayerCard(i, j, convertSymbol($(this).find('.rank').first().text()),
                     convertSymbol($(this).find('.suit').first().text()));
                 j++;
             });
         }
         j = 0;
         $('.game-board').find('.card').each(function () {
             board.setCommunityCard(j, convertSymbol($(this).find('.rank').first().text()),
                 convertSymbol($(this).find('.suit').first().text()));
             j++;
         });

         var loadingBar = $('#loadingBar');
         var percentDone = 0;
         var id = setInterval(frame, 100);

         function frame() {
             if (percentDone === 100) {
                 clearInterval(id);
                 for (var i = 0; i <= CURRENT_PLAYERS; i++) {
                     $('#' + i).find('.winRate').text('Win %: ' + (results[i].wins / ITERATIONS * 10).toFixed(2));
                     $('#' + i).find('.tieRate').text('Tie %: ' + (results[i].ties / ITERATIONS * 10).toFixed(2));
                 }
             } else {
                 percentDone += 10;
                 loadingBar.css('width', percentDone + '%');
                 tempResults = getOddsPerPlayer(board, ITERATIONS);
                 for (i = 0; i < results.length; i++) {
                     results[i].wins += tempResults[i].wins;
                     results[i].ties += tempResults[i].ties;
                 }
             }
         }

     });

    /*
       Converts symbols from their text representation to their
       visual representation.
     */
    function convertSymbol(symbol) {
        if (symbol === 11) {
            return "J";
        } else if (symbol === 12) {
            return "Q";
        } else if (symbol === 13) {
            return "K";
        } else if (symbol === 14) {
            return "A";
        } else if (symbol === "J") {
            return "11";
        } else if (symbol === "Q") {
            return "12";
        } else if (symbol === "K") {
            return "13";
        } else if (symbol === "A") {
            return "14";
        } else if (symbol === Rank.Unknown) {
            return '?';
        } else if (symbol === '?') {
            return Rank.Unknown;
        } else if (symbol === Suit.Unknown) {
            return '?';
        } else if (symbol === '?') {
            return Suit.Unknown;
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
            if (pos === 20) {
                choice.css('background-color', '');
                clearInterval(id);
            } else {
                pos++;
                choice.css('background-color', 'darkred');
            }
        }
    }
});
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

        if (cardsInPlayCount[rank] >= 4) {
            return;
        }

        if (cardsInPlay[rank + oldSuit] == true) {
            return;
        }

        addCard(rank, oldSuit, rank);
        removeCard(oldRank, oldSuit, oldRank);

        card.num = rank;
        updateCard(code);

    });

    $('.suits').on("click", "p", function() {
        var suit = $(this).text(),
            visualCard = $('.selected'),
            code = visualCard.data('card'),
            card = getCard(code),
            oldRank = convertSymbol(visualCard.find('.rank').first().text()),
            oldSuit = visualCard.find('.suit').first().text();

        if (cardsInPlayCount[rank] >= 13) {
            return;
        }

        if (cardsInPlay[oldRank + suit] == true) {
            return;
        }

        addCard(oldRank, suit, suit);
        removeCard(oldRank, oldSuit, oldSuit);

        card.suit = suit;
        updateCard(code);

        visualCard.css('color', $(this).css('color'));

    });

     $(".calculate").on("click", function() {
         calculateWinPercentages();
        for (var i = 1; i <= CURRENT_PLAYERS; i++) {
            $('#' + i).find('.winRate').text('Win %: ' + players['player' + i].winRate);
            $('#' + i).find('.tieRate').text('Tie %: ' + players['player' + i].tieRate);
        }
     });


});

// var cardSelect = false,
//     playerSelect = false;
//
// $(document).ready(function() {
//     $(".cardGroup").on("click", ".card:not(.selected):not(.inPlay)", function() {
//         cardSelect = true;
//         $(".cardGroup").find(".selected").removeClass("selected");
//         $(this).addClass("selected");
//         if (playerSelect) {
//             var card = $(this);
//             var position = $("main").find(".selected");
//             if (position.data("card") != null) {
//                 removeCard($(".cardGroup").find(position.data("card")), position);
//             }
//             addCard(card, position);
//             cardSelect = false;
//             playerSelect = false;
//         }
//     });
// });
//
// $(document).ready(function() {
//     $(".cardGroup").on("click", ".selected:not(.inPlay)", function() {
//         cardSelect = false;
//         $(".selected").removeClass("selected");
//     });
// });
//
// $(document).ready(function() {
//     $("main").on("click", ".card:not(.selected)", function() {
//
//         if (playerSelect) {
//
//
//             var position,
//                 prevPosition,
//                 card = false,
//                 prevCard = false;
//
//             prevPosition = $("main").find(".selected");
//             if (prevPosition.data('card')) {
//                 prevCard = $('.cardRow').find(prevPosition.data('card'));
//                 removeCard(prevCard, prevPosition);
//             }
//
//             var position = $(this);
//             if (position.data('card')) {
//                 var card = $('.cardRow').find(position.data('card'));
//                 removeCard(card, position);
//             }
//
//             if (prevCard) {
//                 addCard(prevCard, position);
//             }
//             if (card) {
//                 addCard(card, prevPosition);
//             }
//
//             playerSelect = false;
//
//             if (!card && !prevCard) {
//                 $("main").find(".selected").removeClass("selected");
//                 $(this).addClass("selected");
//                 playerSelect = true;
//             }
//
//         } else {
//             playerSelect = true;
//             $("main").find(".selected").removeClass("selected");
//             $(this).addClass("selected");
//             if (cardSelect) {
//                 var position = $(this);
//                 if ($(this).data("card") != null) {
//                     removeCard($(".cardGroup").find($(this).data("card")), position);
//                 }
//                 addCard($(".cardGroup").find(".selected"), position);
//                 cardSelect = false;
//                 playerSelect = false;
//             }
//         }
//     });
// });
//
// $(document).ready(function() {
//     $("main").on("click", ".selected", function() {
//         playerSelect = false;
//         $(".selected").removeClass("selected");
//     });
// });
//
// function addCard(card, position) {
//
//     var inPlay = card.data("card"); //information of new card
//     var cardIndex = parseInt(inPlay.charAt(1) * 13) + parseInt(inPlay.substring(2)); // Index of new card in cards array
//     var positionData = position.data("position");
//
//     deck[cardIndex].inPlay = true;
//
//     card.removeClass("selected");
//     var cardClone = card.clone(true);
//     card.addClass("inPlay");
//     cardClone.css('width', $('.cardRow .card').css('width'));
//     cardClone.find('.remove').show()
//
//     cardClone.data("position", positionData);
//
//     position.replaceWith(cardClone);
//
//
//     if (positionData.substring(2) == "player") {
//         players[positionData.charAt(0)].cards[positionData.charAt(1)] = deck[cardIndex];
//     } else {
//         community[positionData.charAt(0)] = deck[cardIndex];
//     }
//
//
//     //position.css('width', $('.cardRow .card').css('width'));
//     cardClone.css('visibility', 'visible');
// }
//
// function removeCard(card, position) {
//
//     position.removeData("card");
//
//     position.removeClass();
//     position.addClass("card");
//
//     position.empty();
//
//
//     card.removeClass("inPlay");
//
//     var cardData = card.data("card"), //information of new card
//         cardIndex = parseInt(cardData.charAt(1) * 13) + parseInt(cardData.substring(2)),
//         positionData = position.data("position");
//
//     deck[cardIndex].inPlay = false;
//
//     if (positionData.substring(2) == "player") {
//         players[positionData.charAt(0)].cards[positionData.charAt(1)] = randCard;
//     } else {
//         community[positionData.charAt(0)] = randCard;
//     }
// }
//
// $(document).ready(function() {
//     $(".calculate").on("click", function() {
//         //$('.overlay').show();
//         //$('.loadingBar').show();
//         outcome = calculateWinPercentage (100000);
//         $('.winRate').text("Win: " + outcome[0] + "%");
//         $('.tieRate').text("Tie: " + outcome[1] + "%");
//         //  $('.overlay').hide();
//         //  $('.loadingBar').hide();
//     });
// });
//
// $(document).ready(function() {
//     $(document).on("click", ".card .remove", function() {
//         var position = $(this).parent();
//         if (position.hasClass('selected')) {
//             playerSelect = false;
//         }
//         removeCard($(".cardGroup").find(position.data("card")), position);
//
//     });
// });
(function() {
    // Define board and context
    var board = $("#board");
    var wrapper = $("#wrapper");
    var circles = $(".circle");
    var columns = $(".column");
    var messageBoard = $("#messageBoard");
    var messageInner = $("#message");
    var grid = [7, 6]; // 7 columns, 6 rows
    var cellsToConnect = 4;

    // Define colors
    var colorp0 = getRandomColor();
    var colorp1 = getRandomColor();

    var message, gameover, gametie, player;

    // Define event listeners
    messageBoard.on("click", resetGame);

    function switchPlayer() {
        player = player ? 0 : 1;
        // if (player == 0) {
        // columns.on("click", loop);
        // columns.on("mouseover", addHighlight);
        // columns.on("mouseout", removeHighlight);
        // } else {
        // columns.off("click", loop);
        // columns.off("mouseover", addHighlight);
        // columns.off("mouseout", removeHighlight);
        // loop();
        // }
    }

    // This function returns a random color (rgb) as a string
    function getRandomColor() {
        var rand = function() {
            return Math.floor(Math.random() * 256);
        };
        return `rgb(${rand()}, ${rand()}, ${rand()})`;
    }

    // This function takes a cell as a jQuery object as argument
    // and returns its row number as a number
    function getRowNumber(cellObj) {
        var rowNumAsString = cellObj[0].prop("classList")[1];
        var rowNumber = rowNumAsString.replace(/[^0-9]/gi, "");
        return parseInt(rowNumber);
    }

    // This function takes a column as a jQuery object as argument
    // and returns its column number as a number
    function getColNumber(colObj) {
        // checks to see if a cellObj has been parsed as argument.
        // if yes, then get the colObj for that cell.
        colObj = colObj.hasClass("slot") ? $(colObj[0].parentElement) : colObj;
        return parseInt(columns.index(colObj));
    }

    // This functions takes a column number and a row number as argument.
    // It finds the one cell that matches the col and row number and
    // returns it as a jQuery object.
    function getCell(colNum, rowNum) {
        var col = columns.eq(colNum);
        var cell = col.find(`.row${rowNum}`);
        return cell.eq(0);
    }

    // This fuction finds all the cells in a diagonal line
    // from left top to right bottom and returns them as a jQuery Object
    function getDiaCellsLeft(colNumber, rowNumber) {
        var sum = colNumber - rowNumber;
        var cells = $([]);
        for (var c = 0; c < grid[0]; c++) {
            for (var r = 0; r < grid[1]; r++) {
                if (c - r == sum) {
                    cells.push(getCell(c, r));
                }
            }
        }
        return cells;
    }

    // This fuction finds all the cells in a diagonal line
    // from right top to left bottom and returns them as a jQuery Object
    function getDiaCellsRight(colNumber, rowNumber) {
        var sum = colNumber + rowNumber;
        var cells = $([]);
        for (var c = sum >= grid[0] - 1 ? grid[0] - 1 : sum; c >= 0; c--) {
            for (var r = 0; r < grid[1]; r++) {
                if (c + r == sum) {
                    cells.push(getCell(c, r));
                }
            }
        }
        return cells;
    }

    // This function takes colNum as argument.
    // It checks the column the first available cell (legal move) and returns it as a jQuery object.
    // If no column number is provided, it checks all columns and returns all legal moves.
    function getLegalMoves(colNum) {
        var columnsToCheck =
            colNum === undefined ? columns : columns.eq(colNum);
        var legalMoves = $([]);
        $.each(columnsToCheck, function(i, col) {
            var cells = $.makeArray($(col).children()).reverse(); // convert to array and reverse the order
            $.each(cells, function(j, cell) {
                if (!$(cell).hasClass("p0") && !$(cell).hasClass("p1")) {
                    legalMoves.push($(cell));
                    return false; // break
                }
            });
        });
        return legalMoves;
    }

    // This function takes a columns number as argument.
    // It selects a cell, if a cell is available (legal move)
    function selectCell(colNum) {
        var cell = getLegalMoves(colNum); // object
        if (cell[0] !== undefined) {
            cell[0].addClass(`p${player}`);
            cell[0].removeClass("highlight");
        }
    }

    // This function pushes each selected cell into it's own cellArray
    // and returns the array as a jQuery object
    function fromColToArrCollection(collection) {
        var newCollection = $([]);
        $.each(collection, function(i, item) {
            newCollection.push($(item));
        });
        return newCollection;
    }

    function addHighlight(connectedCells = []) {
        if (connectedCells.length > 0) {
            $.each(connectedCells, function(i, item) {
                $(item).addClass("highlight");
            });
        } else {
            var colNum = columns.index($(event.currentTarget));
            var cell = getLegalMoves(colNum);
            if (cell[0] !== undefined) {
                cell[0].addClass("highlight");
            }
        }
    }

    function removeHighlight() {
        var colNum = columns.index($(event.currentTarget));
        var cell = getLegalMoves(colNum);
        if (cell[0] !== undefined) {
            cell[0].removeClass("highlight");
        }
    }

    function checkForTie() {
        $.each(columns, function(i) {
            var lastCell = getCell(i, 0);
            if (!lastCell.hasClass("p0") && !lastCell.hasClass("p1")) {
                return false;
            }
            gametie = true;
            gameover = true;
        });
    }

    function checkForMessage() {
        if (message.length > 0) {
            var color = player ? colorp0 : colorp1;
            messageInner.html(message.toUpperCase());
            messageInner.css({
                color: color
            });
            messageBoard.css({
                visibility: "visible"
            });
        }
    }

    function checkForConnection(checkThis) {
        var connections = [];
        OUTER: for (var m = 0; m < checkThis.length; m++) {
            for (var i = 0; i < checkThis[m].length; i++) {
                if (checkThis[m][i].hasClass(`p${player}`)) {
                    connections.push(checkThis[m][i]);
                    if (connections.length === cellsToConnect) {
                        break OUTER;
                    }
                } else {
                    connections = [];
                }
            }
        }
        return connections;
    }

    function resetGame() {
        // Remove all classes
        $(".p0").removeClass("p0");
        $(".p1").removeClass("p1");
        wrapper.removeClass("gameover");
        $(".highlight").removeClass("highlight");
        messageBoard.css({
            visibility: "hidden"
        });
        message = "";
        gameover = false;

        // Apply new bg-color
        circles.css({
            "border-color": getRandomColor()
        });

        // Randomly select the first player
        player = Math.floor(Math.random() * 2);

        // Apply event listeners
        columns.on("click", loop);
        columns.on("mouseover", addHighlight);
        columns.on("mouseout", removeHighlight);
    }

    function loop() {
        var colNum, rowNum;
        // Declare a constructor function as template for each Move

        // Get the selected column and row number
        colNum = getColNumber($(event.currentTarget));
        rowNum = getRowNumber(getLegalMoves(colNum));

        // select the cell
        selectCell(colNum);
        // Get four collections of cells, one for each direction that cells possibly are connected
        var colCells = fromColToArrCollection(columns.eq(colNum).children()); // cells in column
        var rowCells = fromColToArrCollection(board.find(`.row${rowNum}`));
        var diagCellsL = getDiaCellsLeft(colNum, rowNum); // cells diagonally from left to right
        var diagCellsR = getDiaCellsRight(colNum, rowNum); // cells diagonally from right to left
        // Add all four cell collections to a jQuery array
        var possibleConnectAllDirections = $([
            colCells,
            rowCells,
            diagCellsL,
            diagCellsR
        ]);

        // Check if they are actually connected
        var connect4 = checkForConnection(possibleConnectAllDirections);
        console.log(connect4);

        // check if game is over
        gameover = connect4.length == cellsToConnect ? true : false;
        // check if game is tie.
        checkForTie();
        if (gameover) {
            // Disable selection of cells
            columns.off("click", loop);
            // Add hightligt to connected winner cells
            addHighlight(connect4);
            // Add a gameover message
            message = gametie
                ? "It's a draw"
                : `Player${player}!<br/>winner winner<br />funky chicken dinner`;
            // Show funky chicken in the background
            wrapper.addClass("gameover");
            //Check for messages and display
            checkForMessage();
        } else {
            switchPlayer();
        }
    }

    resetGame();
})();

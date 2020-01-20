(function() {
  // Define board and context

  var COLOR_P0 = getRandomColor();
  var COLOR_P1 = getRandomColor();
  var MESSAGE_WRAPPER = $("#message-wrapper");
  var MESSAGE_INNER = $("#message");
  var BOARD_WRAPPER = $("#board-wrapper");
  var BOARD = $("#board");
  var TITLE = $("#title");
  var NEW_GAME = $("#new-game");

  var initialState = {
    colCount: $("#col-count"),
    colMinus: $("#col-minus"),
    colPlus: $("#col-plus"),
    circles: $(".circle"),
    columns: $(".column"),
    grid: {
      col: parseInt($("#col-count")[0].innerHTML),
      row: 6
    },
    cellsToConnect: 4,
    player: Math.floor(Math.random() * 2),
    gameover: false,
    gametie: false,
    message: null
  };

  state = {
    ...initialState,
    cellsToConnect: initialState.cellsToConnect,
    columns: $(".column")
  };

  function generateBoard() {
    var html = "";
    for (let i = 0; i < state.grid.col; i++) {
      html += `<div class="column col${i}"">`;
      let innerHtml = "";
      for (let c = 0; c < state.grid.row; c++) {
        innerHtml += `<div class="slot row${c}"><div class="circle"></div></div>`;
      }
      html += `${innerHtml}</div>`;
    }
    BOARD[0].innerHTML = html;
    TITLE[0].innerHTML = `Connect${state.cellsToConnect}`;
    resetGame();
  }

  // Define event listeners
  MESSAGE_WRAPPER.on("click", resetGame);
  NEW_GAME.on("click", resetGame);
  state.colMinus.on("click", removeRowFromBoard);
  state.colPlus.on("click", addRowToBoard);

  state.columns.on("click.loop", loop.bind(null, state));
  state.columns.on("mouseover.addHighlight", addHighlight);
  state.columns.on("mouseout.removeHighlight", removeHighlight);

  function switchPlayer() {
    state.player = state.player ? 0 : 1;
  }

  function addRowToBoard() {
    var updatedColCount = parseInt(state.colCount[0].innerHTML) + 1;
    var updatedCellsToConnect = state.cellsToConnect + 1;
    state.colCount[0].innerHTML = updatedColCount;
    state.cellsToConnect = updatedColCount;
    state = {
      ...state,
      grid: { ...state.grid, col: updatedColCount },
      cellsToConnect: updatedCellsToConnect
    };
    generateBoard();
  }

  function removeRowFromBoard() {
    if (state.cellsToConnect > 2) {
      var updatedColCount = parseInt(state.colCount[0].innerHTML) - 1;
      var updatedCellsToConnect = state.cellsToConnect - 1;
      state.colCount[0].innerHTML = updatedColCount;
      state.cellsToConnect = updatedColCount;
      state = {
        ...state,
        grid: { ...state.grid, col: updatedColCount },
        cellsToConnect: updatedCellsToConnect
      };
      generateBoard();
    }
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
    if (cellObj[0]) {
      var rowNumAsString = cellObj[0].prop("classList")[1];
      var rowNumber = rowNumAsString.replace(/[^0-9]/gi, "");
      return parseInt(rowNumber);
    }
  }

  // This function takes a column as a jQuery object as argument
  // and returns its column number as a number
  function getColNumber(colObj) {
    // checks to see if a cellObj has been parsed as argument.
    // if yes, then get the colObj for that cell.
    colObj = colObj.hasClass("slot") ? $(colObj[0].parentElement) : colObj;
    return parseInt(state.columns.index(colObj));
  }

  // This functions takes a column number and a row number as argument.
  // It finds the one cell that matches the col and row number and
  // returns it as a jQuery object.
  function getCell(colNum, rowNum) {
    var col = state.columns.eq(colNum);
    var cell = col.find(`.row${rowNum}`);
    return cell.eq(0);
  }

  // This fuction finds all the cells in a diagonal line
  // from left top to right bottom and returns them as a jQuery Object
  function getDiaCellsLeft(colNumber, rowNumber) {
    var sum = colNumber - rowNumber;
    var cells = $([]);
    for (var c = 0; c < state.grid.col; c++) {
      for (var r = 0; r < state.grid.row; r++) {
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
    for (
      var c = sum >= state.grid.col - 1 ? state.grid.col - 1 : sum;
      c >= 0;
      c--
    ) {
      for (var r = 0; r < state.grid.row; r++) {
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
      colNum === undefined ? state.columns : state.columns.eq(colNum);
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
      cell[0].addClass(`p${state.player}`);
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
      var colNum = state.columns.index($(event.currentTarget));
      var cell = getLegalMoves(colNum);
      if (cell[0] !== undefined) {
        cell[0].addClass("highlight");
      }
    }
  }

  function removeHighlight() {
    var colNum = state.columns.index($(event.currentTarget));
    var cell = getLegalMoves(colNum);
    if (cell[0] !== undefined) {
      cell[0].removeClass("highlight");
    }
  }

  function checkForTie() {
    $.each(state.columns, function(i) {
      var lastCell = getCell(i, 0);
      if (!lastCell.hasClass("p0") && !lastCell.hasClass("p1")) {
        return false;
      }
      state.gametie = true;
      state.gameover = true;
    });
  }

  function displayMessage() {
    // Add a gameover message
    state.message = state.gametie
      ? "It's a draw"
      : `Player${state.player}!<br/>winner winner<br />funky chicken dinner`;
    MESSAGE_INNER.html(state.message.toUpperCase());
    MESSAGE_INNER.css({ color: state.player ? COLOR_P0 : COLOR_P1 });
    MESSAGE_WRAPPER.css({ visibility: "visible" });
    // Show funky chicken in the background
    BOARD_WRAPPER.addClass("gameover");
  }

  function checkForConnection(checkThis) {
    console.log("checkThis", checkThis);
    OUTER: for (var m = 0; m < checkThis.length; m++) {
      var connections = [];
      for (var i = 0; i < checkThis[m].length; i++) {
        if (
          checkThis[m][i].hasClass(`p${state.player}`) &&
          $.inArray(checkThis[m][i], connections) === -1
        ) {
          connections.push(checkThis[m][i]);
          if (connections.length === state.cellsToConnect) {
            break OUTER;
          }
        } else {
          connections = [];
        }
      }
    }
    console.log("[checkForConnection.js], connections", connections);
    return connections;
  }

  function resetGame() {
    // Remove all classes
    $(".p0").removeClass("p0");
    $(".p1").removeClass("p1");
    $(".highlight").removeClass("highlight");
    BOARD_WRAPPER.removeClass("gameover");
    MESSAGE_WRAPPER.css({ visibility: "hidden" });

    // Clean up
    state.columns.off(".loop");
    state.columns.off(".addHighlight");
    state.columns.off(".removeHighlight");

    state = {
      ...initialState,
      cellsToConnect: state.cellsToConnect,
      grid: state.grid,
      columns: $(".column")
    };

    // Add event listeners
    state.columns.on("click.loop", loop.bind(null, state));
    state.columns.on("mouseover.addHighlight", addHighlight);
    state.columns.on("mouseout.removeHighlight", removeHighlight);
  }

  function loop(state) {
    // Get the selected column and row number
    var colNum = getColNumber($(event.currentTarget));
    var rowNum = getRowNumber(getLegalMoves(colNum));
    // select the cell
    selectCell(colNum);
    // Get four collections of cells, one for each direction that cells possibly are connected
    var colCells = fromColToArrCollection(state.columns.eq(colNum).children()); // cells in column
    var rowCells = fromColToArrCollection(BOARD.find(`.row${rowNum}`));
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
    // console.log(connect4);

    // check if game is over
    state.gameover = connect4.length == state.cellsToConnect ? true : false;
    // check if game is tie.
    checkForTie();
    // Clean up
    state.columns.off(".loop");
    state.columns.off(".addHighlight");
    state.columns.off(".removeHighlight");

    if (state.gameover) {
      // Add hightligt to connected winner cells
      addHighlight(connect4);
      // Display gameover message
      displayMessage();
    } else {
      state.columns.on("click.loop", loop.bind(null, state));
      state.columns.on("mouseover.addHighlight", addHighlight);
      state.columns.on("mouseout.removeHighlight", removeHighlight);
      switchPlayer();
    }
  }
})();

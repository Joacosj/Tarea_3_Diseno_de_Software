(function () {
  var state = {
    players: {
      player1: { name: 'Jugador 1', mark: 'X' },
      player2: { name: 'Jugador 2', mark: 'O' },
    },
    formValues: {
      player1Name: 'Jugador 1',
      player2Name: 'Jugador 2',
      player1Mark: 'X',
      player2Mark: 'O',
    },
    configError: '',
    history: [Array(9).fill(null)],
    currentMove: 0,
  };

  function calculateWinner(squares) {
    var lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (var i = 0; i < lines.length; i += 1) {
      var a = lines[i][0];
      var b = lines[i][1];
      var c = lines[i][2];

      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return null;
  }

  function createElement(tag, options) {
    var element = document.createElement(tag);
    var opts = options || {};

    if (opts.className) {
      element.className = opts.className;
    }

    if (opts.text) {
      element.textContent = opts.text;
    }

    if (opts.attrs) {
      Object.keys(opts.attrs).forEach(function (key) {
        element.setAttribute(key, opts.attrs[key]);
      });
    }

    if (opts.onClick) {
      element.addEventListener('click', opts.onClick);
    }

    if (opts.onInput) {
      element.addEventListener('input', opts.onInput);
    }

    return element;
  }

  function getCurrentPlayer() {
    var xIsNext = state.currentMove % 2 === 0;
    return xIsNext ? state.players.player1 : state.players.player2;
  }

  function getCurrentSquares() {
    return state.history[state.currentMove];
  }

  function getStatusText() {
    var squares = getCurrentSquares();
    var winner = calculateWinner(squares);

    if (winner) {
      var winnerName = winner === state.players.player1.mark ? state.players.player1.name : state.players.player2.name;
      return 'Ganador: ' + winnerName + ' (' + winner + ')';
    }

    if (squares.every(function (square) { return square !== null; })) {
      return 'Empate';
    }

    var currentPlayer = getCurrentPlayer();
    return 'Turno de: ' + currentPlayer.name + ' (' + currentPlayer.mark + ')';
  }

  function handleSquareClick(index) {
    var squares = getCurrentSquares();

    if (calculateWinner(squares) || squares[index]) {
      return;
    }

    var nextSquares = squares.slice();
    nextSquares[index] = getCurrentPlayer().mark;

    var nextHistory = state.history.slice(0, state.currentMove + 1);
    nextHistory.push(nextSquares);
    state.history = nextHistory;
    state.currentMove = nextHistory.length - 1;

    render();
  }

  function jumpTo(move) {
    state.currentMove = move;
    render();
  }

  function handleConfigInputChange(event) {
    var name = event.target.name;
    var value = event.target.value;
    state.formValues[name] = value;
  }

  function handleApplyConfiguration(event) {
    event.preventDefault();

    var nextPlayer1Name = state.formValues.player1Name.trim() || 'Jugador 1';
    var nextPlayer2Name = state.formValues.player2Name.trim() || 'Jugador 2';
    var nextPlayer1Mark = state.formValues.player1Mark.trim();
    var nextPlayer2Mark = state.formValues.player2Mark.trim();

    if (!nextPlayer1Mark || !nextPlayer2Mark) {
      state.configError = 'Debes ingresar simbolos para ambos jugadores.';
      render();
      return;
    }

    if (nextPlayer1Mark.length !== 1 || nextPlayer2Mark.length !== 1) {
      state.configError = 'Cada simbolo debe tener exactamente 1 caracter.';
      render();
      return;
    }

    if (nextPlayer1Mark === nextPlayer2Mark) {
      state.configError = 'Los simbolos deben ser distintos.';
      render();
      return;
    }

    state.configError = '';
    state.players = {
      player1: { name: nextPlayer1Name, mark: nextPlayer1Mark },
      player2: { name: nextPlayer2Name, mark: nextPlayer2Mark },
    };

    // Reinicia la partida para no mezclar simbolos antiguos y nuevos.
    state.history = [Array(9).fill(null)];
    state.currentMove = 0;

    render();
  }

  function createConfigForm() {
    var form = createElement('form', { className: 'game-config' });
    form.addEventListener('submit', handleApplyConfiguration);

    function addInputRow(labelText, id, name, type, maxLength) {
      var row = createElement('div');
      var label = createElement('label', { text: labelText, attrs: { for: id } });
      var inputAttrs = { id: id, name: name, type: type };

      if (maxLength) {
        inputAttrs.maxlength = String(maxLength);
      }

      var input = createElement('input', {
        attrs: inputAttrs,
        onInput: handleConfigInputChange,
      });
      input.value = state.formValues[name];

      row.appendChild(label);
      row.appendChild(input);
      form.appendChild(row);
    }

    addInputRow('Nombre jugador 1', 'player1Name', 'player1Name', 'text');
    addInputRow('Simbolo jugador 1', 'player1Mark', 'player1Mark', 'text', 1);
    addInputRow('Nombre jugador 2', 'player2Name', 'player2Name', 'text');
    addInputRow('Simbolo jugador 2', 'player2Mark', 'player2Mark', 'text', 1);

    form.appendChild(createElement('button', { text: 'Aplicar configuracion', attrs: { type: 'submit' } }));

    if (state.configError) {
      form.appendChild(createElement('p', { text: state.configError }));
    }

    return form;
  }

  function createBoard() {
    var board = createElement('div');
    var status = createElement('div', { className: 'status', text: getStatusText() });
    board.appendChild(status);

    var squares = getCurrentSquares();
    for (var row = 0; row < 3; row += 1) {
      var rowElement = createElement('div', { className: 'board-row' });

      for (var col = 0; col < 3; col += 1) {
        var index = row * 3 + col;
        var square = createElement('button', {
          className: 'square',
          text: squares[index] || '',
          onClick: (function (i) {
            return function () {
              handleSquareClick(i);
            };
          })(index),
        });
        rowElement.appendChild(square);
      }

      board.appendChild(rowElement);
    }

    return board;
  }

  function createMovesList() {
    var info = createElement('div', { className: 'game-info' });
    var list = createElement('ol');

    state.history.forEach(function (_squares, move) {
      var description = move > 0 ? 'Ir a movimiento #' + move : 'Ir al inicio';
      var item = createElement('li');
      var button = createElement('button', {
        text: description,
        onClick: function () {
          jumpTo(move);
        },
      });

      item.appendChild(button);
      list.appendChild(item);
    });

    info.appendChild(list);
    return info;
  }

  function ensureRoot() {
    var existingRoot = document.getElementById('gato-2p-app');
    if (existingRoot) {
      return existingRoot;
    }

    var root = createElement('div', { attrs: { id: 'gato-2p-app' } });
    document.body.appendChild(root);
    return root;
  }

  function render() {
    var root = ensureRoot();
    root.innerHTML = '';

    var game = createElement('div', { className: 'game' });
    var gameBoard = createElement('div', { className: 'game-board' });
    gameBoard.appendChild(createConfigForm());
    gameBoard.appendChild(createBoard());

    game.appendChild(gameBoard);
    game.appendChild(createMovesList());
    root.appendChild(game);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();

import React, { Component } from "react";
import Bacon from "baconjs";
import R from "ramda";
import Vector from "./Vector";
import PacMan from "./PacMan";
import Board from "./Board";

export default class App extends Component {
  state = {
    gridResponse: {},
    collectibles: []
  };

  fetchGameState(gameId) {
    return fetch("/backend/games/" + gameId).then(response => response.json());
  }

  fetchCollectibles(gameId) {
    return fetch("/collectibles/" + gameId).then(response => response.json());
  }

  changeDirection(gameId) {
    return dir =>
      fetch("/backend/games/" + gameId + "/direction", {
        body: JSON.stringify({ newDirection: dir }),
        headers: {
          "content-type": "application/json"
        },
        method: "PUT"
      });
  }

  startGame(gameId) {
    const ticks = Bacon.interval(101);

    const keys = Bacon.fromEvent(document.body, "keyup").map(".keyCode");
    const lefts = keys.filter(key => key === 37);
    const ups = keys.filter(key => key === 38);
    const rights = keys.filter(key => key === 39);
    const downs = keys.filter(key => key === 40);

    lefts.map(() => "west").onValue(this.changeDirection(gameId));
    ups.map(() => "north").onValue(this.changeDirection(gameId));
    rights.map(() => "east").onValue(this.changeDirection(gameId));
    downs.map(() => "south").onValue(this.changeDirection(gameId));

    ticks.flatMap(x => Bacon.fromPromise(this.fetchGameState(gameId))).onValue(pacManResponse => {
      this.setState({ pacMan: pacManResponse.pacMan });
    });

    ticks.flatMap(x => Bacon.fromPromise(this.fetchCollectibles(gameId))).onValue(collectibles => {
      this.setState({ collectibles: collectibles });
    });
  }

  componentDidMount() {
    fetch("/backend/grids/small")
      .then(response => response.json())
      .then(
        function(response) {
          this.setState({ gridResponse: response, pacMan: response.grid.initialPacMan });
        }.bind(this)
      );
    fetch("/backend/games", {
      body: JSON.stringify({ gridName: "small" }),
      headers: {
        "content-type": "application/json"
      },
      method: "POST"
    })
      .then(response => response.json())
      .then(
        function(response) {
          this.startGame(response.gameId);
        }.bind(this)
      );
  }
  render() {
    if (R.isEmpty(this.state.gridResponse)) return <div>Starting a new game...</div>;
    else {
      const { width, height, usableCells } = this.state.gridResponse.grid;
      const { position, direction } = this.state.pacMan;
      return (
        <Board
          size={new Vector(width, height)}
          pacMan={new PacMan(new Vector(position.x, position.y), direction)}
          usableCells={R.map(cell => new Vector(cell.x, cell.y), usableCells)}
          dotCells={R.map(cell => new Vector(cell.x, cell.y), this.state.collectibles)}
        />
      );
    }
  }
}

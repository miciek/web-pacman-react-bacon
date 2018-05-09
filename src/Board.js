import React, { Component, PropTypes } from "react";
import R from "ramda";
import classNames from "classnames";
import Vector from "./Vector";
import PacMan from "./PacMan";
import "./Board.css";

export default class Board extends Component {
  static propTypes = {
    size: PropTypes.instanceOf(Vector).isRequired,
    pacMan: PropTypes.instanceOf(PacMan),
    usableCells: PropTypes.arrayOf(PropTypes.instanceOf(Vector)).isRequired
  };

  render() {
    const { size, pacMan, usableCells } = this.props;
    const rows = R.range(0, size.y).map(y => {
      const cells = R.range(0, size.x).map(x => {
        const pos = new Vector(x, y);
        const maybePacManStyle = {
          pacman: !R.isNil(pacMan) && pacMan.pos.equals(pos)
        };
        const maybeWallStyle = { wall: R.isNil(R.find(cell => cell.equals(pos))(usableCells)) };
        return <div key={x} className={classNames("cell", maybePacManStyle, maybeWallStyle)} />;
      });
      return (
        <div key={y} className="row">
          {cells}
        </div>
      );
    });

    return <div className="board">{rows}</div>;
  }
}

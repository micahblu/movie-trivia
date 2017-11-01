import React from 'react';

export default class GameControl extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    var label= '';
    if(this.props.winnerDeclared) {
      label = 'Play again';
    } else if(this.props.isActive) {
      label = 'Quit game';
    } else {
      label = 'Start game';
    }
    return <button className='game-control' onClick={this.props.toggleGame}>{label}</button>
  }
}

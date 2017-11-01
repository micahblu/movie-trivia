import React from 'react';

export default class PlayerScore extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    return <span>Player {this.props.id} <strong>{this.props.score}</strong></span>;
  }
}

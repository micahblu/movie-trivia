import React from 'react';
import GameControl from './game-control';
import PlayerScore from './player-score';
import mdb from './api-key'

export default class Game extends React.Component {
  constructor(props) {
    super(props);
    const player = {
      id: 0,
      score: 0
    };

    this.state = {
      players: [{
        id: 1,
        score: 0
      },{
        id: 2,
        score: 0
      }],
      movies: [],
      movie: {
        overview: '',
        title: ''
      },
      prevMovie: {},
      answer: '',
      isCorrect: null,
      answerSubmitted: false,
      isActive: false,
      gameLoading: false,
      currentPlayer: 0,
      winner: undefined
    };

    this.toggleGame = this.toggleGame.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.loadMovies = this.loadMovies.bind(this);
    this.loadNextMovie = this.loadNextMovie.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  loadMovies() {
    var query = 'sort_by=popularity.desc';

    var request = new Request('https://api.themoviedb.org/3/discover/movie?api_key=' + mdb.key + '&' + query, {
      method: 'get',
    	headers: new Headers({
    		'Content-Type': 'text/plain',
        'Accept': 'application/json'
    	})
    });
    var self = this;
    fetch(request).then(function(response) {
      response.json().then(function(data) {
        var movies = data.results;
        if(movies.length % 2 !== 0) {
          // odd number of movies remove one
          movies.pop();
        }
        self.setState({
          movies: movies,
          gameLoading: false,
          movie: movies.shift()
        });
      });
    }).catch(function(err) {
    	// Error :(
    });
  }

  handleChange(event) {
    this.setState({answer: event.target.value});
  }

  componentDidUpdate() {
    //console.log('New state', this.state);
    this.successSound = document.getElementById('successSound');
    this.errorSound = document.getElementById('errorSound');
  }

  loadNextMovie() {
    this.setState((prevState) => {
      return {
        movie: prevState.movies.shift(),
        movies: prevState.movies
      };
    });
  }

  toggleGame(e) {
    if(this.state.winner) {
      // reset game
      this.setState((prevState) => ({
        winner: undefined,
        players: prevState.players.map((player, index) => ({
          id: index+1,
          score: 0
        })),
        currentPlayer: 0
      }));
    }
    var isActive = !this.state.isActive;
    this.setState((prevState) => {
      return {
        isActive: isActive
      };
    });
    if(isActive) {
      // Start the game
      this.loadMovies();
    }
  }

  declareWinner() {
    if(this.state.players[0].score === this.state.players[1].score) {
      this.setState({
        winner: 'tie',
        isActive: false
      });
    } else {
      var sortedPlayers = this.state.players.sort((a, b) => {
        return a.score < b.score
      });
  
      this.setState({
        winner: sortedPlayers[0].id,
        isActive: false
      });
    }
  }

  handleSubmit(e) {
    var self = this;
    var cb = function() {
      if (self.state.movies.length === 0) {
        self.declareWinner();
      } else {
        self.setState({
          answer: '',
          answerSubmitted: true,
          prevMovie: self.state.movie
        });
  
        setTimeout(function () {
          self.setState({
            answerSubmitted: false
          });
        }, 3500);
  
        self.loadNextMovie();
      }
    }
    // Don't require an exact match.
    var answer = this.state.answer.toLocaleLowerCase().trim();
    if ( answer !== '' && this.state.movie.title.toLowerCase().includes(answer)) {

      this.setState((prevState) => {
        return {
          players: prevState.players.map((player, index) => {
            if(index === prevState.currentPlayer) {
              return Object.assign(player, {
                score: player.score += 100
              });
            } else {
              return player;
            }
          }),
          currentPlayer: (prevState.players[prevState.currentPlayer + 1] ? prevState.currentPlayer + 1 : 0),
          isCorrect: true
        };
      }, function() {
        cb();
      });
      this.successSound.play();
    } else {
      this.setState((prevState) => {
        return {
          players: prevState.players.map((player, index) => {
            if(index === prevState.currentPlayer) {
              return Object.assign(player, {
                score: player.score -= 100
              });
            } else {
              return player;
            }
          }),
          currentPlayer: (prevState.players[prevState.currentPlayer + 1] ? prevState.currentPlayer + 1 : 0),
          isCorrect: false
        };
      }, function() {
        cb();
      });
      this.errorSound.play();
    }

    e.preventDefault();
  }

  render() {
    var winner;
    if(this.state.winner === "tie") {
      winner = <h3>Its a tie!</h3>
    } else {
      winner = <h3>Player {this.state.winner} wins!</h3>
    }
    return (
      <div className='game'>
        <div className='main'>
          <div style={{display: this.state.gameLoading ? 'block' : 'none'}}>
            <h2>Game loading :)</h2>
          </div>
          <header>
            <div className="title">
              <h1 className='game-title'>Movie Trivia</h1>
            </div>
            <div className="scores" style={{display: this.state.isActive ? 'block' : 'none'}}>
              <PlayerScore id={this.state.players[0].id} score={this.state.players[0].score} />
              <PlayerScore id={this.state.players[1].id} score={this.state.players[1].score} />
            </div>
          </header>

          <div className='winner-label' style={{display: this.state.winner ? 'block' : 'none'}}>
            { winner }
          </div>

          <section style={{display: this.state.isActive ? 'block' : 'none'}}>
            <div style={{display: this.state.answerSubmitted ? 'block' : 'none'}}>
              <div style={{ display: this.state.isCorrect ? 'block' : 'none' }} className="correct-answer-msg">Correct! <strong>&quot;{this.state.prevMovie.title}&quot;</strong></div>
              <div style={{display: this.state.isCorrect ? 'none' : 'block'}} className="incorrect-answer-msg">Incorrect :( The answer was <strong>&quot;{this.state.prevMovie.title}&quot;</strong></div>
            </div>
            <p className='player-turn'>Player {this.state.players[this.state.currentPlayer].id}&apos;s turn</p>
            <p className='movie-count'>Movies to go: <strong>{this.state.movies.length}</strong></p>
            <div style={{display: this.state.winner ? 'none' : 'block'}}>
              <h2>Movie plot:</h2>
              <p>{this.state.movie.overview}</p>
              <form onSubmit={this.handleSubmit} disabled={this.state.answerSubmitted ? false : true}>
                <label>
                  Answer: <input type="text" value={this.state.answer} onChange={this.handleChange} />
                </label>
                <input disabled={this.state.winner ? true : false} type="submit" value="Submit" />
              </form>
            </div>
          </section>

          <audio src="./src/successfull.mp3" preload="auto" id="successSound"></audio>
          <audio src="./src/error.mp3" preload="auto" id="errorSound"></audio>
          <footer>
            <GameControl winnerDeclared={this.state.winner ? true : false} isActive={this.state.isActive} toggleGame={this.toggleGame} />
          </footer>
        </div>
      </div>
    );
  }
}

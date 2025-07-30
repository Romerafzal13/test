import React, { useState, useEffect } from 'react';
import Leaderboard from './leaderboard';
const API_BASE = 'http://localhost:5000/api';

function Quiz() {
  const [mode, setMode] = useState(null);
  const [quizPairs, setQuizPairs] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [continentInput, setContinentInput] = useState('');
  const [askContinent, setAskContinent] = useState(false);
  const [username, setUsername] = useState('');
  const [askUsername, setAskUsername] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const isQuizDone = quizPairs.length > 0 && index >= quizPairs.length;
    if (isQuizDone && !scoreSaved) {
      const sendScore = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: username || 'Anonymous',
              mode,
              continent: continentInput.trim() || 'All',
              score,
              total: quizPairs.length
            })
          });
          const result = await response.json();
          console.log('Score saved:', result);
          setScoreSaved(true);
        } catch (err) {
          console.error('Error saving score:', err);
        }
      };
      sendScore();
    }
  }, [index, quizPairs.length, scoreSaved, username, mode, continentInput, score]);

  // Ask for username after mode selection
  const handleModeSelect = (selectedMode) => {
    setMode(selectedMode);
    setAskUsername(true);
    setScore(0);
    setIndex(0);
    setFeedback('');
    setUserAnswer('');
    setAskContinent(false);
    setContinentInput('');
    setScoreSaved(false);
    setQuizPairs([]);
  };

  // After username is entered, fetch quiz data
  const handleUsernameSubmit = () => {
    setAskUsername(false);
    if (mode === 2) {
      setAskContinent(true);
    } else {
      fetchQuizData(1);
    }
  };

  const fetchQuizData = async (modeSelected, continent = '') => {
    setLoading(true);
    setScore(0);
    setIndex(0);
    setFeedback('');
    setUserAnswer('');
    setAskContinent(false);
    setContinentInput(continent || '');
    setScoreSaved(false);

    let url = modeSelected === 1 ? `${API_BASE}/mode1` : `${API_BASE}/mode2`;
    if (continent) {
      url += `?continent=${continent}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const err = await response.json();
        alert(err.message);
        setMode(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setQuizPairs(data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitContinent = () => {
    setAskContinent(false);
    fetchQuizData(2, continentInput.trim());
  };

  const checkAnswer = () => {
    if (!quizPairs.length || index >= quizPairs.length) return;

    const current = quizPairs[index];
    const answer = userAnswer.trim().toLowerCase();

    if (mode === 1) {
      if (answer === current.country.toLowerCase()) {
        setScore(prev => prev + 1);
        setFeedback('Correct!');
      } else {
        setFeedback(`Incorrect! The correct answer was '${current.country}'`);
      }
    } else if (mode === 2) {
      if (answer === current.capital.toLowerCase()) {
        setScore(prev => prev + 1);
        setFeedback('Correct!');
      } else {
        setFeedback(`Incorrect! The capital of '${current.country}' is '${current.capital}'`);
      }
    }
    setIndex(prev => prev + 1);
    setUserAnswer('');
  };

  const renderQuestion = () => {
    if (loading) return <p>Loading quiz data...</p>;
    if (!mode) return <p>Select a mode to begin.</p>;
    const isQuizDone = quizPairs.length > 0 && index >= quizPairs.length;

    if (askUsername) {
      return (
        <>
          <h2>Enter your name to begin:</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            placeholder="Your name"
          />
          <br />
          <button onClick={handleUsernameSubmit} style={{ marginTop: '10px' }}>
            Continue
          </button>
        </>
      );
    }

    if (askContinent) {
      return (
        <>
          <h2>Enter a continent name (or leave blank for all):</h2>
          <input
            type="text"
            value={continentInput}
            onChange={(e) => setContinentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitContinent()}
            placeholder="Continent name"
          />
          <br />
          <button onClick={submitContinent} style={{ marginTop: '10px' }}>
            Start Quiz
          </button>
        </>
      );
    }

    if (isQuizDone) {
      return <p>Quiz Complete! You scored {score} out of {quizPairs.length}.</p>;
    }

    if (!quizPairs.length) {
      return <p>Waiting for quiz data...</p>;
    }

    const current = quizPairs[index];
    const question =
      mode === 1
        ? `Which country has the capital '${current.capital}'?`
        : `What is the capital of '${current.country}'?`;

    return (
      <>
        <h2>{question}</h2>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Enter your answer"
        />
        <br />
        <button onClick={checkAnswer} style={{ marginTop: '10px' }}>
          Submit
        </button>
        <p style={{background:'lightpink',width:'290px',marginLeft:'450px',borderRadius: '3px' }}>{feedback}</p>
        <p style={{background:'lightpink',width:'100px',marginLeft:'560px',borderRadius: '3px' ,colour:'darkgreen',font:'bold'}}>Score: {score} / {index}</p>
      </>
    );
  };


  return (
    <div
      style={{
        color: 'Black',
        fontFamily: 'roboto',
        textAlign: 'center',
        padding: '20px',
        minHeight: '100vh',
        backgroundImage: 'url("/wold-map.gif")',
        backgroundColor: '#001f4d',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}//geography quiz
    >
      <h1 style={{ color: 'darkblue' }}></h1>
 
      {!mode && (
        <>
          <button
            style={{ background: 'skyblue', border: 'solid lightblue', borderRadius: '5px' }}
            onClick={() => handleModeSelect(1)}
          >
            Mode 1: Guess Country from Capital
          </button>
          <br /><br />
          <button
            style={{ background: 'skyblue', border: 'solid lightblue', borderRadius: '5px' }}
            onClick={() => handleModeSelect(2)}
          >
            Mode 2: Guess Capital of Country
          </button>
          <br /> <br />
          {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
          <button
            style={{ background: '#ffd700', border: '1px solid gold', borderRadius: '5px', padding: '8px 16px' }}
            onClick={() => setShowLeaderboard(true)}
          >
            View Leaderboard
          </button>
        </>
      )}

      <br /><br />
      {renderQuestion()}

      {mode && (
        <button
          style={{ background:'white',color: 'darkblue' }}
          onClick={() => setMode(null)}
        >
          Back to Mode Selection
        </button>
      )}
    </div>
  );
}

export default Quiz;
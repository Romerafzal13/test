import React, { useState, useEffect } from 'react';
import Leaderboard from './leaderboard';
import CountryMap from './countrymap';

// frontend/src/quiz.js
const API_BASE = process.env.REACT_APP_API_BASE || 'http://192.168.100.129:5000/api';

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
          const response = await fetch(`${API_BASE}/score`, {
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
    if (continent) url += `?continent=${continent}`;

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

    const correct =
      (mode === 1 && answer === current.country.toLowerCase()) ||
      (mode === 2 && answer === current.capital.toLowerCase());

    setScore(prev => prev + (correct ? 1 : 0));
    setFeedback(
      correct
        ? '✅ Correct!'
        : mode === 1
        ? `❌ Incorrect! The correct answer was '${current.country}'`
        : `❌ Incorrect! The capital of '${current.country}' is '${current.capital}'`
    );

    setIndex(prev => prev + 1);
    setUserAnswer('');
  };

  const buttonStyle = {
    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    margin: '10px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background 0.3s ease',
  };

  const renderQuestion = () => {
    if (loading) return <p>Loading quiz data...</p>;
    if (!mode) return <p>Select a mode to begin.</p>;
    const isQuizDone = quizPairs.length > 0 && index >= quizPairs.length;

    if (askUsername) {
      return (
        <div style={{ marginBottom: '20px' }}>
          <h2>🧑 Enter your name to begin:</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            placeholder="Your name"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '70%',
              marginBottom: '10px'
            }}
          />
          <br />
          <button onClick={handleUsernameSubmit} style={buttonStyle}>
            Continue
          </button>
        </div>
      );
    }

    if (askContinent) {
      return (
        <div style={{ marginBottom: '20px' }}>
          <h2>🌍 Choose a continent (or leave blank for all):</h2>
          <input
            type="text"
            value={continentInput}
            onChange={(e) => setContinentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitContinent()}
            placeholder="e.g. Asia"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              width: '70%',
              marginBottom: '10px'
            }}
          />
          <br />
          <button onClick={submitContinent} style={buttonStyle}>
            Start Quiz
          </button>
        </div>
      );
    }

    if (isQuizDone) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#ffffff20', borderRadius: '10px' }}>
          <h2>🎉 Quiz Complete!</h2>
          <p>You scored {score} out of {quizPairs.length}.</p>
        </div>
      );
    }

    if (!quizPairs.length) return <p>Waiting for quiz data...</p>;

    const current = quizPairs[index];
    const question =
      mode === 1
        ? `Which country has the capital '${current.capital}'?`
        : `What is the capital of '${current.country}'?`;

    return (
      <div style={{
        backgroundColor: '#ffffff10',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        maxWidth: '600px',
        marginBottom: '30px',
      }}>
        <h2 style={{ color: '#9a2020d8' }}>{question}</h2>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
          placeholder="Enter your answer"
          style={{
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            width: '80%',
            marginTop: '10px',
          }}
        />
        <br />
        <button onClick={checkAnswer} style={buttonStyle}>
          Submit Answer
        </button>
        <div style={{
          backgroundColor: '#ffffff20',
          padding: '15px',
          borderRadius: '10px',
          marginTop: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{feedback}</p>
          <p style={{ color: '#90ee90' }}>Score: {score} / {index}</p>
        </div>
        {quizPairs.length > 0 && index < quizPairs.length && (
          <CountryMap
            style={{ height: '250px', width: '200px', borderRadius: '10px' }}
            lat={parseFloat(quizPairs[index].lat)}
            lng={parseFloat(quizPairs[index].lng)}
          />
        )}
      </div>
    );
  };

  return (
<div
  style={{
    fontFamily: `'Segoe UI', Roboto, sans-serif`,
    color: '#f5f5f5',
    padding: '30px',
    minHeight: '100vh',
backgroundImage: ` url("/world-map.gif")`,    backgroundSize: 'cover',        // 👈 Ensures full coverage
    backgroundPosition: 'center',   // 👈 Centers image
    backgroundRepeat: 'no-repeat',  // 👈 Prevents tiling
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }}
>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#49781fff' }}>
        🌍 Geography Quiz Challenge
      </h1>

      {!mode && (
        <>
          <button style={buttonStyle} onClick={() => handleModeSelect(1)}>
            Mode 1: Guess Country from Capital
          </button>
          <button style={buttonStyle} onClick={() => handleModeSelect(2)}>
            Mode 2: Guess Capital of Country
          </button>
          <button
            style={{
              ...buttonStyle,
              background: 'linear-gradient(to right, #ff416c, #ff4b2b)'
            }}
            onClick={() => setShowLeaderboard(true)}
          >
            View Leaderboard
          </button>
          {showLeaderboard && (
  <div style={{ marginTop: '30px', width: '100%', maxWidth: '800px' }}>
    <Leaderboard onClose={() => setShowLeaderboard(false)} />
  </div>
)}
        </>
      )}

      {renderQuestion()}

      {mode && (
        <button
          style={{
            ...buttonStyle,
            background: 'linear-gradient(to right, #8e2de2, #4a00e0)',
            marginTop: '20px'
          }}
          onClick={() => setMode(null)}
        >
          ⬅ Back to Mode Selection
        </button>
      )}
    </div>
  );
}

export default Quiz;
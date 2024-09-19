import React, { useState, useEffect } from 'react';
import socket from '../../socket';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/SelectPlanet.css';

const SelectPlanet = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state;

  // Initialize state with sessionStorage or default values
  const [selectedPlanet, setSelectedPlanet] = useState(() => {
    return sessionStorage.getItem('selectedPlanet') || null;
  });
  const [planetBriefings, setPlanetBriefings] = useState(() => {
    const savedBriefings = sessionStorage.getItem('planetBriefings');
    return savedBriefings ? JSON.parse(savedBriefings) : {};
  });
  const [planets, setPlanets] = useState(() => {
    const savedPlanets = sessionStorage.getItem('planets');
    return savedPlanets ? JSON.parse(savedPlanets) : [
      'Mercury',
      'Venus',
      'Earth',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
      'PlanetX'
    ];
  });

  // Combined useEffect to save all states to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('selectedPlanet', selectedPlanet);
    sessionStorage.setItem('planets', JSON.stringify(planets));
    sessionStorage.setItem('planetBriefings', JSON.stringify(planetBriefings));
  }, [selectedPlanet, planets, planetBriefings]);

  useEffect(() => {
    // Fetch planet briefings data
    fetch('/player_briefings.json')
      .then(response => response.json())
      .then(data => setPlanetBriefings(data))
      .catch(error => console.error('Error fetching the planet briefings:', error));

    // Listen for planet selection updates from the server
    socket.on('planetSelected', (planet) => {
      setPlanets((prevPlanets) => prevPlanets.filter((p) => p !== planet));
    });

    // Clean up on component unmount
    return () => {
      socket.off('planetSelected');
    };
  }, []);

  const handleSelect = (planet) => {
    setSelectedPlanet(planet);
  };

  const handleProceedToGame = () => {
    socket.emit('selectPlanet', { planet: selectedPlanet, playerId: socket.sessionID });
    navigate(`/game/${lobbyId}`, { state: { name, planet: selectedPlanet } });
  };

  return (
    <div className="select-planet-container">
      <div className="planet-selection">
        <h1>Hi {name}! Please select your planet</h1>
        <ul>
          {planets.map((planet) => (
            <li key={planet}>
              {planet}
              <button
                onClick={() => handleSelect(planet)}
                data-planet={planet}
                data-description={planetBriefings[planet]?.roleOverview || ''}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedPlanet && (
        <div className="selected-planet">
          <p>You have selected: {selectedPlanet}</p>
          <button onClick={handleProceedToGame}>Proceed to Lobby</button>
        </div>
      )}
    </div>
  );
};

export default SelectPlanet;

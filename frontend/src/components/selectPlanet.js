import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const SelectPlanet = () => {
  const { lobbyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { name } = location.state;
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const [planets, setPlanets] = useState([
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
  ]);

  useEffect(() => {
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
    socket.emit('selectPlanet', { planet: selectedPlanet, playerId: socket.id });
    navigate(`/game/${lobbyId}`, { state: { name, planet: selectedPlanet } });
  };

  return (
    <div>
      <h1>Hi {name}! Please select your planet</h1>
      <ul>
        {planets.map((planet) => (
          <li key={planet}>
            {planet}
            <button onClick={() => handleSelect(planet)}>Select</button>
          </li>
        ))}
      </ul>
      {selectedPlanet && (
        <div>
          <p>You have selected: {selectedPlanet}</p>
          <button onClick={handleProceedToGame}>Proceed to Lobby</button>
        </div>
      )}
    </div>
  );
};

export default SelectPlanet;

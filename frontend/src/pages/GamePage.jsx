import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import GameEngine from '../phaser/GameEngine';

function GamePage() {
  const { user } = useAuthStore();
  const gameRef = useRef(null);
  const gameInstanceRef = useRef(null);

  useEffect(() => {
    if (!gameInstanceRef.current && gameRef.current) {
      gameInstanceRef.current = new GameEngine(gameRef.current, user.id);
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy();
        gameInstanceRef.current = null;
      }
    };
  }, [user.id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="mb-6 text-center">Your Reading Journey</h1>

      <div id="game-container" ref={gameRef}></div>

      <div className="card mt-6">
        <h3 className="mb-3">Game Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="font-medium">Movement</p>
            <p className="text-sm text-gray-600">
              Your character moves automatically as you log books
            </p>
          </div>
          <div>
            <p className="font-medium">Tiles</p>
            <p className="text-sm text-gray-600">
              Different tiles grant bonuses and challenges
            </p>
          </div>
          <div>
            <p className="font-medium">Goal</p>
            <p className="text-sm text-gray-600">
              Reach the diploma tile to complete your journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;

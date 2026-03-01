import { useContext } from 'react';
import { GameContext } from './GameStore';

export const useGame = () => useContext(GameContext);

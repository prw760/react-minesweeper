import React, { useState, useEffect } from 'react';
import './App.css';
import bombImage from './bomb.svg';

const BOMB_COUNT = 10;

const Minefield = () => {
    // Function to create an 8x9 minefield, initialize each cell, plant 10 mines, and calculate adjacent mines.
    const createMinefield = () => {
        const rows = 8;
        const cols = 9;
        // Create minefield with default values
        const minefield = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => ({
                isRevealed: false,
                hasMine: false,
                numMinesAdjacent: 0,
                isFlagged: false,
            }))
        );

        // Randomly assign 10 mines
        let minesToPlant = BOMB_COUNT;
        while (minesToPlant > 0) {
            const randomRow = Math.floor(Math.random() * rows);
            const randomCol = Math.floor(Math.random() * cols);
            if (!minefield[randomRow][randomCol].hasMine) {
                minefield[randomRow][randomCol].hasMine = true;
                minesToPlant--;
            }
        }

        // Helper function to calculate number of adjacent mines for a cell
        const calculateAdjacentMines = (row, col) => {
            let count = 0;
            // Offsets for the eight adjacent cells including diagonals
            const directions = [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, -1],
                [0, 1],
                [1, -1],
                [1, 0],
                [1, 1],
            ];
            directions.forEach(([dx, dy]) => {
                const newRow = row + dx;
                const newCol = col + dy;
                // Check boundaries
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    if (minefield[newRow][newCol].hasMine) {
                        count++;
                    }
                }
            });
            return count;
        };

        // Update each cell that doesn't have a mine with the count of adjacent mines
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!minefield[row][col].hasMine) {
                    minefield[row][col].numMinesAdjacent = calculateAdjacentMines(row, col);
                }
            }
        }

        return minefield;
    };

    const [minefield, setMinefield] = useState(createMinefield());
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [time, setTime] = useState(0);

    // Timer effect: increments every second until gameOver becomes true.
    useEffect(() => {
        let interval;
        if (gameStarted && !gameOver) {
            interval = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [gameStarted, gameOver]);

    // Effect to check win condition: if flagged count equals bomb count and no bomb is revealed.
    useEffect(() => {
        let flaggedCount = 0;
        let bombRevealed = false;
        minefield.forEach(row => {
            row.forEach(cell => {
                if (cell.isFlagged) flaggedCount++;
                if (cell.hasMine && cell.isRevealed) bombRevealed = true;
            });
        });
        if (!bombRevealed && flaggedCount === BOMB_COUNT) {
            setGameWon(true);
            setGameOver(true); // Freeze board and stop timer
        }
    }, [minefield]);

    // Helper function to recursively reveal adjacent blank cells.
    const revealAdjacentBlanks = (field, row, col) => {
        const rows = field.length;
        const cols = field[0].length;
        const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                const adjacentCell = field[newRow][newCol];
                if (!adjacentCell.isRevealed && !adjacentCell.isFlagged) {
                    adjacentCell.isRevealed = true;
                    if (!adjacentCell.hasMine && adjacentCell.numMinesAdjacent === 0) {
                        revealAdjacentBlanks(field, newRow, newCol);
                    }
                }
            }
        });
    };

    // Format time (in seconds) to HH:MM:SS.
    const formatTime = (timeInSeconds) => {
        const hours = String(Math.floor(timeInSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((timeInSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(timeInSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    // Left-click handler to reveal a cell.
    const handleCellClick = (row, col) => {
        if (gameOver) return; // Freeze board

        if (!gameStarted) {
            setGameStarted(true);
        }

        setMinefield(prevMinefield => {
            const newMinefield = prevMinefield.map(r => r.map(cell => ({ ...cell })));
            const cell = newMinefield[row][col];

            // Ignore left-clicks on flagged cells.
            if (cell.isFlagged) return newMinefield;

            cell.isRevealed = true;

            if (!cell.hasMine && cell.numMinesAdjacent === 0) {
                revealAdjacentBlanks(newMinefield, row, col);
            }

            if (cell.hasMine) {
                // Reveal the entire board if a bomb is clicked.
                for (let r = 0; r < newMinefield.length; r++) {
                    for (let c = 0; c < newMinefield[0].length; c++) {
                        newMinefield[r][c].isRevealed = true;
                    }
                }
                setGameOver(true);
            }
            return newMinefield;
        });
    };

    // Right-click handler to toggle a flag on an unrevealed cell.
    const handleCellRightClick = (event, row, col) => {
        event.preventDefault();
        if (gameOver) return;

        setMinefield(prevMinefield => {
            const newMinefield = prevMinefield.map(r => r.map(cell => ({ ...cell })));
            const cell = newMinefield[row][col];
            if (!cell.isRevealed) {
                cell.isFlagged = !cell.isFlagged;
            }
            return newMinefield;
        });
    };

    // Reset the game.
    const handlePlayAgain = () => {
        if (!gameOver) return;
        setMinefield(createMinefield());
        setGameOver(false);
        setGameWon(false);
        setGameStarted(false);
        setTime(0);
    };

    // Compute flagged count for display (as a two-digit number)
    const flaggedCount = String(minefield.flat().filter(cell => cell.isFlagged).length).padStart(2, '0');

    return (
        <div className="minesweeper-container">
            <div className="header">
                <div className="header-title">Minesweeper</div>
                <div className="control-panel">
                    <div className="control-panel-text">{flaggedCount}</div>
                    <button
                        className="control-panel-button"
                        onClick={handlePlayAgain}
                        style={{ visibility: gameOver ? 'visible' : 'hidden' }}
                    >
                        Restart
                    </button>
                    <div className="control-panel-text">{formatTime(time)}</div>
                </div>
            </div>
            <div className="minesweeper">
                {minefield.map((rowArray, rowIndex) => (
                    <div className="row" key={rowIndex}>
                        {rowArray.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                                className={`cell ${cell.isRevealed ? 'revealed' : ''}`}
                            >
                                {cell.isRevealed ? (
                                    cell.hasMine ? (
                                        <img src={bombImage} alt="Bomb" className="bomb-image" />
                                    ) : (
                                        cell.numMinesAdjacent === 0 ? '' : cell.numMinesAdjacent.toString()
                                    )
                                ) : (
                                    cell.isFlagged ? (
                                        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                                            !
                                        </span>
                                    ) : (
                                        ''
                                    )
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            {gameOver && (
                <div className="game-over-message">
                    {gameWon ? 'You Win' : 'Game Over'}
                </div>
            )}
        </div>
    );
};

export default Minefield;

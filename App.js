import React, { useState } from 'react';
import './App.css'; // Updated reference to App.css
import bombImage from './bomb.svg'; // Import the bomb image

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
            }))
        );

        // Randomly assign 10 mines
        let minesToPlant = 10;
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
                if (!adjacentCell.isRevealed) {
                    adjacentCell.isRevealed = true;
                    if (!adjacentCell.hasMine && adjacentCell.numMinesAdjacent === 0) {
                        revealAdjacentBlanks(field, newRow, newCol);
                    }
                }
            }
        });
    };

    // Click handler to reveal a cell and check for game over.
    const handleCellClick = (row, col) => {
        // Do nothing if the game is over.
        if (gameOver) return;

        setMinefield(prevMinefield => {
            // Create a new copy of the minefield to maintain immutability
            const newMinefield = prevMinefield.map(r => r.map(cell => ({ ...cell })));
            const cell = newMinefield[row][col];
            cell.isRevealed = true;
            // If the revealed cell is blank, recursively reveal adjacent blank cells.
            if (!cell.hasMine && cell.numMinesAdjacent === 0) {
                revealAdjacentBlanks(newMinefield, row, col);
            }
            return newMinefield;
        });

        // Check if the clicked cell has a bomb.
        if (minefield[row][col].hasMine) {
            // Use a timeout to allow the UI to update (show the bomb cell) before alerting game over.
            setTimeout(() => {
                alert("Game Over");
                setGameOver(true);
            }, 0);
        }
    };

    return (
        <div className="minesweeper-container">
            <div className="title-area">Minesweeper</div>
            <div className="minesweeper">
                {minefield.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                className={`cell ${cell.isRevealed ? 'revealed' : ''}`}
                            >
                                {cell.isRevealed ? (
                                    cell.hasMine ? (
                                        <img src={bombImage} alt="Bomb" className="bomb-image" />
                                    ) : (
                                        cell.numMinesAdjacent === 0 ? '' : cell.numMinesAdjacent.toString()
                                    )
                                ) : (
                                    ''
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Minefield;



















/*

import React from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import './App.css';
import logo from './bomb.svg';

const Minesweeper = () => {

    const createEmptyGrid = (rows, cols) => {
        let grid = [];
        for (let i = 0; i < rows; i++) {
            let row = [];
            for (let j = 0; j < cols; j++) {
                row.push({ revealed: false, value: 0 });
            }
            grid.push(row);
        }
        return grid;
    };

    const flagCounter = 10;
    const timerValue = "0:00"
    const rows = 9;
    const cols = 8;
    const grid = createEmptyGrid(rows, cols);

    return (
        <div className="minesweeper-container">
            <div className="title-area">Minesweeper&nbsp;<img src={String(logo)} alt="Minesweeper Logo" className="logo-image"/></div>
            <div className="control-panel">
                <div className="control-panel-text">{flagCounter}</div>
                <div><input type="button" value="Reset" className="reset-button" /></div>
                <div className="control-panel-text">{timerValue}</div>
            </div>
            <div className="minesweeper">
                {grid.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                        {row.map((cell, colIndex) => (
                            <div className="cell" key={colIndex}>
                                {' Render cell content here'}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Minesweeper;
*/
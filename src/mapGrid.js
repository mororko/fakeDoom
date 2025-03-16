export function generateDoomMap(rows = 50, cols = 50, roomCount = 15) {
  // Iniciar el grid lleno de muros
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  const rooms = [];

  // Generar salas: ahora usamos un tamaño mínimo de 8 y máximo de 12 celdas
  for (let i = 0; i < roomCount; i++) {
    const roomWidth = Math.floor(Math.random() * 5) + 8;  // de 8 a 12 celdas
    const roomHeight = Math.floor(Math.random() * 5) + 8; // de 8 a 12 celdas

    // Elegir posición aleatoria dejando un borde de 1 en el contorno global
    const roomX = Math.floor(Math.random() * (cols - roomWidth - 2)) + 1;
    const roomY = Math.floor(Math.random() * (rows - roomHeight - 2)) + 1;

    // Vaciar el interior de la sala (dejar el borde intacto)
    for (let r = roomY + 1; r < roomY + roomHeight - 1; r++) {
      for (let c = roomX + 1; c < roomX + roomWidth - 1; c++) {
        grid[r][c] = 0;
      }
    }

    rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
  }

  // Para cada sala, abrir una puerta en uno de los bordes (marcando la celda como 2)
  for (let room of rooms) {
    const possibleDoorCells = [];

    // Top border: fila room.y, columnas de room.x+1 hasta room.x+roomWidth-2
    for (let c = room.x + 1; c < room.x + room.width - 1; c++) {
      possibleDoorCells.push({ row: room.y, col: c });
    }
    // Bottom border: fila room.y + room.height - 1
    for (let c = room.x + 1; c < room.x + room.width - 1; c++) {
      possibleDoorCells.push({ row: room.y + room.height - 1, col: c });
    }
    // Left border: columna room.x, filas de room.y+1 hasta room.y+room.height-2
    for (let r = room.y + 1; r < room.y + room.height - 1; r++) {
      possibleDoorCells.push({ row: r, col: room.x });
    }
    // Right border: columna room.x + room.width - 1
    for (let r = room.y + 1; r < room.y + room.height - 1; r++) {
      possibleDoorCells.push({ row: r, col: room.x + room.width - 1 });
    }

    if (possibleDoorCells.length > 0) {
      const doorCell = possibleDoorCells[Math.floor(Math.random() * possibleDoorCells.length)];
      grid[doorCell.row][doorCell.col] = 2;
    }
  }

  return grid;
}

export function getRandomPlayerStart(grid, cellSize = 10) {
  const emptyCells = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      // Consideramos celdas con 0 o 2 (puerta) como espacios accesibles para el jugador.
      if (grid[row][col] === 0 || grid[row][col] === 2) {
        emptyCells.push({ row, col });
      }
    }
  }
  if (emptyCells.length === 0) {
    return {
      x: Math.floor(grid[0].length / 2) * cellSize + cellSize / 2,
      y: 2,
      z: Math.floor(grid.length / 2) * cellSize + cellSize / 2,
    };
  }
  const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return {
    x: cell.col * cellSize + cellSize / 2,
    y: 2,
    z: cell.row * cellSize + cellSize / 2,
  };
}

export function getOpenCells(grid) {
  const openCells = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col] === 0 || grid[row][col] === 2) {
        openCells.push({ row, col });
      }
    }
  }
  return openCells;
}
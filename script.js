// 手応え抜群の本格的な10ステージ構成
// W: 壁, .: 床, T: 目的地, B: 荷物, P: プレイヤー
const stages = [
  // Stage 1: 直線の基本
  [
    "WWWWWW",
    "W....W",
    "W.P..W",
    "W.B.TW",
    "W....W",
    "WWWWWW"
  ],
  // Stage 2: 荷物を迂回して押す
  [
    "WWWWWW",
    "W.T..W",
    "W.W..W",
    "W.B..W",
    "W.P..W",
    "WWWWWW"
  ],
  // Stage 3: 押し順と引き返し（2箱）
  [
    "WWWWWWW",
    "W..T..W",
    "W.B.B.W",
    "W..P..W",
    "W..T..W",
    "WWWWWWW"
  ],
  // Stage 4: 狭い角でのすれ違い
  [
    "WWWWWWW",
    "W.T...W",
    "W.W.BTW",
    "W.P...W",
    "WWWWWWW"
  ],
  // Stage 5: 3箱の優先順位パズル
  [
    "WWWWWWWW",
    "W..T.T.W",
    "W.WBBB.W",
    "W...P.TW",
    "W......W",
    "WWWWWWWW"
  ],
  // Stage 6: 中央の障害物と精密な誘導
  [
    "WWWWWWWW",
    "W...W..W",
    "W.T.B.TW",
    "W.PWB..W",
    "W...W..W",
    "WWWWWWWW"
  ],
  // Stage 7: 行き止まりを回避する思考型
  [
    "WWWWWWWW",
    "W.T.T..W",
    "W.W.WW.W",
    "W.B.B..W",
    "W..P...W",
    "WWWWWWWW"
  ],
  // Stage 8: 狭路の連鎖パズル（3箱）
  [
    "WWWWWWWW",
    "W.T.T.TW",
    "W..BBB.W",
    "WW.P...W",
    "W......W",
    "WWWWWWWW"
  ],
  // Stage 9: 空間が限られた超難所
  [
    "WWWWWWWW",
    "W.T.W..W",
    "W.B.B.TW",
    "W.P.W..W",
    "W...T..W",
    "WWWWWWWW"
  ],
  // Stage 10: 最終試練（複雑な配置）
  [
    "WWWWWWWW",
    "W.T.T.TW",
    "W.W.W..W",
    "W.B.B.BW",
    "W...P..W",
    "WWWWWWWW"
  ]
];

let currentStageIndex = 0;
let grid = [];
let playerPos = { x: 0, y: 0 };
let moveCount = 0;

// アンドゥ（1手戻す）のための履歴管理
let historyStack = [];

// ステージの読み込み
function loadStage(stageIndex) {
  const stageData = stages[stageIndex];
  grid = [];
  moveCount = 0;
  historyStack = [];
  
  const gridElement = document.getElementById('grid');
  const width = stageData[0].length;
  const height = stageData.length;
  gridElement.style.gridTemplateColumns = `repeat(${width}, 44px)`;
  gridElement.style.gridTemplateRows = `repeat(${height}, 44px)`;

  document.getElementById('move-count').textContent = moveCount;
  document.getElementById('stage-num').textContent = stageIndex + 1;
  document.getElementById('message').textContent = "すべての荷物を目的地に運ぼう！";

  for (let y = 0; y < stageData.length; y++) {
    const row = [];
    for (let x = 0; x < stageData[y].length; x++) {
      const char = stageData[y][x];
      let cell = {
        type: 'floor',
        target: false,
        box: false,
        player: false
      };

      if (char === 'W') cell.type = 'wall';
      if (char === 'T') cell.target = true;
      if (char === 'B') cell.box = true;
      if (char === 'P') {
        cell.player = true;
        playerPos = { x, y };
      }

      row.push(cell);
    }
    grid.push(row);
  }
  render();
}

// 現在の状態をディープコピーして履歴に保存
function saveHistory() {
  const stateCopy = {
    playerPos: { ...playerPos },
    grid: grid.map(row => row.map(cell => ({ ...cell })))
  };
  historyStack.push(stateCopy);
}

// 1手戻す（Undo）
function undoMove() {
  if (historyStack.length === 0) return;

  const previousState = historyStack.pop();
  playerPos = previousState.playerPos;
  grid = previousState.grid;
  
  moveCount = Math.max(0, moveCount - 1);
  document.getElementById('move-count').textContent = moveCount;
  document.getElementById('message').textContent = "1手戻しました";

  render();
}

// 画面の描画
function render() {
  const gridElement = document.getElementById('grid');
  gridElement.innerHTML = '';

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      const cellDiv = document.createElement('div');
      cellDiv.className = 'cell';

      if (cell.type === 'wall') {
        cellDiv.classList.add('wall');
        cellDiv.textContent = '🧱';
      } else {
        cellDiv.classList.add('floor');

        if (cell.box && cell.target) {
          cellDiv.classList.add('box-on-target');
          cellDiv.textContent = '✅';
        } else if (cell.box) {
          cellDiv.textContent = '📦';
        } else if (cell.player) {
          cellDiv.textContent = '🤖';
        } else if (cell.target) {
          cellDiv.classList.add('target');
          cellDiv.textContent = '🎯';
        }
      }

      gridElement.appendChild(cellDiv);
    }
  }
}

// プレイヤーの移動処理
function movePlayer(dx, dy) {
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  if (newY < 0 || newY >= grid.length || newX < 0 || newX >= grid[0].length) return;

  const currentCell = grid[playerPos.y][playerPos.x];
  const targetCell = grid[newY][newX];

  if (targetCell.type === 'wall') return;

  let boxMoved = false;

  // 箱がある場合の移動判定
  if (targetCell.box) {
    const boxNewX = newX + dx;
    const boxNewY = newY + dy;

    if (boxNewY < 0 || boxNewY >= grid.length || boxNewX < 0 || boxNewX >= grid[0].length) return;

    const boxTargetCell = grid[boxNewY][boxNewX];

    if (boxTargetCell.type === 'wall' || boxTargetCell.box) return;

    // 移動確定の直前に履歴を保存
    saveHistory();

    targetCell.box = false;
    boxTargetCell.box = true;
    boxMoved = true;
  } else {
    // プレイヤー単体移動の履歴保存
    saveHistory();
  }

  currentCell.player = false;
  targetCell.player = true;
  playerPos = { x: newX, y: newY };

  moveCount++;
  document.getElementById('move-count').textContent = moveCount;

  render();
  checkWin();
}

// クリア判定
function checkWin() {
  let allTargetsFilled = true;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const cell = grid[y][x];
      if (cell.target && !cell.box) {
        allTargetsFilled = false;
        break;
      }
    }
  }

  if (allTargetsFilled) {
    document.getElementById('message').textContent = '🎉 ステージクリア！';
    setTimeout(() => {
      if (currentStageIndex + 1 < stages.length) {
        currentStageIndex++;
        loadStage(currentStageIndex);
      } else {
        document.getElementById('message').textContent = '🏆 全10ステージ完全制覇！おめでとう！';
      }
    }, 1000);
  }
}

// ステージ初期化
function resetStage() {
  loadStage(currentStageIndex);
}

// キーボード操作対応
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      movePlayer(0, -1);
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      movePlayer(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      movePlayer(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      movePlayer(1, 0);
      break;
    case 'z':
    case 'Z':
      undoMove();
      break;
    case 'r':
    case 'R':
      resetStage();
      break;
  }
});

// 初期起動
loadStage(0);

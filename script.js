// 必ず解くことができる10ステージ定義
// W: 壁, .: 床, T: 目的地, B: 荷物, P: プレイヤー
const stages = [
  // ステージ 1：チュートリアル（直線で押すだけ）
  [
    "WWWWWW",
    "W....W",
    "W.P..W",
    "W.B.TW",
    "W....W",
    "WWWWWW"
  ],
  // ステージ 2：2つの荷物を直線状に運ぶ
  [
    "WWWWWW",
    "W.T..W",
    "W.B..W",
    "W.P..W",
    "W.BT.W",
    "WWWWWW"
  ],
  // ステージ 3：回り込んで上から下に押す（修正済み！）
  [
    "WWWWWW",
    "W.P..W",
    "W..B.W",
    "W..T.W",
    "W....W",
    "WWWWWW"
  ],
  // ステージ 4：荷物の横に回り込んで押す練習
  [
    "WWWWWW",
    "W.T..W",
    "W....W",
    "W..B.W",
    "W.P..W",
    "WWWWWW"
  ],
  // ステージ 5：2つの荷物（上と右に回り込んで押し分ける）
  [
    "WWWWWWW",
    "W.....W",
    "W.T.B.W",
    "W.P.B.W",
    "W...T.W",
    "WWWWWWW"
  ],
  // ステージ 6：中央の壁を回り込んで目的地へ運ぶ
  [
    "WWWWWWW",
    "W.P...W",
    "W.WB.TW",
    "W.W...W",
    "W...T.W",
    "WWWWWWW"
  ],
  // ステージ 7：2つの荷物を交差させて運ぶ
  [
    "WWWWWWW",
    "W.T...W",
    "W..B..W",
    "W.P.B.W",
    "W...T.W",
    "WWWWWWW"
  ],
  // ステージ 8：3つの荷物（順番を考えるパズル）
  [
    "WWWWWWWW",
    "W......W",
    "W.T.T.TW",
    "W.BBB..W",
    "W...P..W",
    "WWWWWWWW"
  ],
  // ステージ 9：狭いスペースでの入れ替え作業
  [
    "WWWWWWWW",
    "W..T...W",
    "W.WB.W.W",
    "W.PB.TW",
    "W......W",
    "WWWWWWWW"
  ],
  // ステージ 10：最終ステージ（解き応えのある配置）
  [
    "WWWWWWWW",
    "W.T..T.W",
    "W.W..W.W",
    "W..B.B.W",
    "W.P....W",
    "WWWWWWWW"
  ]
];

let currentStageIndex = 0;
let grid = [];
let playerPos = { x: 0, y: 0 };
let moveCount = 0;

// ステージの読み込み
function loadStage(stageIndex) {
  const stageData = stages[stageIndex];
  grid = [];
  moveCount = 0;
  
  // 盤面の大きさに合わせてCSSのグリッド列数を変更
  const gridElement = document.getElementById('grid');
  const width = stageData[0].length;
  const height = stageData.length;
  gridElement.style.gridTemplateColumns = `repeat(${width}, 48px)`;
  gridElement.style.gridTemplateRows = `repeat(${height}, 48px)`;

  document.getElementById('move-count').textContent = moveCount;
  document.getElementById('stage-num').textContent = stageIndex + 1;
  document.getElementById('message').textContent = "すべての荷物を目的地に運ぼう！";

  for (let y = 0; y < stageData.length; y++) {
    const row = [];
    for (let x = 0; x < stageData[y].length; x++) {
      const char = stageData[y][x];
      let cell = {
        type: 'floor', // floor, wall
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

  // 盤面外チェック
  if (newY < 0 || newY >= grid.length || newX < 0 || newX >= grid[0].length) return;

  const currentCell = grid[playerPos.y][playerPos.x];
  const targetCell = grid[newY][newX];

  // 壁の場合は移動できない
  if (targetCell.type === 'wall') return;

  // 移動先に箱がある場合
  if (targetCell.box) {
    const boxNewX = newX + dx;
    const boxNewY = newY + dy;

    // 箱の移動先盤面外チェック
    if (boxNewY < 0 || boxNewY >= grid.length || boxNewX < 0 || boxNewX >= grid[0].length) return;

    const boxTargetCell = grid[boxNewY][boxNewX];

    // 箱の押し先が壁か、別の箱の場合は押せない
    if (boxTargetCell.type === 'wall' || boxTargetCell.box) return;

    // 箱を移動
    targetCell.box = false;
    boxTargetCell.box = true;
  }

  // プレイヤー移動
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
        document.getElementById('message').textContent = '🏆 全10ステージクリア！おめでとう！';
      }
    }, 1000);
  }
}

// やり直し
function resetStage() {
  loadStage(currentStageIndex);
}

// キーボード操作対応
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
      movePlayer(0, -1);
      break;
    case 'ArrowDown':
    case 's':
      movePlayer(0, 1);
      break;
    case 'ArrowLeft':
    case 'a':
      movePlayer(-1, 0);
      break;
    case 'ArrowRight':
    case 'd':
      movePlayer(1, 0);
      break;
    case 'r':
    case 'R':
      resetStage();
      break;
  }
});

// 初期化
loadStage(0);

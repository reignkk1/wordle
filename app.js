"use strict";
/*
1. 키패드에 누른 알파벳이 보드에 표시되어야 한다.
2. 총 5개의 알파벳을 누를 수 있다. 그리고 엔터를 눌러야 다음 밑에 칸으로 넘어감.
3. backspace누르면 보드에 있는 알파벳이 지워진다.
4. 엔터 누를 시 정답 단어 스펠링에 포함이 된다면 노란색, 위치까지 맞다면 초록색, 포함 안되면 검은색
5. 실패 시 모달창 띄우며 다시하기, 성공 했을 때 폭죽!
*/

// Selectors
const grid = document.getElementById("grid");
const keyboard = document.getElementById("keyboard");
const modal = document.getElementById("modal");
const helpButton = document.getElementById("help-button");

// EventListners
document.addEventListener("keydown", handleKeyDown);
helpButton.addEventListener("click", createHelpModalInner);

// Functions
const wordList = ["piano", "apple"];
const randomIndex = Math.floor(Math.random() * wordList.length);

// 색깔
const GREEN = "#538f4e";
const YELLOW = "#b59f3b";
const GREY = "#3A3A3C";
const LIGHTGREY = "#3a3a3c";

let choiceWord;
let lettersColor = new Map();
let pressedWords = [];
let currentPressedWord = "";

buildGrid();
updateGrid();
buildKeyBoard();
drawRandomWord();

// 초기화
function reset() {
  const fronts = document.querySelectorAll(".front");
  const backs = document.querySelectorAll(".back");
  const buttons = document.querySelectorAll(".keyboard-button");

  pressedWords = [];
  lettersColor.clear();
  buttons.forEach((button) => (button.style.backgroundColor = "#818384"));
  fronts.forEach((front) => {
    front.style.opacity = "1";
    front.style.animationName = "none";
    front.innerText = "";
  });
  backs.forEach((back) => {
    back.style.opacity = "0";
    back.style.animationName = "none";
  });
}

// 단어 랜덤으로 뽑기
function drawRandomWord() {
  choiceWord = wordList[Math.floor(Math.random() * wordList.length)];
}

// 키보드 빌드
function buildKeyBoard() {
  drawKeyBoardRow("qwertyuiop");
  drawKeyBoardRow(" asdfghjkl ");
  drawKeyBoardRow("zxcvbnm", true);
}

// 키보드 열 그리기
function drawKeyBoardRow(letters, isLastRow = false) {
  const row = document.createElement("div");
  row.className = "keyboard-row";
  if (isLastRow) row.appendChild(createKeyBoardButton("enter"));
  for (const letter of letters) {
    row.appendChild(createKeyBoardButton(letter));
  }
  if (isLastRow) row.appendChild(createKeyBoardButton("◀"));
  keyboard.appendChild(row);
}

// 키보드 버튼 생성
function createKeyBoardButton(letter) {
  const button = document.createElement("button");
  button.innerText = letter;
  if (letter === " ") {
    button.className = "spaceButton";
  } else {
    button.className = "keyboard-button";
    button.onclick = () => {
      if (letter === "◀") {
        letter = "backspace";
      }
      handleKey(letter);
    };
  }
  return button;
}

// 박스 빌드
function buildGrid() {
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < 5; j++) {
      const box = document.createElement("div");
      const front = document.createElement("div");
      const back = document.createElement("div");

      box.className = "box";
      front.className = "front";
      back.className = "back";

      box.appendChild(front);
      box.appendChild(back);
      row.appendChild(box);
    }
    grid.appendChild(row);
  }
}

// 박스 업뎃
function updateGrid() {
  let row = grid.firstChild;
  for (const pressedWord of pressedWords) {
    drawRowWord(row, pressedWord);
    row = row.nextSibling;
  }
  drawRowLetter(row, currentPressedWord);
}

// 단어 그리기
function drawRowWord(row, pressedWord) {
  for (let i = 0; i < 5; i++) {
    const box = row.children[i];
    const back = box.children[1];
    if (pressedWord[i]) {
      back.innerText = pressedWord[i];
    }
    back.style.backgroundColor = getBackGroundColor(pressedWord, i);
    back.style.borderColor = "black";
  }
}

// 한 글자 씩 그리기
function drawRowLetter(row, currentPressedWord) {
  if (!row) return;
  for (let i = 0; i < 5; i++) {
    const box = row.children[i];
    const front = box.children[0];
    const back = box.children[1];
    if (currentPressedWord[i]) {
      front.innerText = currentPressedWord[i] || "";
      back.innerText = currentPressedWord[i] || "";
      front.style.borderColor = "#565758";
    } else {
      front.innerText = "";
      back.innerText = "";
      front.style.borderColor = LIGHTGREY;
      back.style.borderColor = LIGHTGREY;
    }
  }
}

// 키보드 눌렀을 때 실행되는 이벤트
function handleKeyDown(e) {
  const pressedKey = e.key.toLowerCase();
  handleKey(pressedKey);
}

// 키 눌렀을 때 로직
function handleKey(pressedKey) {
  if (pressedWords.length === 6) return;
  if (pressedKey === "enter") {
    if (currentPressedWord.length < 5) return;
    pressedWords.push(currentPressedWord);
    currentPressedWord = "";
    animateEnter();
    updateKeyBoardColor();
    updateGrid();
    return drawModal();
  } else if (pressedKey === "backspace") {
    currentPressedWord = currentPressedWord.slice(0, -1);
  } else if (/^[a-z]$/.test(pressedKey)) {
    if (currentPressedWord.length === 5) return;
    currentPressedWord += pressedKey;
    animatePressKey();
  }
  updateGrid();
}

// 엔터키를 눌렀을 때 애니메이션
function animateEnter() {
  const row = grid.children[pressedWords.length - 1];

  for (let i = 0; i < 5; i++) {
    const front = row.children[i].children[0];
    const back = row.children[i].children[1];

    front.style.opacity = "0";
    back.style.opacity = "1";

    back.style.animationName = "enter";
    back.style.animationDuration = "1s";
    back.style.animationDelay = `${i * 300}ms`;

    front.style.animationName = "enter";
    front.style.animationDuration = "1s";
    front.style.animationDelay = `${i * 300}ms`;
  }
}

// 키를 눌렀을 때 애니메이션
function animatePressKey() {
  const rowIndex = pressedWords.length;
  const row = grid.children[rowIndex];
  const box = row.children[currentPressedWord.length - 1];
  box.style.animationName = "press";
  box.style.animationDuration = "0.1s";
  setTimeout(() => {
    box.style.animationName = "none";
    box.style.animationDuration = "none";
  }, 100);
}

// 키보드 버튼 배경색 업뎃 로직
function updateKeyBoardColor() {
  const buttons = document.querySelectorAll(".keyboard-button");
  for (const pressedWord of pressedWords) {
    for (let i = 0; i < pressedWord.length; i++) {
      const color = getBackGroundColor(pressedWord, i);
      const prevColor = lettersColor.get(pressedWord[i]);
      lettersColor.set(pressedWord[i], getBetterColor(prevColor, color));
    }
  }
  buttons.forEach((button) => {
    const letter = button.innerText.toLowerCase();
    button.style.backgroundColor = lettersColor.get(letter);
  });
}

// 모달 창 띄우기
function drawModal() {
  const success = pressedWords[pressedWords.length - 1] === choiceWord;
  if (success) {
    setTimeout(() => {
      createModalInner("정답! 축하드립니다!");
      drawRandomWord();
    }, 2500);
  } else if (pressedWords.length === 6) {
    setTimeout(() => {
      createModalInner("실패 ㅠㅠ 다시 도전해주세요 ㅠㅠ");
    }, 2000);
  }
}

// 모달 inner 생성
function createModalInner(title) {
  const container = document.createElement("div");
  const div = document.createElement("div");
  const h1 = document.createElement("h1");
  const button = document.createElement("button");
  const imgBox = document.createElement("div");
  const img = document.createElement("img");

  if (title.includes("정답")) {
    img.src = "https://gifburg.com/images/gifs/fireworks/gifs/0004.gif";
  } else {
    img.src =
      "https://mblogthumb-phinf.pstatic.net/MjAxODA2MjZfMTAy/MDAxNTI5OTgxNzg2MTc1.8nHsgR8Xf4DxtWYsEeVrUgA26IxASLUmikQW8QI07JMg.k0v3yHc9TpLhYLbd0ObCepd45nnjLp_XHyueDTVa3w8g.GIF.viewhee/rain_%286%29.gif?type=w800";
  }
  img.style.background = "none";
  modal.style.display = "flex";
  container.className = "modal-inner";
  h1.innerText = title;
  button.innerText = "다시하기";
  button.onclick = () => {
    modal.style.display = "none";
    reset();
    modal.removeChild(container);
  };

  imgBox.appendChild(img);
  div.appendChild(h1);
  div.appendChild(imgBox);
  div.appendChild(button);

  container.appendChild(div);
  modal.appendChild(container);
}

// How To Play 모달 inner 생성
function createHelpModalInner() {
  const container = document.createElement("div");
  container.className = "modal-help-inner";

  const topDiv = document.createElement("div");
  const closeButton = document.createElement("button");
  topDiv.style.display = "flex";
  topDiv.style.justifyContent = "end";

  closeButton.className = "modal-help-button";
  closeButton.innerText = "X";
  closeButton.onclick = () => {
    modal.style.display = "none";
    modal.removeChild(container);
  };
  topDiv.appendChild(closeButton);

  const middleDiv = document.createElement("div");
  const h1 = document.createElement("h1");
  const p = document.createElement("p");
  const ul = document.createElement("ul");
  const firstLi = document.createElement("li");
  const secondLi = document.createElement("li");

  firstLi.style.marginBottom = "5px";
  h1.innerText = "How To Play";
  p.innerText = "6번의 시도로 단어를 맞춰보세요!";
  firstLi.innerText = "각 5개의 영어 스펠링이어야 합니다.";
  secondLi.innerText =
    "박스의 색상이 변경되어 단어에 얼마나 근접했는지 보여줍니다.";

  ul.appendChild(firstLi);
  ul.appendChild(secondLi);

  middleDiv.appendChild(h1);
  middleDiv.appendChild(p);
  middleDiv.appendChild(ul);

  const bottomDiv = document.createElement("div");
  const h2 = document.createElement("h2");
  h2.innerText = "Examples";

  const exampleContainer = document.createElement("div");
  exampleContainer.appendChild(
    createExample(
      "WEARY",
      "W가 단어에 포함되어 있고 올바른 위치에 있습니다.",
      0,
      GREEN
    )
  );
  exampleContainer.appendChild(
    createExample(
      "VALUE",
      "A가 단어에 포함되어 있고 올바르지 않은 위치에 있습니다.",
      1,
      YELLOW
    )
  );
  exampleContainer.appendChild(
    createExample("WATER", "T가 단어에 포함되어 있지 않습니다.", 2, GREY)
  );

  bottomDiv.appendChild(h2);
  bottomDiv.appendChild(exampleContainer);

  container.appendChild(topDiv);
  container.appendChild(middleDiv);
  container.appendChild(bottomDiv);

  modal.appendChild(container);
  modal.style.display = "flex";
}

// example template
function createExample(letters, explanation, number, color) {
  const container = document.createElement("div");
  const boxs = document.createElement("div");
  boxs.style.display = "flex";

  const p = document.createElement("p");
  p.innerText = explanation;

  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    div.className = "modal-help-examples-box ";
    div.innerText = letters[i];
    boxs.appendChild(div);
  }
  boxs.children[number].style.backgroundColor = color;
  container.appendChild(boxs);
  container.appendChild(p);
  return container;
}

function getBetterColor(prev, cur) {
  if (prev === GREEN || cur === GREEN) {
    return GREEN;
  } else if (prev === YELLOW || cur === YELLOW) {
    return YELLOW;
  } else if (prev === GREY || cur === GREY) {
    return GREY;
  }
}

// 글자 박스 배경색 로직
function getBackGroundColor(pressedWord, i) {
  const choiceWordLetter = choiceWord[i];
  const pressedWordLetter = pressedWord[i];

  if (!pressedWordLetter) return;
  if (choiceWordLetter === pressedWordLetter) {
    return GREEN;
  } else if (choiceWord.includes(pressedWord[i])) {
    return YELLOW;
  } else {
    return GREY;
  }
}

/*
할일

모달창 꾸미기, How to Play 모달창 만들기

*/

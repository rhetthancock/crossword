/*eslint-env browser*/
var autocheck = false;
var completed = 0;
var crossword;
var debug = true;
var blocks;
var direction;
var height;
var needed = 0;
var timer;
var width;

var mouseDown = false;
var lastMouseX;
var lastMouseY;

var words = [
    {
        word: "javascript",
        hint: "Popular interpretted web programming language for modifying web page contents",
        direction: "horizontal",
        xStart: 2,
        yStart: 0,
    },
    {
        word: "science",
        hint: "Process by which humans learn about the world by making hypotheses and performing experiments",
        direction: "vertical",
        xStart: 6,
        yStart: 0,
    },
    {
        word: "computer",
        hint: "Electronic device capable of processing and storing data in binary form",
        direction: "horizontal",
        xStart: 0,
        yStart: 3,
    },
    {
        word: "processor",
        hint: "The brain of the computer, where data is processed and computation occurs",
        direction: "vertical",
        xStart: 10,
        yStart: 0,
    },
    {
        word: "mercury",
        hint: "The closest planet to our sun",
        direction: "vertical",
        xStart: 2,
        yStart: 3,
    },
    {
        word: "cache",
        hint: "A special data structure for retreiving data that is consistently accessed",
        direction: "horizontal",
        xStart: 2,
        yStart: 6,
    },
    {
        word: "harddrive",
        hint: "A spinning magnetic disk used by computer systems to store data",
        direction: "vertical",
        xStart: 5,
        yStart: 6,
    },
    {
        word: "program",
        hint: "A collection of instructions packaged together that allow the computer to perform a specific task",
        direction: "horizontal",
        xStart: 1,
        yStart: 8,
    },
    {
        word: "algorithm",
        hint: "A list of instructions to follow to perform a specific task",
        direction: "horizontal",
        xStart: 1,
        yStart: 11,
    },
];

function blur() {
    if(autocheck) {
        check(this);
    }
}

function calcEndPoints() {
    for(var i = 0; i < words.length; i++) {
        if(words[i].direction == "horizontal") {
            words[i].xEnd = words[i].xStart + words[i].word.length - 1;
            words[i].yEnd = words[i].yStart;
        }
        else if(words[i].direction == "vertical") {
            words[i].xEnd = words[i].xStart;
            words[i].yEnd = words[i].yStart + words[i].word.length - 1;
        }
    }
}

function calcNeeded() {
    var tiles = crossword.getElementsByClassName("tile");
    needed = tiles.length;
}

function check(tile) {
    var x = parseInt(tile.parentElement.dataset.x);
    var y = parseInt(tile.parentElement.dataset.y);
    
    var targetWords = getWords(x, y);
    var targetWord = targetWords[0];
    
    var index;
    if(targetWord.direction == "horizontal") {
        index = x - targetWord.xStart;
    }
    else if(targetWord.direction == "vertical") {
        index = y - targetWord.yStart;
    }
    var correct = targetWord.word.charAt(index);
    if(tile.value.toLowerCase() == correct) {
        tile.classList.add("correct");
        tile.classList.remove("wrong");
    }
    else if(tile.value == "") {
        tile.classList.remove("correct");
        tile.classList.remove("wrong");
    }
    else {
        tile.classList.add("wrong");
        tile.classList.remove("correct");
    }
}

function checkAll() {
    var tiles = crossword.getElementsByClassName("tile");
    for(var i = 0; i < tiles.length; i++) {
        check(tiles[i]);
    }
}

function checkClear() {
    var tiles = crossword.getElementsByClassName("tile");
    for(var i = 0; i < tiles.length; i++) {
        if(tiles[i].classList.contains("wrong")) {
            tiles[i].classList.remove("wrong");
        }
        if(tiles[i].classList.contains("correct")) {
            tiles[i].classList.remove("correct");
        }
    }
}

function checkDone() {
    if(completed == needed) {
        var tiles = crossword.getElementsByClassName("tile");
        for(var i = 0; i < tiles.length; i++) {
            var x = parseInt(tiles[i].parentElement.dataset.x);
            var y = parseInt(tiles[i].parentElement.dataset.y);
            var targetWord = getWords(x, y)[0];
            var index;
            if(targetWord.direction == "horizontal") {
                index = x - targetWord.xStart;
            }
            else if(targetWord.direction == "vertical") {
                index = y - targetWord.yStart;
            }
            var correct = targetWord.word.charAt(index);
            if(tiles[i].value.toLowerCase() != correct) {
                return false;
            }
        }
        done();
    }
}

function clearIncorrect() {
    var tiles = crossword.getElementsByClassName("tile");
    if(!autocheck) {
        checkAll();
    }
    for(var i = 0; i < tiles.length; i++) {
        if(tiles[i].classList.contains("wrong")) {
            tiles[i].value = "";
            tiles[i].classList.remove("wrong");
        }
        if(!autocheck) {
            if(tiles[i].classList.contains("correct")) {
                tiles[i].classList.remove("correct");
            }
        }
    }
}

function clearPuzzle() {
    var tiles = crossword.getElementsByClassName("tile");
    for(var i = 0; i < tiles.length; i++) {
        tiles[i].value = "";
        if(tiles[i].classList.contains("correct")) {
            tiles[i].classList.remove("correct");
        }
        if(tiles[i].classList.contains("wrong")) {
            tiles[i].classList.remove("wrong");
        }
    }
    clearPuzzleModalCancel();
}

function clearPuzzleModal() {
    var modal = document.getElementById("modal-clear-confirm");
    var resumeBtn = document.getElementById("resume");
    modal.classList.add("active");
    resumeBtn.classList.add("hide");
    pause();
}

function clearPuzzleModalCancel() {
    var modal = document.getElementById("modal-clear-confirm");
    var resumeBtn = document.getElementById("resume");
    modal.classList.remove("active");
    resumeBtn.classList.remove("hide");
    resume();
}

function click() {
    var x = parseInt(this.parentElement.dataset.x);
    var y = parseInt(this.parentElement.dataset.y);
    var targetWords = getWords(x, y);
    
    if(targetWords.length > 1) {
        if(direction == "horizontal") {
            direction = "vertical";
        }
        else if(direction == "vertical") {
            direction = "horizontal";
        }
    }
    else {
        direction = targetWords[0].direction;
    }
    
    highlightTiles(this);
    for(var i = 0; i < targetWords.length; i++) {
        if(targetWords[i].direction == direction) {
            highlightHint(targetWords[i]);
        }
    }
}

function createBlocks() {
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var block = document.createElement("div");
            block.classList.add("block");
            block.dataset.x = x;
            block.dataset.y = y;
            if(!isTile(x, y) && x == width - 1) {
                block.classList.add("edgex")
            }
            if(!isTile(x, y) && y == height - 1) {
                block.classList.add("edgey")
            }
            if(isTile(x, y)) {
                var tile = document.createElement("input");
                tile.classList.add("tile");
                tile.maxLength = 1;
                tile.type = "text";
                block.appendChild(tile);
            }
            if(isStart(x, y)) {
                var wordnum = document.createElement("span");
                var targetWords = getWords(x, y);
                wordnum.classList.add("wordnum");
                for(var i = 0; i < targetWords.length; i++) {
                    if(targetWords[i].xStart == x && targetWords[i].yStart == y) {
                        wordnum.innerHTML = targetWords[i].index;
                    }
                }
                block.appendChild(wordnum);
            }
            crossword.appendChild(block);
        }
    }
}

function createHints() {
    var across = document.getElementById("hints-across");
    var down = document.getElementById("hints-down");
    for(var i = 0; i < words.length; i++) {
        var word = words[i];
        var hint = document.createElement("div");
        var text = document.createElement("p");
        var num = document.createElement("span");
        hint.addEventListener("click", hintClick);
        hint.classList.add("hint");
        text.classList.add("hint-text");
        num.classList.add("hint-num");
        text.innerHTML = word.hint;
        num.innerHTML = word.index;
        hint.dataset.index = word.index;
        hint.appendChild(num);
        hint.appendChild(text);
        if(word.direction == "horizontal") {
            across.appendChild(hint);
        }
        else if(word.direction == "vertical") {
            down.appendChild(hint);
        }
    }
}

function done() {
    var modal = document.getElementById("modal-done");
    var btnResume = document.getElementById("resume");
    modal.classList.add("active");
    btnResume.classList.add("hide");
    pause();
}

function focus() {
    var x = parseInt(this.parentElement.dataset.x);
    var y = parseInt(this.parentElement.dataset.y);
    var targetWords = getWords(x, y);
    
    if(targetWords.length == 1) {
        direction = targetWords[0].direction;
    }
    
    this.select();
}

function getBlockIndex(x, y) {
    return (y * width) + x;
}

function getTile(x, y) {
    var index = getBlockIndex(x, y);
    var block = blocks[index];
    if(block != undefined) {
        var tiles = block.getElementsByClassName("tile");
        return tiles[0];
    }
}

function getWords(x, y) {
    var targetWords = [];
    for(var i = 0; i < words.length; i++) {
        var word = words[i];
        if(x >= word.xStart && x <= word.xEnd && y >= word.yStart && y <= word.yEnd) {
            targetWords.push(word);
        }
    }
    return targetWords;
}

function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.screenX;
    lastMouseY = event.screenY;
}

function handleMouseMove(event) {
    if(mouseDown) {
        var deltaX = (lastMouseX - event.screenX) / 10;
        var deltaY = (lastMouseY - event.screenY) / 10;
        var primary = document.getElementById("primary");
        primary.scrollTo(primary.scrollLeft + deltaX, primary.scrollTop + deltaY);
    }
}

function handleMouseUp() {
    mouseDown = false;
}

function highlightHint(word) {
    var container = document.getElementById("hints");
    var hints = container.getElementsByClassName("hint");
    highlightHintClear();
    for(var i = 0; i < hints.length; i++) {
        var hintText = hints[i].getElementsByClassName("hint-text")[0].innerHTML;
        if(word.hint == hintText) {
            hints[i].classList.add("highlight");
            hints[i].scrollIntoView();
        }
    }
}

function highlightHintClear() {
    var container = document.getElementById("hints");
    var hints = container.getElementsByClassName("hint");
    for(var i = 0; i < hints.length; i++) {
        hints[i].classList.remove("highlight");
    }
}

function highlightTiles(tile) {
    highlightTilesClear();
    
    var x = parseInt(tile.parentElement.dataset.x);
    var y = parseInt(tile.parentElement.dataset.y);
    
    tile.classList.add("highlight");
    
    if(direction == "horizontal") {
        var lx = x;
        while(isTile(lx - 1, y)) {
            lx--;
            tile = getTile(lx, y);
            tile.classList.add("highlight");
        }
        var rx = x;
        while(isTile(rx + 1, y)) {
            rx++;
            tile = getTile(rx, y);
            tile.classList.add("highlight");
        }
    }
    else if(direction == "vertical") {
        var ay = y;
        while(isTile(x, ay - 1)) {
            ay--;
            tile = getTile(x, ay);
            tile.classList.add("highlight");
        }
        var by = y;
        while(isTile(x, by + 1)) {
            by++;
            tile = getTile(x, by);
            tile.classList.add("highlight");
        }
    }
}

function highlightTilesClear() {
    var tiles = crossword.getElementsByClassName("tile");
    for(var i = 0; i < tiles.length; i++) {
        if(tiles[i].classList.contains("highlight")) {
            tiles[i].classList.remove("highlight");
        }
    }
}

function hintClick() {
    var hintText = this.getElementsByClassName("hint-text")[0].innerHTML;
    for(var i = 0 ; i < words.length; i++) {
        if(words[i].hint == hintText) {
            var target = getBlockIndex(words[i].xStart, words[i].yStart);
            var blocks = crossword.getElementsByClassName("block");
            var targetBlock = blocks[target];
            var targetInput = targetBlock.getElementsByClassName("tile")[0];
            direction = words[i].direction;
            targetInput.focus();
            highlightHint(words[i]);
            highlightTiles(targetInput);
        }
    }
}

function isStart(x, y) {
    for(var i = 0; i < words.length; i++) {
        var cword = words[i];
        if(cword.xStart == x && cword.yStart == y) {
            return true;
        }
    }
    return false;
}

function isTile(x, y) {
    for(var i = 0; i < words.length; i++) {
        var cword = words[i];
        if(x >= cword.xStart && x <= cword.xEnd && y >= cword.yStart && y <= cword.yEnd) {
            return true;
        }
    }
    return false;
}

function indexWords() {
    var index = 1;
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            if(isStart(x, y)) {
                var targetWords = getWords(x, y);
                for(var i = 0; i < targetWords.length; i++) {
                    if(targetWords[i].xStart == x && targetWords[i].yStart == y) {
                        targetWords[i].index = index;
                    }
                }
                index++;
            }
        }
    }
    words.sort(sortWordByIndex);
}

function init() {
    var xMax = 0;
    var yMax = 0;
    var container = document.getElementById("crossword-container");
    
    crossword = document.getElementById("crossword");
    blocks = crossword.children;
    direction = "vertical";
    
    calcEndPoints();
    
    for(var i = 0; i < words.length; i++) {
        if(words[i].xEnd > xMax) {
            xMax = words[i].xEnd;
        }
        if(words[i].yEnd > yMax) {
            yMax = words[i].yEnd;
        }
    }
    width = xMax + 1;
    height = yMax + 1;
    crossword.style.width = (width * 48) + 2 + "px";
    container.style.width = ((width * 48) + 2) + 40 + "px";
    
    indexWords();
    createBlocks();
    listen();
    createHints();
    calcNeeded();
    
    timer = setInterval(tick, 1000);
}

function keydown(event) {
    event.preventDefault();
    if(event.key == "Backspace" || event.key == "Delete") {
        if(this.value != "") {
            completed--;
        }
        this.value = "";
        prev(this);
    }
    else if(event.key == "Tab") {
        next(this);
    }
    else if(event.key == "ArrowUp" && direction == "vertical") {
        prev(this);
    }
    else if(event.key == "ArrowDown" && direction == "vertical") {
        next(this);
    }
    else if(event.key == "ArrowLeft" && direction == "horizontal") {
        prev(this);
    }
    else if(event.key == "ArrowRight" && direction == "horizontal") {
        next(this);
    }
    else if(event.keyCode >= 48 && event.keyCode <= 90) {
        if(this.value == "") {
            completed++;
        }
        this.value = event.key;
        next(this);
        checkDone();
    }
}

function listen() {
    var tiles = crossword.getElementsByClassName("tile");
    var wordnums = crossword.getElementsByClassName("wordnum");
    var i;
    
    if(!debug) {
        window.addEventListener("blur", pause);
    }
    
    document.addEventListener("click", function() {
        if(!event.target.classList.contains("tile") && !event.target.classList.contains("wordnum") && !event.target.classList.contains("hint") && !event.target.classList.contains("hint-num") && !event.target.classList.contains("hint-text")) {
            highlightTilesClear();
            highlightHintClear();
        }
    });
    
    var primary = document.getElementById("primary");
    primary.addEventListener("mousedown", handleMouseDown);
    primary.addEventListener("mousemove", handleMouseMove);
    primary.addEventListener("mouseup", handleMouseUp);
    
    
    for(i = 0; i < tiles.length; i++) {
        tiles[i].addEventListener("click", click);
        tiles[i].addEventListener("blur", blur);
        tiles[i].addEventListener("focus", focus);
        tiles[i].addEventListener("keydown", keydown);
    }
    
    for(i = 0; i < wordnums.length; i++) {
        wordnums[i].addEventListener("click", wordnum_click);
    }
    
    var btnPuase = document.getElementById("pause");
    btnPuase.addEventListener("click", pause);
    
    var btnResume = document.getElementById("resume");
    btnResume.addEventListener("click", resume);
    
    var btnClearIncorrect = document.getElementById("clear-incorrect");
    btnClearIncorrect.addEventListener("click", clearIncorrect);
    
    var btnClearPuzzle = document.getElementById("clear-puzzle");
    btnClearPuzzle.addEventListener("click", clearPuzzleModal);
    
    var btnClearPuzzleConfirm = document.getElementById("clear-confirm");
    btnClearPuzzleConfirm.addEventListener("click", clearPuzzle);
    
    var btnClearPuzzleCancel = document.getElementById("clear-cancel");
    btnClearPuzzleCancel.addEventListener("click", clearPuzzleModalCancel);
    
    var btnAutocheck = document.getElementById("autocheck");
    btnAutocheck.addEventListener("click", toggleAutocheck);
    
}

function next(tile) {
    var x = parseInt(tile.parentElement.dataset.x);
    var y = parseInt(tile.parentElement.dataset.y);
    var next;
    
    if(direction == "horizontal") {
        next = getTile(x + 1, y);
    }
    else if(direction == "vertical") {
        next = getTile(x, y + 1);
    }
    if(next != undefined) {
        next.select();
    }
}

function pause() {
    var controls = document.getElementById("controls");
    var main = document.getElementById("main");
    var overlay = document.getElementById("overlay");
    
    controls.classList.add("blur");
    main.classList.add("blur");
    overlay.classList.add("active");
    
    window.clearInterval(timer);
}

function prev(tile) {
    var x = parseInt(tile.parentElement.dataset.x);
    var y = parseInt(tile.parentElement.dataset.y);
    var prev;
    
    if(direction == "horizontal") {
        prev = getTile(x - 1, y);
    }
    else if(direction == "vertical") {
        prev = getTile(x, y - 1);
    }
    if(prev != undefined) {
        prev.select();
    }
}

function resume() {
    var controls = document.getElementById("controls");
    var main = document.getElementById("main");
    var overlay = document.getElementById("overlay");
    
    controls.classList.remove("blur");
    main.classList.remove("blur");
    overlay.classList.remove("active");
    
    timer = setInterval(tick, 1000);
}

function sortWordByIndex(a, b) {
    if(a.index > b.index) {
        return 1;
    }
    else if(a.index == b.index) {
        return 0;
    }
    return -1;
}

function tick() {
    var minutes = document.getElementById("timer-minutes");
    var seconds = document.getElementById("timer-seconds");
    var sval = parseInt(seconds.innerHTML);
    var mval = parseInt(minutes.innerHTML);
    
    sval++;
    if(sval < 10) {
        seconds.innerHTML = "0" + sval;
    }
    else {
        seconds.innerHTML = sval;
    }
    
    if(sval >= 60) {
        seconds.innerHTML = "00";
        mval++;
        if(mval < 10) {
            minutes.innerHTML = "0" + mval;
        }
        else {
            minutes.innerHTML = mval;
        }
    }
}

function toggleAutocheck() {
    var chip = document.getElementById("chip");
    var val = chip.innerHTML;
    if(val == "off") {
        chip.classList.remove("off");
        chip.classList.add("on");
        chip.innerHTML = "on";
        autocheck = true;
        checkAll();
    }
    else if(val == "on") {
        chip.classList.remove("on");
        chip.classList.add("off");
        chip.innerHTML = "off";
        autocheck = false;
        checkClear();
    }
}

function wordnum_click() {
    var block = this.parentElement;
    var tile = block.getElementsByClassName("tile");
    tile[0].select();
    highlightTiles(tile[0]);
}

window.addEventListener("load", init);
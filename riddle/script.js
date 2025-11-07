const answer = 'echo';
const guessInput = document.getElementById('guessInput');
const guessBtn = document.getElementById('guessBtn');
const hintBtn = document.getElementById('hintBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const feedback = document.getElementById('feedback');
const hintArea = document.getElementById('hintArea');
const answerArea = document.getElementById('answerArea');
const answerText = document.getElementById('answerText');

let hints = [
  'It often repeats what you say, but it isn\'t a person.',
  'You can hear it in caves or when you shout across a valley.',
  'It is a reflection — but of sound.'
];
let hintIndex = 0;

function normalize(s){
  return (s||'').trim().toLowerCase();
}

function showHint(){
  if(hintIndex >= hints.length){
    hintArea.textContent = 'No more hints. Try your best guess!';
    return;
  }
  hintArea.textContent = `Hint ${hintIndex+1}: ${hints[hintIndex]}`;
  hintIndex++;
}

function reveal(winner=false){
  answerArea.classList.remove('hidden');
  answerText.textContent = answer.charAt(0).toUpperCase() + answer.slice(1);
  if(winner){
    feedback.textContent = 'Nice! That is correct — well done.';
  } else {
    feedback.textContent = 'Here is the answer.';
  }
}

guessBtn.addEventListener('click', () => {
  const g = normalize(guessInput.value);
  if(!g){ feedback.textContent = 'Please enter a guess or ask for a hint.'; return; }
  if(g === answer){
    reveal(true);
  } else {
    feedback.textContent = 'Not quite. Try again or type "hint".';
  }
});

hintBtn.addEventListener('click', () => showHint());

giveUpBtn.addEventListener('click', () => reveal(false));

// allow pressing Enter to submit guess
guessInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    guessBtn.click();
  }
});

// allow the user to type the word "hint" or "give up" into the input as shortcuts
guessInput.addEventListener('input', (e) => {
  const val = normalize(e.target.value);
  if(val === 'hint'){
    e.target.value = '';
    showHint();
  } else if(val === 'give up' || val === 'giveup' || val === 'give-up'){
    e.target.value = '';
    reveal(false);
  }
});

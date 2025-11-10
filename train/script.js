document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('submit-btn');
    const message = document.getElementById('message');
    const hint = document.getElementById('hint');

    let attempts = 0;
    const correctPassword = 'my dearest, Maria';

    submitBtn.addEventListener('click', function() {
        const enteredPassword = passwordInput.value.trim();
        if (enteredPassword === correctPassword) {
            message.textContent = 'Welcome aboard the Astral Express!';
            message.style.color = '#55efc4';
            hint.style.display = 'none';
            // Here you could redirect to the next part or load the train interface
        } else {
            attempts++;
            if (attempts >= 2) {
                hint.style.display = 'block';
            }
            message.textContent = 'Incorrect password. Please try again.';
            message.style.color = '#ff7675';
        }
    });

    // Allow pressing Enter to submit
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
});
// Cat stats
let catStats = {
    hunger: 100,
    happiness: 100,
    cleanliness: 100
};

// Load saved stats
function loadStats() {
    const saved = localStorage.getItem('catStats');
    if (saved) {
        catStats = JSON.parse(saved);
    }
    updateUI();
}

// Save stats
function saveStats() {
    localStorage.setItem('catStats', JSON.stringify(catStats));
}

// Update UI
function updateUI() {
    // Update bars
    document.getElementById('hungerBar').style.width = catStats.hunger + '%';
    document.getElementById('happinessBar').style.width = catStats.happiness + '%';
    document.getElementById('cleanlinessBar').style.width = catStats.cleanliness + '%';
    
    // Update values
    document.getElementById('hungerValue').textContent = Math.round(catStats.hunger) + '%';
    document.getElementById('happinessValue').textContent = Math.round(catStats.happiness) + '%';
    document.getElementById('cleanlinessValue').textContent = Math.round(catStats.cleanliness) + '%';
    
    // Update cat appearance
    const cat = document.getElementById('cat');
    if (catStats.cleanliness < 30) {
        cat.classList.add('dirty');
    } else {
        cat.classList.remove('dirty');
    }
    
    saveStats();
}

// Show message
function showMessage(message, emotion) {
    const messageEl = document.getElementById('statusMessage');
    const cat = document.getElementById('cat');
    
    messageEl.textContent = message;
    
    // Remove previous emotion classes
    cat.classList.remove('happy', 'sad');
    
    // Add emotion class
    if (emotion) {
        cat.classList.add(emotion);
        setTimeout(() => cat.classList.remove(emotion), 500);
    }
    
    // Clear message after 2 seconds
    setTimeout(() => {
        messageEl.textContent = '';
    }, 2000);
}

// Feed cat
function feedCat() {
    if (catStats.hunger >= 95) {
        showMessage("I'm so full, but okay! 😸", 'happy');
        catStats.happiness = Math.min(100, catStats.happiness + 5);
    } else {
        catStats.hunger = Math.min(100, catStats.hunger + 30);
        catStats.happiness = Math.min(100, catStats.happiness + 10);
        showMessage("Yummy! Thanks! 😋", 'happy');
    }
    
    updateUI();
}

// Play with cat
function playCat() {
    if (catStats.happiness >= 95) {
        showMessage("More playtime! Yay! 🎉", 'happy');
    } else {
        showMessage("That was fun! 🎉", 'happy');
    }
    
    catStats.happiness = Math.min(100, catStats.happiness + 30);
    catStats.hunger = Math.max(0, catStats.hunger - 10);
    catStats.cleanliness = Math.max(0, catStats.cleanliness - 15);
    
    updateUI();
}

// Bath cat
function bathCat() {
    if (catStats.cleanliness >= 95) {
        showMessage("Another bath?! Noooo! 😾", 'sad');
        catStats.happiness = Math.max(0, catStats.happiness - 10);
    } else {
        showMessage("I hate baths! 💦😿", 'sad');
        catStats.happiness = Math.max(0, catStats.happiness - 20);
    }
    
    catStats.cleanliness = 100;
    updateUI();
}

// Decrease stats over time
function decreaseStats() {
    catStats.hunger = Math.max(0, catStats.hunger - 0.5);
    catStats.happiness = Math.max(0, catStats.happiness - 0.3);
    catStats.cleanliness = Math.max(0, catStats.cleanliness - 0.2);
    
    updateUI();
    
    // Check for critical stats
    if (catStats.hunger < 20) {
        showMessage("I'm so hungry! 😿", 'sad');
    } else if (catStats.happiness < 20) {
        showMessage("I'm bored... 😔", 'sad');
    } else if (catStats.cleanliness < 20) {
        showMessage("I need a bath! 🤢", 'sad');
    }
}

// Initialize
loadStats();
setInterval(decreaseStats, 3000); // Decrease stats every 3 seconds

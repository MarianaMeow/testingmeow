document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password-input');
    const submitBtn = document.getElementById('submit-btn');
    const message = document.getElementById('message');
    const hint = document.getElementById('hint');
    const welcomeScreen = document.getElementById('welcome-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const mainMenu = document.getElementById('main-menu');

    let attempts = 0;
    const correctPassword = 'my dearest, Maria';

    submitBtn.addEventListener('click', function() {
        const enteredPassword = passwordInput.value.trim();
        if (enteredPassword === correctPassword) {
            message.textContent = 'Welcome aboard the Astral Express!';
            message.style.color = '#55efc4';
            hint.style.display = 'none';
            // Transition to loading screen
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                loadingScreen.style.display = 'flex';
                // After loading animation, show main menu as interior
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    mainMenu.style.display = 'flex';
                }, 5000); // 5 seconds for cinematic loading
            }, 1000);
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

    // Modal functionality for interactive objects
    const modal = document.getElementById('interaction-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Main menu interactive objects (stands inside train interior)
    const trashCans = [
        {
            id: 'map-stand',
            title: 'Navigator Console',
            content: `
            <h3>Navigator Console</h3>
            <div class="map-container">
                <svg width="400" height="250" viewBox="0 0 400 250" class="map-svg">
                    <circle cx="80" cy="125" r="25" fill="#55efc4" stroke="#ffffff" stroke-width="3" class="planet current-planet">
                        <title>Current Planet: Belobog</title>
                    </circle>
                    <circle cx="200" cy="100" r="20" fill="#74b9ff" stroke="#ffffff" stroke-width="2" class="planet">
                        <title>Next Planet: Xianzhou Luofu</title>
                    </circle>
                    <circle cx="320" cy="150" r="20" fill="#a29bfe" stroke="#ffffff" stroke-width="2" class="planet">
                        <title>Planet: Penacony</title>
                    </circle>
                    <line x1="105" y1="125" x2="180" y2="100" stroke="#ffffff" stroke-width="3" class="route" />
                    <line x1="220" y1="100" x2="300" y2="150" stroke="#ffffff" stroke-width="3" class="route" />
                    <text x="80" y="165" text-anchor="middle" fill="#ffffff" font-size="12">Belobog</text>
                    <text x="200" y="140" text-anchor="middle" fill="#ffffff" font-size="12">Xianzhou</text>
                    <text x="320" y="190" text-anchor="middle" fill="#ffffff" font-size="12">Penacony</text>
                </svg>
                <p><strong>Current Location:</strong> Belobog</p>
                <p><strong>Next Destination:</strong> Xianzhou Luofu</p>
                <p><strong>Travel Time:</strong> 2.5 Aeons</p>
            </div>
        `},
        {
            id: 'log-stand',
            title: 'Mission Log',
            content: `
            <h3>Mission Log</h3>
            <div class="log-entries">
                <div class="log-entry">
                    <h4>Day 1: Arrival at Belobog</h4>
                    <p>The Astral Express has arrived at the planet Belobog. Local time: 14:30. Crew status: Optimal.</p>
                </div>
                <div class="log-entry">
                    <h4>Day 2: Exploration Mission</h4>
                    <p>Conducting surface exploration. Discovered ancient ruins with potential for research.</p>
                </div>
                <div class="log-entry">
                    <h4>Day 3: Data Collection</h4>
                    <p>Collected valuable data on local ecosystem. Preparing for departure to next destination.</p>
                </div>
            </div>
        `},
        {
            id: 'inv-stand',
            title: 'Inventory',
            content: `
            <h3>Inventory Management</h3>
            <div class="inventory-grid">
                <div class="item">
                    <div class="item-icon">🔧</div>
                    <div class="item-name">Repair Kit</div>
                    <div class="item-count">x3</div>
                </div>
                <div class="item">
                    <div class="item-icon">⚡</div>
                    <div class="item-name">Energy Cells</div>
                    <div class="item-count">x12</div>
                </div>
                <div class="item">
                    <div class="item-icon">🗺️</div>
                    <div class="item-name">Star Maps</div>
                    <div class="item-count">x5</div>
                </div>
                <div class="item">
                    <div class="item-icon">💎</div>
                    <div class="item-name">Rare Minerals</div>
                    <div class="item-count">x8</div>
                </div>
            </div>
        `},
        {
            id: 'com-stand',
            title: 'Communications',
            content: `
            <h3>Communications Hub</h3>
            <div class="comm-log">
                <div class="message incoming">
                    <strong>Incoming from HQ:</strong> Mission parameters updated. Proceed to Xianzhou Luofu upon completion.
                </div>
                <div class="message outgoing">
                    <strong>To HQ:</strong> Acknowledged. Current mission status: 85% complete.
                </div>
                <div class="message incoming">
                    <strong>Incoming from Xianzhou:</strong> Welcome message received. Docking coordinates transmitted.
                </div>
            </div>
            <div class="comm-controls">
                <button class="comm-btn">Send Message</button>
                <button class="comm-btn">Emergency Signal</button>
            </div>
        `},
        {
            id: 'sys-stand',
            title: 'Settings',
            content: `
            <h3>System Settings</h3>
            <div class="settings-panel">
                <div class="setting">
                    <label>Auto-navigation:</label>
                    <input type="checkbox" checked>
                </div>
                <div class="setting">
                    <label>Emergency protocols:</label>
                    <input type="checkbox" checked>
                </div>
                <div class="setting">
                    <label>Life support systems:</label>
                    <input type="checkbox" checked>
                </div>
                <div class="setting">
                    <label>Communications array:</label>
                    <input type="checkbox" checked>
                </div>
                <div class="setting">
                    <label>Shield generators:</label>
                    <input type="checkbox">
                </div>
            </div>
            <button class="save-btn">Save Settings</button>
        `}
    ];

    trashCans.forEach(trash => {
        document.getElementById(trash.id).addEventListener('click', function() {
            modalBody.innerHTML = trash.content;
            modal.style.display = 'flex';

            // Add specific styling for modal content
            const style = document.createElement('style');
            style.textContent = `
                .map-container { background: rgba(0, 0, 0, 0.5); border-radius: 10px; padding: 15px; margin: 15px 0; }
                .log-entries { max-height: 300px; overflow-y: auto; }
                .log-entry { background: rgba(255, 255, 255, 0.1); padding: 10px; margin: 10px 0; border-radius: 5px; }
                .inventory-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                .item { background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px; text-align: center; }
                .comm-log { max-height: 200px; overflow-y: auto; margin-bottom: 20px; }
                .message { padding: 8px; margin: 5px 0; border-radius: 5px; }
                .incoming { background: rgba(85, 239, 196, 0.2); border-left: 3px solid #55efc4; }
                .outgoing { background: rgba(116, 185, 255, 0.2); border-left: 3px solid #74b9ff; }
                .comm-btn { background: #e94560; color: white; border: none; padding: 8px 15px; margin: 5px; border-radius: 5px; cursor: pointer; }
                .settings-panel { display: flex; flex-direction: column; gap: 10px; }
                .setting { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255, 255, 255, 0.1); border-radius: 5px; }
                .save-btn { background: #feca57; color: black; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 20px; }
            `;
            modalBody.appendChild(style);
        });
    });
});
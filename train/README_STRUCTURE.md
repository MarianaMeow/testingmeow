# Astral Express - Project Structure

## Overview
This project has been reorganized for better maintainability and scalability.

## Directory Structure

```
train/
├── index.html              # Main HTML file
├── script.js               # Main JavaScript (legacy - being phased out)
├── main.css                # Main CSS (legacy - being phased out)
├── css/                    # Modular CSS files
│   ├── base.css           # Base styles, body, animations
│   ├── welcome.css        # Welcome/login screen styles
│   ├── main-menu.css      # Main menu/train interior styles
│   ├── planets.css        # Planet selection and portal styles
│   └── games.css          # Mini-game specific styles
├── js/                     # Modular JavaScript files
│   ├── main.js            # Entry point (future)
│   ├── storage.js         # LocalStorage progress system
│   ├── navigation.js      # Screen navigation logic
│   └── games/             # Game-specific modules
│       ├── belobog.js     # Belobog trials
│       ├── xianzhou.js    # Xianzhou mirror memories
│       ├── penacony.js    # Penacony slot machine
│       ├── jarilo.js      # Jarilo puzzle
│       ├── herta.js       # Herta dimension portal
│       ├── luofu.js       # Luofu river stones
│       ├── stellaron.js   # Stellaron maze
│       └── terminus.js    # Terminus door
└── assets/                 # Images and other assets
    └── answer.svg

```

## Current Status

### ✅ Completed
- Bug fixes (duplicate event listeners, missing elements, global variables)
- LocalStorage progress saving system
- Initial CSS modularization (base.css, welcome.css)
- Initial JS modularization (storage.js)

### 🚧 In Progress
- Splitting remaining CSS into modular files
- Splitting remaining JS into game modules
- Updating HTML to use new modular structure

### 📋 To Do
- Complete CSS split (main-menu.css, planets.css, games.css)
- Complete JS split (all game modules)
- Update index.html to load modular files
- Test all functionality after migration
- Add mobile responsive styles

## Features

### Progress Saving
The game now automatically saves progress to localStorage:
- Unlocked planets
- Completed trials
- Collected shards
- Puzzle progress
- Login state (skip password on return)

### Bug Fixes
- Fixed duplicate event listeners in Penacony slot machine
- Removed references to non-existent Belobog forge elements
- Changed global `window.penaconyTicketReady` to local variable
- Cleaned up progress tracking functions

## Development Notes

To continue the modularization:
1. Extract CSS sections from main.css into appropriate module files
2. Extract game logic from script.js into game-specific modules
3. Update index.html to load all module files
4. Test each module independently
5. Ensure all save/load functionality works correctly

## Testing Checklist

- [ ] Password login works
- [ ] Progress saves after each action
- [ ] Progress loads on page refresh
- [ ] All planets unlock correctly
- [ ] All mini-games function properly
- [ ] No console errors
- [ ] Mobile responsive (future)

# Testing the Key Collection System

## Quick Test (Skip to Terminus)

To quickly test the key system without completing all planets:

### Option 1: Use Browser Console
1. Open the game in your browser
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Run this code to collect all keys:

```javascript
// Award all keys
collectedKeys = {
    belobog: true,
    xianzhou: true,
    penacony: true,
    jarilo: true,
    herta: true,
    luofu: true,
    stellaron: true,
    terminus: false
};

// Unlock Terminus planet
document.querySelector('.planet-option[data-planet="terminus"]').classList.remove('locked');
document.querySelector('.planet-option[data-planet="terminus"]').classList.add('unlocked');

// Save progress
saveProgress();

console.log('All keys collected! Navigate to Terminus to test the puzzle.');
```

### Option 2: Modify localStorage
1. Open Developer Tools (F12)
2. Go to Application tab → Local Storage
3. Find `astralExpressProgress`
4. Edit the JSON to include:

```json
{
  "collectedKeys": {
    "belobog": true,
    "xianzhou": true,
    "penacony": true,
    "jarilo": true,
    "herta": true,
    "luofu": true,
    "stellaron": true,
    "terminus": false
  }
}
```

## Full Test (Complete Journey)

### 1. Test Key Notifications
- Complete any planet challenge
- Watch for the key notification popup in the top-right
- Notification should show for 3 seconds with bouncing key icon

### 2. Test Key Collection
Complete each planet in order:

1. **Belobog** (🍭)
   - Complete all 3 fill-in-the-blank trials
   - Key awarded after third trial

2. **Xianzhou** (🌙)
   - Click red shard
   - Enter: "I love you, Miraizel"
   - Key awarded immediately

3. **Penacony** (🎰)
   - Complete 3 slot machine math problems
   - Key awarded after third correct answer

4. **Jarilo-VI** (❄️)
   - Complete the jigsaw puzzle (drag all 9 pieces)
   - Key awarded when puzzle complete

5. **Herta** (🔬)
   - Enter dimension portal
   - Click the missing piece
   - Key awarded when returning

6. **Luofu** (🪷)
   - Complete lotus flower memory game (3 rounds)
   - Key awarded after final round

7. **Stellaron** (⚡)
   - Navigate the shadow maze to the exit
   - Key awarded upon escape

### 3. Test Key Puzzle

1. Navigate to Terminus planet
2. Click the mysterious door
3. Verify:
   - Puzzle overlay opens
   - All collected keys appear on the right
   - Key count shows correct number (X/7)
   - 7 keyholes visible on the left

### 4. Test Drag and Drop

1. Try dragging a key to the WRONG keyhole:
   - Keyhole should glow RED
   - Key should NOT be placed
   - Key returns to collection

2. Try dragging a key to the CORRECT keyhole:
   - Keyhole should glow GREEN
   - Key should be placed with animation
   - Key disappears from collection
   - Keyhole marked as filled (gold border)

3. Try dragging to an already-filled keyhole:
   - Should not accept the key

### 5. Test Door Unlock

1. Place all 7 keys in their correct keyholes
2. Verify:
   - Puzzle closes automatically after ~0.5s
   - Door opening animation plays
   - Label updates with success message
   - Alert appears with completion message
   - Terminus key awarded (8th key)

### 6. Test Session Persistence

1. Collect some keys
2. Refresh the page (F5)
3. Login again
4. Navigate to Terminus
5. Click door
6. Verify collected keys are still there

### 7. Test Tab Close (Progress Reset)

1. Collect some keys
2. Close the tab/browser completely
3. Open the game again in a new tab
4. Verify progress is reset (must login again, no keys collected)

### 8. Test Close Button

1. Open key puzzle
2. Click the X button in top-right
3. Verify puzzle closes
4. Reopen puzzle
5. Verify keys are still there (not lost)

## Expected Behaviors

✅ **Correct:**
- Keys awarded automatically on planet completion
- Notification appears for 3 seconds
- Keys persist during session (same tab)
- Progress resets when tab/browser closes
- Only matching keys can be placed
- Visual feedback is clear
- Door opens when all keys placed

❌ **Incorrect:**
- Keys not appearing in puzzle
- Drag and drop not working
- Wrong keys being accepted
- Keys disappearing after refresh
- Door not opening after all keys placed

## Troubleshooting

### Keys not appearing in puzzle
- Check browser console for errors
- Verify `collectedKeys` object in localStorage
- Ensure SVG files are in `train/assets/` folder

### Drag and drop not working
- Check if `draggable="true"` on key elements
- Verify event listeners are attached
- Check browser console for JavaScript errors

### Door not opening
- Verify all 7 keyholes are filled
- Check `checkAllKeysPlaced()` function
- Look for console errors

### Keys not persisting during session
- Check sessionStorage in Developer Tools (not localStorage!)
- Verify `saveProgress()` is being called
- Check for sessionStorage quota issues
- Note: Progress SHOULD reset when closing tab (this is intentional)

## Browser Compatibility

Tested on:
- Chrome/Edge (recommended)
- Firefox
- Safari

Note: Drag and drop may behave slightly differently across browsers.

# Session Storage - Progress Reset on Tab Close

## What Changed

The game now uses **sessionStorage** instead of **localStorage**, which means:

### ✅ Progress Persists:
- During the same browser session
- When refreshing the page (F5)
- When navigating between pages in the same tab

### ❌ Progress Resets:
- When closing the tab
- When closing the browser
- When opening the game in a new tab

## Why This Change?

This creates a **single-session experience** where users must complete the journey in one sitting, making it more engaging and focused.

## Technical Details

### Before (localStorage):
```javascript
localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
const saved = localStorage.getItem(STORAGE_KEY);
```
- Data persists indefinitely
- Survives browser/tab closes
- Shared across all tabs

### After (sessionStorage):
```javascript
sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
const saved = sessionStorage.getItem(STORAGE_KEY);
```
- Data cleared when tab closes
- Isolated per tab
- Fresh start each session

## User Experience

### Scenario 1: Refresh Page ✅
1. User collects 3 keys
2. User refreshes page (F5)
3. **Result**: Keys are still there!

### Scenario 2: Close Tab ❌
1. User collects 3 keys
2. User closes the tab
3. User opens game in new tab
4. **Result**: Progress reset, must start over

### Scenario 3: Multiple Tabs 🔄
1. User opens game in Tab A
2. User collects 3 keys in Tab A
3. User opens game in Tab B
4. **Result**: Tab B has separate progress (starts fresh)

## Testing

### Test Session Persistence:
```javascript
// In browser console
console.log('Session Storage:', sessionStorage.getItem('astralExpressProgress'));
```

### Test Tab Close Reset:
1. Play the game and collect some keys
2. Close the tab completely
3. Open game in new tab
4. Verify you must login again and have no keys

### Clear Session Manually:
```javascript
// In browser console
sessionStorage.clear();
location.reload();
```

## Developer Notes

### Files Modified:
- `train/js/storage.js` - Changed storage API
- `train/script.js` - Updated comments
- Documentation files - Updated to reflect session-based storage

### Storage Key:
```javascript
const STORAGE_KEY = 'astralExpressProgress';
```

### Data Structure (Same):
```javascript
{
  unlockedPlanets: [],
  completedTrials: {...},
  penaconyShards: 0,
  xianzhouRedShardText: '',
  jariloCollectedPieces: 0,
  hasLoggedIn: true,
  collectedKeys: {...}
}
```

## Advantages of sessionStorage

1. **Fresh Experience**: Each session is a new journey
2. **Privacy**: No persistent data on user's device
3. **Simplicity**: No need for "clear progress" button
4. **Focus**: Encourages completing in one sitting
5. **Testing**: Easy to reset by closing tab

## Disadvantages

1. **No Long-term Save**: Can't continue later
2. **Accidental Close**: Lose progress if tab closes
3. **No Cross-tab**: Can't share progress between tabs

## Reverting to localStorage

If you want to go back to persistent storage:

```javascript
// In storage.js, change:
sessionStorage.setItem(...)  →  localStorage.setItem(...)
sessionStorage.getItem(...)  →  localStorage.getItem(...)
sessionStorage.removeItem(...) →  localStorage.removeItem(...)
```

## Browser Support

sessionStorage is supported in all modern browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## Summary

Your game now provides a **single-session experience** where progress is maintained during the session but resets when the tab closes. This creates a more focused, engaging experience where users complete the journey in one sitting! 🎮

# 🧪 Feature Testing Guide

## Quick Test Checklist

### Phase 1 Features:
1. **Floating Stars** ⭐
   - [ ] Stars visible on all screens
   - [ ] Stars twinkle and drift
   - [ ] 3 different layers visible

2. **Mute Toggle** 🔇
   - [ ] Button visible top-right
   - [ ] Click toggles icon (🔊 ↔ 🔇)
   - [ ] Press `M` key toggles mute
   - [ ] State persists in session

3. **Progress Bar** 🚂
   - [ ] 8 train cars visible at top
   - [ ] Cars light up when keys collected
   - [ ] Hover shows planet name

4. **Keyboard Shortcuts** ⌨️
   - [ ] `ESC` closes modals
   - [ ] `Enter` submits forms
   - [ ] `M` toggles mute
   - [ ] `S` opens settings
   - [ ] `H` shows help
   - [ ] `K` shows collected keys

### Phase 2 Features:
5. **Settings Panel** ⚙️
   - [ ] Click ⚙️ button (bottom-right) opens panel
   - [ ] Press `S` opens panel
   - [ ] Music volume slider works
   - [ ] SFX volume slider works
   - [ ] Toggles work (particles, trails, animations)
   - [ ] Reset progress button works
   - [ ] `ESC` closes panel

6. **Key Preview** 👁️
   - [ ] Hover over locked planet shows tooltip
   - [ ] Tooltip shows key icon and name
   - [ ] Tooltip follows cursor position

7. **Fade Transitions** 🎬
   - [ ] Screen changes fade to black
   - [ ] Stars visible during transition
   - [ ] Smooth 0.6s duration

8. **Loading Indicator** ⏳
   - [ ] Mini train appears during loading
   - [ ] Train wheels spin
   - [ ] Loading text displays

### Phase 3 Features:
9. **Key Collection Animation** 🔑
   - [ ] Key spawns on planet with spin
   - [ ] Key flies in arc to top-right
   - [ ] Key shrinks into notification
   - [ ] Notification slides in
   - [ ] Total animation ~1.8s

10. **Cursor Trails** ✨
    - [ ] Move mouse to see trail particles
    - [ ] Random star shapes (⭐✨💫🌟)
    - [ ] Particles fade after 1s
    - [ ] Can toggle in settings
    - [ ] Max 20 particles at once

11. **Key Descriptions** 📖
    - [ ] Press `K` to view collected keys
    - [ ] Click collected key to see lore
    - [ ] Modal shows icon, name, description, lore
    - [ ] `ESC` closes modal
    - [ ] Locked keys show as grayed out

12. **Audio System** 🎵
    - [ ] Console logs show audio would play
    - [ ] Volume sliders affect logged volume
    - [ ] Mute state affects audio
    - [ ] Ready for audio files

13. **Randomization** 🔄
    - [ ] Jarilo puzzle pieces randomized on load
    - [ ] Pieces scattered around frame
    - [ ] Different positions each session

## Console Commands for Testing

Open browser console (F12) and try:

```javascript
// Test settings panel
openSettings();
closeSettings();

// Test key preview
showKeyPreview('belobog', document.body);
hideKeyPreview();

// Test key description
showKeyDescription('belobog');

// Test cursor trail toggle
toggleTrail(false);  // Disable
toggleTrail(true);   // Enable

// Test audio (logs only)
playAmbientMusic('main-theme');
playSoundEffect('key-collect');

// Test randomization
randomizeJariloPuzzle();
randomizeHertaDimension();

// Test fade transition
fadeTransition(() => console.log('Transition complete!'));

// View collected keys
console.log(collectedKeys);

// Manually collect a key (for testing)
if (window.awardKey) {
    window.awardKey('belobog');
}
```

## Common Issues & Fixes

### Issue: Settings panel doesn't open
**Fix:** Check console for errors. Make sure `initSettingsPanel()` was called.

### Issue: Cursor trails not appearing
**Fix:** Check if trails are enabled in settings. Try `toggleTrail(true)` in console.

### Issue: Key preview not showing
**Fix:** Make sure you're hovering over a LOCKED planet (not collected yet).

### Issue: Keyboard shortcuts not working
**Fix:** Make sure you're not typing in an input field (except ESC).

### Issue: Functions undefined
**Fix:** Wait 100ms after page load. Functions initialize with setTimeout.

## Browser Console Checks

Should see these logs on page load:
```
[Phase 1] Floating stars initialized
[Phase 1] Mute toggle initialized
[Phase 1] Progress bar initialized
[Phase 1] Keyboard shortcuts initialized
[Phase 1] All enhancements initialized! 🚀
[Phase 2] Settings panel initialized
[Phase 2] Key preview initialized
[Phase 2] Visual polish features ready! ✨
[Phase 3] Cursor trail initialized
[Phase 3] Audio system initialized (ready for audio files)
[Phase 3] Jarilo puzzle randomized
[Phase 3] Advanced features ready! 🎨
```

## Manual Testing Steps

1. **Load page** - Check console for initialization logs
2. **Press `S`** - Settings panel should slide in from right
3. **Move mouse** - Cursor trails should appear
4. **Press `K`** - Collected keys modal should appear
5. **Press `H`** - Help modal should show
6. **Click ⚙️** - Settings should open
7. **Hover planet** - Tooltip should appear (if locked)
8. **Complete puzzle** - Key animation should play

## Expected Behavior

- All features should work immediately after page load
- No console errors
- Smooth animations
- Responsive to keyboard and mouse
- Settings persist in sessionStorage
- Progress saves during session

---

**If features still don't work:**
1. Check browser console for errors
2. Verify `collectedKeys` is defined globally
3. Check that all init functions are called
4. Try hard refresh (Ctrl+Shift+R)
5. Clear sessionStorage and reload

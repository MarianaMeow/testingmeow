document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".card");
  const cover = document.querySelector(".card-cover");

  if (!card || !cover) return;

  // Set initial state as closed for 3D tilt
  card.classList.add("closed");

  const toggleOpen = () => {
    const isOpen = card.classList.contains("open");
    if (isOpen) {
      // Close
      card.classList.remove("open");
      card.classList.add("closed");
    } else {
      // Open
      card.classList.remove("closed");
      card.classList.add("open");
    }
  };

  // Click to open/close
  cover.addEventListener("click", toggleOpen);

  // Also allow clicking anywhere on card when open to slightly wiggle (cute effect)
  card.addEventListener("click", (e) => {
    // If clicking cover, it's already handled
    if (e.target.closest(".card-cover")) return;

    if (card.classList.contains("open")) {
      card.classList.add("wiggle");
      setTimeout(() => card.classList.remove("wiggle"), 300);
    }
  });
});
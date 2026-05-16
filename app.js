// DOM Elements
const leaderboardForm = document.getElementById('leaderboardForm');
const categoryInput = document.getElementById('categoryInput');
const generateBtn = document.getElementById('generateBtn');

// Event Listener for Form Submission
leaderboardForm.addEventListener('submit', async function(event) {
  // Prevent the default page reload
  event.preventDefault();
  
  const categoryName = categoryInput.value.trim();
  
  // Do nothing if the input is empty
  if (!categoryName) return;

  // 1. Set UI to Loading State
  const originalBtnText = generateBtn.textContent;
  generateBtn.textContent = 'Generating...';
  generateBtn.disabled = true;
  generateBtn.style.cursor = 'not-allowed';
  generateBtn.style.opacity = '0.7';

  try {
    console.log(`Initiating leaderboard generation for: ${categoryName}`);
    
    // Simulate a network request delay (1.5 seconds)
    // TODO: Replace this Promise block with your actual backend fetch() call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Placeholder success action
    alert(`Backend connection ready for:\n${categoryName}\n\n(Replace this alert with your data rendering logic)`);

  } catch (error) {
    console.error("Error generating leaderboard:", error);
    alert("There was an error connecting to the server. Please try again.");
  } finally {
    // 2. Restore UI to Default State
    generateBtn.textContent = originalBtnText;
    generateBtn.disabled = false;
    generateBtn.style.cursor = 'pointer';
    generateBtn.style.opacity = '1';
  }
});

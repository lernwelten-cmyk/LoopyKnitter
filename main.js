// LoopyKnitter - Modern Knitting Project Counter Logic
// Author: Generated with Claude Code

// Global State Variables
let projects = {};
let currentProject = null;
let actionHistory = [];
let isOneHandMode = false;

// Audio Elements
let clickSound;
let finishSound;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
  // Initialize audio elements
  clickSound = document.getElementById('clickSound');
  finishSound = document.getElementById('finishSound');

  // Set click sound volume for pleasant experience
  if (clickSound) {
    clickSound.volume = 0.3;
  }

  // Load data from localStorage
  loadProjectsFromStorage();
  loadOneHandModeFromStorage();

  // Initialize UI
  updateProjectList();
  setupEventListeners();
  registerServiceWorker();
});

// ===================
// Storage Functions
// ===================

function loadProjectsFromStorage() {
  const savedProjects = localStorage.getItem("knitProjects");
  if (savedProjects) {
    projects = JSON.parse(savedProjects);
  }
}

function loadOneHandModeFromStorage() {
  const savedMode = localStorage.getItem("oneHandMode");
  if (savedMode === "true") {
    isOneHandMode = true;
    document.querySelector('.container').classList.add('one-hand-mode');
    document.getElementById('oneHandToggle').classList.add('active');
  }
}

function saveProjects() {
  localStorage.setItem("knitProjects", JSON.stringify(projects));
}

function saveOneHandMode() {
  localStorage.setItem('oneHandMode', isOneHandMode.toString());
}

// ===================
// Audio Functions
// ===================

function playClickSound() {
  try {
    if (clickSound) {
      clickSound.currentTime = 0;
      clickSound.play().catch(e => console.log('Sound play failed:', e));
    }
  } catch (e) {
    console.log('Sound not available:', e);
  }
}

function playFinishSound() {
  try {
    if (finishSound) {
      finishSound.play().catch(e => console.log('Finish sound failed:', e));
    }
  } catch (e) {
    console.log('Finish sound not available:', e);
  }
}

// ===================
// Animation Functions
// ===================

function animateButton() {
  const button = document.getElementById('addButton');
  if (button) {
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 300);
  }
}

function animateCounter() {
  const counter = document.querySelector('.count-number');
  if (counter) {
    counter.classList.add('updated');
    setTimeout(() => {
      counter.classList.remove('updated');
    }, 400);
  }
}

function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.random() * colors.length | 0];
      confetti.style.animationDelay = Math.random() * 3 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';

      document.body.appendChild(confetti);

      // Remove confetti after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      }, 5000);
    }, i * 50);
  }
}

// ===================
// History Management
// ===================

function addToHistory(action) {
  actionHistory.push(action);

  // Keep only last 10 actions for performance
  if (actionHistory.length > 10) {
    actionHistory.shift();
  }

  updateUndoButton();
}

function updateUndoButton() {
  const undoButton = document.getElementById('undoButton');
  if (undoButton) {
    undoButton.disabled = actionHistory.length === 0;
  }
}

// ===================
// Core Functions
// ===================

function updateProjectList() {
  const select = document.getElementById("projectSelect");
  if (!select) return;

  select.innerHTML = "";

  // Populate project options
  for (let name in projects) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  }

  // Set current project
  if (currentProject && projects[currentProject]) {
    select.value = currentProject;
  } else if (Object.keys(projects).length > 0) {
    currentProject = Object.keys(projects)[0];
    select.value = currentProject;
  }

  updateDisplay();
}

function updateDisplay() {
  if (!currentProject || !projects[currentProject]) return;

  const proj = projects[currentProject];
  const addButton = document.getElementById("addButton");

  // Update counter display
  const countElement = document.getElementById("count");
  if (countElement) {
    countElement.textContent = proj.count;
  }

  // Calculate progress
  const percentage = Math.min(Math.round((proj.count / proj.goal) * 100), 100);
  const remaining = Math.max(proj.goal - proj.count, 0);

  // Update progress elements
  updateProgressElements(proj, percentage, remaining);

  // Update button states
  updateButtonStates(proj, addButton);
  updateUndoButton();
}

function updateProgressElements(proj, percentage, remaining) {
  // Update progress text
  const progressText = document.getElementById("progressText");
  if (progressText) {
    progressText.textContent = `${proj.count}/${proj.goal} Reihen (${percentage}%)`;
  }

  // Update progress percentage
  const progressPercent = document.getElementById("progressPercent");
  if (progressPercent) {
    progressPercent.textContent = `${percentage}%`;
  }

  // Update progress bar
  const progressFill = document.querySelector(".progress-fill");
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  // Update remaining text and completion status
  const remainingText = document.getElementById("remainingText");
  const completionMessage = document.getElementById("completionMessage");

  if (proj.count >= proj.goal) {
    // Goal reached
    if (remainingText) {
      remainingText.textContent = "🎉 Ziel erreicht!";
      remainingText.style.color = "var(--secondary-color)";
      remainingText.style.fontWeight = "600";
    }

    if (completionMessage) {
      completionMessage.textContent = "✅ Projekt abgeschlossen!";
      completionMessage.classList.add("show");
    }

    if (progressFill) {
      progressFill.classList.add("completed");
    }
  } else {
    // Goal not reached yet
    if (remainingText) {
      remainingText.textContent = `${remaining} Reihen verbleibend`;
      remainingText.style.color = "var(--text-secondary)";
      remainingText.style.fontWeight = "normal";
    }

    if (completionMessage) {
      completionMessage.classList.remove("show");
    }

    if (progressFill) {
      progressFill.classList.remove("completed");
    }
  }
}

function updateButtonStates(proj, addButton) {
  if (!addButton) return;

  if (proj.count >= proj.goal) {
    addButton.classList.add("disabled");
    addButton.disabled = true;
  } else {
    addButton.classList.remove("disabled");
    addButton.disabled = false;
  }
}

// ===================
// Event Handlers
// ===================

function setupEventListeners() {
  // Project Selection
  const projectSelect = document.getElementById("projectSelect");
  if (projectSelect) {
    projectSelect.addEventListener("change", (e) => {
      currentProject = e.target.value;
      updateDisplay();
    });
  }

  // Add Button (Plus Button)
  const addButton = document.getElementById("addButton");
  if (addButton) {
    addButton.addEventListener("click", handleAddButtonClick);
  }

  // Undo Button
  const undoButton = document.getElementById("undoButton");
  if (undoButton) {
    undoButton.addEventListener("click", handleUndoButtonClick);
  }

  // Reset Button
  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", handleResetButtonClick);
  }

  // New Project Button
  const newProjectButton = document.getElementById("newProject");
  if (newProjectButton) {
    newProjectButton.addEventListener("click", handleNewProjectButtonClick);
  }

  // One-Hand Mode Toggle
  const oneHandToggle = document.getElementById("oneHandToggle");
  if (oneHandToggle) {
    oneHandToggle.addEventListener("click", handleOneHandToggleClick);
  }
}

function handleAddButtonClick() {
  if (!currentProject) return;

  const proj = projects[currentProject];
  if (!proj) return;

  // Check if goal already reached
  if (proj.count >= proj.goal) return;

  const stepInput = document.getElementById("stepInput");
  const step = parseInt(stepInput ? stepInput.value : "1") || 1;
  const oldCount = proj.count;

  // Add to history before making changes
  addToHistory({
    type: 'add',
    project: currentProject,
    oldCount: oldCount,
    newCount: oldCount + step,
    step: step
  });

  // Update count
  proj.count += step;

  // Play audio feedback
  playClickSound();

  // Trigger animations
  animateButton();
  animateCounter();

  // Check if goal reached and trigger celebration
  if (proj.count >= proj.goal && oldCount < proj.goal) {
    setTimeout(() => {
      playFinishSound();
      createConfetti();
    }, 200);
  }

  // Save and update display
  saveProjects();
  updateDisplay();
}

function handleUndoButtonClick() {
  if (actionHistory.length === 0) return;

  const lastAction = actionHistory.pop();

  if (lastAction.type === 'add') {
    projects[lastAction.project].count = lastAction.oldCount;
  } else if (lastAction.type === 'reset') {
    projects[lastAction.project].count = lastAction.oldCount;
  }

  // Play feedback
  playClickSound();
  animateCounter();

  // Save and update
  saveProjects();
  updateDisplay();
}

function handleResetButtonClick() {
  if (!currentProject) return;

  if (confirm("Fortschritt wirklich zurücksetzen?")) {
    const oldCount = projects[currentProject].count;

    // Add to history
    addToHistory({
      type: 'reset',
      project: currentProject,
      oldCount: oldCount,
      newCount: 0
    });

    // Reset count and clear history
    projects[currentProject].count = 0;
    actionHistory = [];

    // Save and update
    saveProjects();
    updateDisplay();
  }
}

function handleNewProjectButtonClick() {
  const name = prompt("Name des neuen Projekts?");
  if (!name) return;

  const goal = parseInt(prompt("Maximale Reihenanzahl für dieses Projekt?")) || 100;

  // Create new project
  projects[name] = { count: 0, goal: goal };
  currentProject = name;
  actionHistory = []; // Clear history for new project

  // Save and update
  saveProjects();
  updateProjectList();
}

function handleOneHandToggleClick() {
  isOneHandMode = !isOneHandMode;
  const container = document.querySelector('.container');
  const toggle = document.getElementById('oneHandToggle');

  if (isOneHandMode) {
    container.classList.add('one-hand-mode');
    toggle.classList.add('active');
  } else {
    container.classList.remove('one-hand-mode');
    toggle.classList.remove('active');
  }

  // Save preference and play feedback
  saveOneHandMode();
  playClickSound();
}

// ===================
// Service Worker
// ===================

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// ===================
// Utility Functions
// ===================

// Ensure projects object exists and has valid structure
function validateProjectData() {
  if (typeof projects !== 'object' || projects === null) {
    projects = {};
  }

  // Validate each project
  for (let projectName in projects) {
    const project = projects[projectName];
    if (typeof project.count !== 'number' || project.count < 0) {
      project.count = 0;
    }
    if (typeof project.goal !== 'number' || project.goal <= 0) {
      project.goal = 100;
    }
  }
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateDisplay,
    updateProjectList,
    saveProjects,
    playClickSound,
    createConfetti,
    addToHistory
  };
}
// LoopyKnitter - Modern Knitting Project Counter Logic
// Author: Generated with Claude Code

// Global State Variables
let projects = {};
let currentProject = null;
let actionHistory = [];
let isOneHandMode = false;
let videos = [];
let undoVideoAction = null;

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
  loadVideosFromStorage();

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

function loadVideosFromStorage() {
  const savedVideos = localStorage.getItem("knitVideos");
  if (savedVideos) {
    videos = JSON.parse(savedVideos);
  }
}

function saveVideos() {
  localStorage.setItem("knitVideos", JSON.stringify(videos));
}

// ===================
// YouTube Video Functions
// ===================

function extractYouTubeId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

function validateYouTubeUrl(url) {
  const videoId = extractYouTubeId(url);
  return {
    isValid: !!videoId,
    videoId: videoId,
    error: !videoId ? 'Ungültiger YouTube-Link. Unterstützte Formate: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...' : null
  };
}

function createVideoId(youtubeId) {
  return `yt_${youtubeId}`;
}

function addVideo(url, title = '', projectIds = []) {
  const validation = validateYouTubeUrl(url);

  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const videoId = createVideoId(validation.videoId);

  // Check for duplicates
  const existingVideo = videos.find(v => v.id === videoId);
  if (existingVideo) {
    return {
      success: false,
      error: 'Video existiert bereits',
      existingVideo: existingVideo
    };
  }

  const video = {
    id: videoId,
    title: title || `YouTube Video ${validation.videoId}`,
    youtubeId: validation.videoId,
    thumbnail: `https://img.youtube.com/vi/${validation.videoId}/hqdefault.jpg`,
    projectIds: projectIds || [],
    favorite: false,
    addedAt: Date.now()
  };

  videos.push(video);
  saveVideos();

  return { success: true, video: video };
}

function removeVideo(videoId) {
  const index = videos.findIndex(v => v.id === videoId);
  if (index === -1) {
    return { success: false, error: 'Video nicht gefunden' };
  }

  const removedVideo = videos.splice(index, 1)[0];
  saveVideos();

  return { success: true, video: removedVideo };
}

function toggleFavorite(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) {
    return { success: false, error: 'Video nicht gefunden' };
  }

  video.favorite = !video.favorite;
  saveVideos();

  return { success: true, video: video };
}

function linkVideoToProject(videoId, projectId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) {
    return { success: false, error: 'Video nicht gefunden' };
  }

  if (!video.projectIds.includes(projectId)) {
    video.projectIds.push(projectId);
    saveVideos();
  }

  return { success: true, video: video };
}

function unlinkVideoFromProject(videoId, projectId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) {
    return { success: false, error: 'Video nicht gefunden' };
  }

  const index = video.projectIds.indexOf(projectId);
  if (index > -1) {
    video.projectIds.splice(index, 1);
    saveVideos();
  }

  return { success: true, video: video };
}

function getSortedVideos() {
  return videos.sort((a, b) => {
    // Favorites first
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;

    // Then by most recently added
    return b.addedAt - a.addedAt;
  });
}

function getVideosForProject(projectId) {
  return videos.filter(video => video.projectIds.includes(projectId));
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

  // Update video integration
  updateVideoIntegration();
}

function updateVideoIntegration() {
  if (!currentProject) return;

  // Show video indicator in project section if project has videos
  const projectVideos = getVideosForProject(currentProject);
  const projectSection = document.querySelector('.project-section');

  if (projectSection) {
    // Remove existing video indicator
    const existingIndicator = projectSection.querySelector('.project-video-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    // Add video indicator if project has videos
    if (projectVideos.length > 0) {
      const indicator = document.createElement('div');
      indicator.className = 'project-video-indicator';
      indicator.innerHTML = `🎥 ${projectVideos.length} Video${projectVideos.length > 1 ? 's' : ''} verfügbar`;
      indicator.onclick = () => {
        openBottomSheet();
        playClickSound();
      };
      projectSection.appendChild(indicator);
    }
  }
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
// Video UI Functions
// ===================

function renderVideosList() {
  const videosList = document.getElementById('videosList');
  if (!videosList) return;

  const sortedVideos = getSortedVideos();

  if (sortedVideos.length === 0) {
    videosList.innerHTML = `
      <div class="empty-videos-state">
        <span class="empty-icon">🎬</span>
        <p>Noch keine Videos gespeichert</p>
        <p class="empty-subtitle">Füge YouTube-Videos zu deinen Strickprojekten hinzu</p>
      </div>
    `;
    return;
  }

  videosList.innerHTML = sortedVideos.map(video => createVideoCard(video)).join('');
}

function createVideoCard(video) {
  const favoriteClass = video.favorite ? 'favorite' : '';
  const favoriteIcon = video.favorite ? '⭐' : '☆';
  const favoriteState = video.favorite ? 'active' : '';

  const projectTags = video.projectIds.map(projectId => {
    const projectName = projects[projectId] ? projectId : projectId;
    return `<span class="project-tag">${projectName}</span>`;
  }).join('');

  const addedDate = new Date(video.addedAt).toLocaleDateString('de-DE');

  return `
    <div class="video-card ${favoriteClass}" data-video-id="${video.id}">
      <div class="video-thumbnail" onclick="playVideo('${video.id}')">
        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
        <div class="play-overlay">▶️</div>
      </div>
      <div class="video-info">
        <h4 class="video-title">${video.title}</h4>
        <div class="video-projects">${projectTags}</div>
        <div class="video-meta">Hinzugefügt: ${addedDate}</div>
      </div>
      <div class="video-actions">
        <button
          class="video-action-button favorite ${favoriteState}"
          onclick="handleToggleFavorite('${video.id}')"
          aria-label="${video.favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}"
        >
          ${favoriteIcon}
        </button>
        <button
          class="video-action-button menu"
          onclick="showVideoMenu('${video.id}')"
          aria-label="Video-Menü öffnen"
        >
          ⋯
        </button>
      </div>
    </div>
  `;
}

function showVideoMenu(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) return;

  const isOnline = navigator.onLine;
  const menuItems = [
    {
      label: '▶️ Abspielen',
      action: () => playVideo(videoId),
      disabled: !isOnline
    },
    {
      label: video.favorite ? '☆ Aus Favoriten entfernen' : '⭐ Zu Favoriten hinzufügen',
      action: () => handleToggleFavorite(videoId)
    },
    {
      label: '🔗 Projekt zuordnen',
      action: () => showProjectLinkDialog(videoId)
    },
    {
      label: '🗑️ Entfernen',
      action: () => handleRemoveVideo(videoId),
      danger: true
    }
  ];

  // Simple implementation - in a real app you might want a proper context menu
  const menuText = menuItems
    .filter(item => !item.disabled)
    .map((item, index) => `${index + 1}. ${item.label}`)
    .join('\n');

  const choice = prompt(`Aktion wählen für "${video.title}":\n\n${menuText}\n\nEingabe (1-${menuItems.filter(item => !item.disabled).length}):`);

  if (choice) {
    const selectedIndex = parseInt(choice) - 1;
    const availableItems = menuItems.filter(item => !item.disabled);

    if (selectedIndex >= 0 && selectedIndex < availableItems.length) {
      availableItems[selectedIndex].action();
    }
  }
}

function playVideo(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) return;

  if (!navigator.onLine) {
    showSnackbar('Keine Internetverbindung - Videos können nur online abgespielt werden');
    return;
  }

  const modal = document.getElementById('videoPlayerModal');
  const iframe = document.getElementById('videoPlayerFrame');
  const title = document.getElementById('videoPlayerTitle');

  if (modal && iframe && title) {
    title.textContent = video.title;
    iframe.src = `https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Focus management for accessibility
    const closeButton = modal.querySelector('#closeVideoPlayer');
    if (closeButton) closeButton.focus();
  }
}

function closeVideoPlayer() {
  const modal = document.getElementById('videoPlayerModal');
  const iframe = document.getElementById('videoPlayerFrame');

  if (modal && iframe) {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    iframe.src = ''; // Stop video playback
  }
}

function handleToggleFavorite(videoId) {
  const result = toggleFavorite(videoId);
  if (result.success) {
    renderVideosList();
    playClickSound();

    const message = result.video.favorite
      ? 'Video zu Favoriten hinzugefügt'
      : 'Video aus Favoriten entfernt';
    showSnackbar(message);
  }
}

function handleRemoveVideo(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) return;

  if (confirm(`Video "${video.title}" wirklich entfernen?`)) {
    const result = removeVideo(videoId);
    if (result.success) {
      renderVideosList();
      playClickSound();

      // Store for undo functionality
      undoVideoAction = {
        type: 'remove',
        video: result.video
      };

      showSnackbar('Video entfernt', 'Rückgängig', () => {
        videos.push(undoVideoAction.video);
        saveVideos();
        renderVideosList();
        showSnackbar('Video wiederhergestellt');
        undoVideoAction = null;
      });
    }
  }
}

function openBottomSheet() {
  const bottomSheet = document.getElementById('videosBottomSheet');
  if (bottomSheet) {
    bottomSheet.classList.add('show');
    bottomSheet.setAttribute('aria-hidden', 'false');

    renderVideosList();

    // Focus management
    const closeButton = bottomSheet.querySelector('#closeBottomSheet');
    if (closeButton) closeButton.focus();
  }
}

function closeBottomSheet() {
  const bottomSheet = document.getElementById('videosBottomSheet');
  if (bottomSheet) {
    bottomSheet.classList.remove('show');
    bottomSheet.setAttribute('aria-hidden', 'true');
  }
}

function openAddVideoDialog() {
  const dialog = document.getElementById('addVideoDialog');
  const projectSelect = document.getElementById('videoProjects');

  if (dialog && projectSelect) {
    // Populate project options
    projectSelect.innerHTML = '';
    for (const projectName in projects) {
      const option = document.createElement('option');
      option.value = projectName;
      option.textContent = projectName;
      projectSelect.appendChild(option);
    }

    dialog.classList.add('show');
    dialog.setAttribute('aria-hidden', 'false');

    // Focus on URL input
    const urlInput = document.getElementById('videoUrl');
    if (urlInput) {
      urlInput.focus();
      urlInput.value = '';
    }

    // Clear form
    const form = document.getElementById('addVideoForm');
    if (form) form.reset();

    clearFormErrors();
  }
}

function closeAddVideoDialog() {
  const dialog = document.getElementById('addVideoDialog');
  if (dialog) {
    dialog.classList.remove('show');
    dialog.setAttribute('aria-hidden', 'true');
  }
}

function clearFormErrors() {
  const urlInput = document.getElementById('videoUrl');
  const urlError = document.getElementById('urlError');

  if (urlInput) urlInput.classList.remove('error');
  if (urlError) urlError.textContent = '';
}

function validateVideoForm() {
  const urlInput = document.getElementById('videoUrl');
  const urlError = document.getElementById('urlError');

  if (!urlInput || !urlError) return false;

  const url = urlInput.value.trim();
  const validation = validateYouTubeUrl(url);

  if (!validation.isValid) {
    urlInput.classList.add('error');
    urlError.textContent = validation.error;
    return false;
  }

  // Check for duplicates
  const videoId = createVideoId(validation.videoId);
  const existingVideo = videos.find(v => v.id === videoId);

  if (existingVideo) {
    urlInput.classList.add('error');
    urlError.textContent = 'Video existiert bereits in der Liste';
    return false;
  }

  urlInput.classList.remove('error');
  urlError.textContent = '';
  return true;
}

function handleAddVideoSubmit(event) {
  event.preventDefault();

  if (!validateVideoForm()) return;

  const urlInput = document.getElementById('videoUrl');
  const titleInput = document.getElementById('videoTitle');
  const projectSelect = document.getElementById('videoProjects');

  const url = urlInput.value.trim();
  const title = titleInput.value.trim();
  const selectedProjects = Array.from(projectSelect.selectedOptions).map(option => option.value);

  const result = addVideo(url, title, selectedProjects);

  if (result.success) {
    closeAddVideoDialog();
    renderVideosList();
    playClickSound();
    showSnackbar('Video hinzugefügt');
  } else {
    const urlError = document.getElementById('urlError');
    if (urlError) {
      urlError.textContent = result.error;
    }
  }
}

function showSnackbar(message, actionText = null, actionCallback = null) {
  const snackbar = document.getElementById('snackbar');
  const messageEl = document.getElementById('snackbarMessage');
  const actionEl = document.getElementById('snackbarAction');

  if (!snackbar || !messageEl || !actionEl) return;

  messageEl.textContent = message;

  if (actionText && actionCallback) {
    actionEl.textContent = actionText;
    actionEl.style.display = 'inline-block';
    actionEl.onclick = () => {
      actionCallback();
      hideSnackbar();
    };
  } else {
    actionEl.style.display = 'none';
    actionEl.onclick = null;
  }

  snackbar.classList.add('show');

  // Auto-hide after 4 seconds if no action
  setTimeout(() => {
    if (!actionCallback) hideSnackbar();
  }, 4000);
}

function hideSnackbar() {
  const snackbar = document.getElementById('snackbar');
  if (snackbar) {
    snackbar.classList.remove('show');
  }
}

function showProjectLinkDialog(videoId) {
  const video = videos.find(v => v.id === videoId);
  if (!video) return;

  const projectNames = Object.keys(projects);
  if (projectNames.length === 0) {
    showSnackbar('Keine Projekte verfügbar');
    return;
  }

  // Simple implementation using prompt - in a real app you'd want a proper dialog
  const availableProjects = projectNames.filter(name => !video.projectIds.includes(name));

  if (availableProjects.length === 0) {
    showSnackbar('Video ist bereits allen Projekten zugeordnet');
    return;
  }

  const projectList = availableProjects.map((name, index) => `${index + 1}. ${name}`).join('\n');
  const choice = prompt(`Projekt wählen für "${video.title}":\n\n${projectList}\n\nEingabe (1-${availableProjects.length}):`);

  if (choice) {
    const selectedIndex = parseInt(choice) - 1;
    if (selectedIndex >= 0 && selectedIndex < availableProjects.length) {
      const selectedProject = availableProjects[selectedIndex];
      const result = linkVideoToProject(videoId, selectedProject);

      if (result.success) {
        renderVideosList();
        updateVideoIntegration();
        showSnackbar(`Video "${selectedProject}" zugeordnet`);
      }
    }
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

  // Video Feature Event Listeners
  setupVideoEventListeners();
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

function setupVideoEventListeners() {
  // Videos Button
  const videosButton = document.getElementById('videosButton');
  if (videosButton) {
    videosButton.addEventListener('click', () => {
      openBottomSheet();
      playClickSound();
    });
  }

  // Bottom Sheet Close
  const closeBottomSheetBtn = document.getElementById('closeBottomSheet');
  if (closeBottomSheetBtn) {
    closeBottomSheetBtn.addEventListener('click', closeBottomSheet);
  }

  // Bottom Sheet Backdrop Click
  const bottomSheetBackdrop = document.querySelector('.bottom-sheet-backdrop');
  if (bottomSheetBackdrop) {
    bottomSheetBackdrop.addEventListener('click', closeBottomSheet);
  }

  // FAB - Add Video
  const addVideoFab = document.getElementById('addVideoFab');
  if (addVideoFab) {
    addVideoFab.addEventListener('click', () => {
      openAddVideoDialog();
      playClickSound();
    });
  }

  // Add Video Form
  const addVideoForm = document.getElementById('addVideoForm');
  if (addVideoForm) {
    addVideoForm.addEventListener('submit', handleAddVideoSubmit);
  }

  // Add Video Dialog Close Buttons
  const closeAddVideoDialogBtn = document.getElementById('closeAddVideoDialog');
  const cancelAddVideoBtn = document.getElementById('cancelAddVideo');

  if (closeAddVideoDialogBtn) {
    closeAddVideoDialogBtn.addEventListener('click', closeAddVideoDialog);
  }

  if (cancelAddVideoBtn) {
    cancelAddVideoBtn.addEventListener('click', closeAddVideoDialog);
  }

  // Video Player Modal Close
  const closeVideoPlayerBtn = document.getElementById('closeVideoPlayer');
  if (closeVideoPlayerBtn) {
    closeVideoPlayerBtn.addEventListener('click', closeVideoPlayer);
  }

  // Modal Backdrop Clicks
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal-backdrop')) {
      const modal = event.target.closest('.modal');
      if (modal) {
        if (modal.id === 'videoPlayerModal') {
          closeVideoPlayer();
        } else if (modal.id === 'addVideoDialog') {
          closeAddVideoDialog();
        }
      }
    }
  });

  // Real-time URL validation
  const videoUrl = document.getElementById('videoUrl');
  if (videoUrl) {
    videoUrl.addEventListener('input', () => {
      const url = videoUrl.value.trim();
      if (url) {
        validateVideoForm();
      } else {
        clearFormErrors();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      // Close any open modals/sheets
      const bottomSheet = document.getElementById('videosBottomSheet');
      const videoPlayerModal = document.getElementById('videoPlayerModal');
      const addVideoDialog = document.getElementById('addVideoDialog');

      if (bottomSheet && bottomSheet.classList.contains('show')) {
        closeBottomSheet();
      } else if (videoPlayerModal && videoPlayerModal.classList.contains('show')) {
        closeVideoPlayer();
      } else if (addVideoDialog && addVideoDialog.classList.contains('show')) {
        closeAddVideoDialog();
      }
    }
  });

  // Snackbar dismiss
  const snackbar = document.getElementById('snackbar');
  if (snackbar) {
    snackbar.addEventListener('click', (event) => {
      if (!event.target.classList.contains('snackbar-action')) {
        hideSnackbar();
      }
    });
  }
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
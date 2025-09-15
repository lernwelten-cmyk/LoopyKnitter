# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoopyKnitter is a simple knitting project counter web application written in German ("Strickprojekt Zähler"). It's a single-page HTML application that helps knitters track their progress on multiple projects.

## Architecture

This is a single-file static web application with no build system or dependencies:
- **Single file**: `index.html` contains all HTML, CSS, and JavaScript
- **Storage**: Uses browser's localStorage to persist project data
- **No framework**: Pure vanilla JavaScript with DOM manipulation
- **Styling**: Embedded CSS with a warm, knitting-themed color scheme

## Core Features

- **Project Management**: Create, select, and switch between multiple knitting projects
- **Row Counting**: Track progress with customizable increment steps (default: 10 rows)
- **Goal Setting**: Each project has a target row count with completion detection
- **Data Persistence**: Projects and progress are saved to localStorage
- **Audio Feedback**: Plays a completion sound when project goal is reached
- **German UI**: All user-facing text is in German

## Data Structure

Projects are stored in localStorage as a JSON object:
```javascript
{
  "projectName": {
    count: 0,        // current row count
    goal: 100        // target row count
  }
}
```

## Development

Since this is a static HTML file, no build process is required:
- Open `index.html` directly in a web browser to test
- No compilation, bundling, or server setup needed
- Changes to the file are immediately reflected on page refresh

## Key Functions

- `saveProjects()`: Persists data to localStorage
- `updateProjectList()`: Refreshes the project dropdown
- `updateDisplay()`: Updates the counter and goal display
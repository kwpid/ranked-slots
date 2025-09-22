# Slot Machine Ranked

## Overview
A competitive slot machine game where players battle AI opponents in ranked matches. Features a season system, MMR (Match Making Rating), titles, and progression rewards.

## Project Architecture
- **Type**: Single-page web application
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Storage**: Browser localStorage for player data
- **Server**: Python HTTP server for static file serving

## Key Features
- Ranked matchmaking system with MMR
- Season system with placement matches and rewards
- Title system with unlockable cosmetics
- Real-time slot machine gameplay
- AI opponents with varying skill levels
- Win streaks and progression tracking

## Current Setup
- **Port**: 5000 (configured for Replit proxy)
- **Server**: Python's built-in HTTP server
- **Deployment**: Autoscale (stateless frontend)

## Files Structure
- `index.html` - Main game interface with embedded CSS
- `main.js` - Complete game logic and functionality
- `images/unranked.png` - Rank imagery assets

## Recent Changes
- **January 2025**: Successfully imported from GitHub and configured for Replit environment
- **NEW**: Deployment configuration set up for autoscale hosting
- **NEW**: Season rewards system updated - now requires 5 wins per rank (instead of 10 wins per tier)
- **NEW**: Auto-awards season rewards for ranks passed through when ranking up  
- **NEW**: Enhanced data persistence - multiple save points ensure progress never gets lost
- Fixed JavaScript error with missing spin-button element reference
- Configured for Replit deployment with proper proxy settings
- Set up proper static file serving on port 5000

## Game Mechanics
- Players queue for matches against AI opponents
- Matches involve slot machine spinning to get jackpots
- First to 5 jackpots wins the round
- MMR adjusts based on win/loss
- Season system resets MMR periodically
- Titles unlock based on achievements

## User Preferences
- Clean, simple setup preferred
- Client-side only application
- No backend required
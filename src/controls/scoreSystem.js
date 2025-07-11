import soundSystem from '../audio/soundSystem.js';

let totalScore = 0;
let shotAttempts = 0;
let shotsMade = 0;
let pendingShots = 0; 
let currentStreak = 0; 
let bestStreak = 0; 

// == Statistics get ==
const totalScoreElement = document.getElementById('total-score');
const shotAttemptsElement = document.getElementById('shot-attempts');
const shotsMadeElement = document.getElementById('shots-made');
const shootingPercentageElement = document.getElementById('shooting-percentage');
const currentStreakElement = document.getElementById('current-streak');
const bestStreakElement = document.getElementById('best-streak');
const shotMessageElement = document.getElementById('shot-message');

function calculateBonusPoints(streak) {
  if (streak < 2) return 0; 
  if (streak < 5) return 1; 
  if (streak < 10) return 3; 
  return 5; 
}

function updateStatisticsDisplay() {
  if (totalScoreElement) totalScoreElement.innerText = totalScore;
  if (shotAttemptsElement) shotAttemptsElement.innerText = shotAttempts;
  if (shotsMadeElement) shotsMadeElement.innerText = shotsMade;
  if (currentStreakElement) currentStreakElement.innerText = currentStreak;
  if (bestStreakElement) bestStreakElement.innerText = bestStreak;
  
  const percentage = shotAttempts > 0 ? (shotsMade / shotAttempts * 100).toFixed(1) : 0.0;
  if (shootingPercentageElement) shootingPercentageElement.innerText = `${percentage}%`;
}

function showShotMessage(made) {
  if (!shotMessageElement) return;
  
  if (made) {
    soundSystem.playSuccessSound();
    
    const bonusPoints = calculateBonusPoints(currentStreak);
    let message = "SHOT MADE!";
    
    if (bonusPoints > 0) {
      message += ` +${bonusPoints} BONUS!`;
    }
    
    if (currentStreak >= 3) {
      message += ` (${currentStreak} STREAK!)`;
    }
    
    shotMessageElement.innerText = message;
    shotMessageElement.className = "show made";
  } else {
    soundSystem.playFailureSound();
    
    if (currentStreak > 0) {
      shotMessageElement.innerText = "STREAK BROKEN!";
    } else {
      shotMessageElement.innerText = "SHOT MISSED";
    }
    shotMessageElement.className = "show missed";
  }
  
  setTimeout(() => {
    shotMessageElement.className = "";
  }, 2500);
}

export function recordShotAttempt() {
  shotAttempts += 1;
  pendingShots += 1;
  updateStatisticsDisplay();
  
  setTimeout(() => {
    if (pendingShots > 0) {
      pendingShots -= 1;
      showShotMessage(false); 
      currentStreak = 0;
      updateStatisticsDisplay(); 
    }
  }, 1000);
}

export function updateScore() {
  currentStreak += 1;
  
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }
  
  const basePoints = 2;
  const bonusPoints = calculateBonusPoints(currentStreak);
  const totalPoints = basePoints + bonusPoints;
  
  totalScore += totalPoints;
  shotsMade += 1;
  
  if (pendingShots > 0) {
    pendingShots -= 1;
    showShotMessage(true); 
  }
  
  updateStatisticsDisplay();
  
  if (bonusPoints > 0) {
    console.log(`Shot made! Streak: ${currentStreak}, Bonus: +${bonusPoints}, Total points: ${totalPoints}`);
  }
}

export function resetScore() {
  totalScore = 0;
  shotAttempts = 0;
  shotsMade = 0;
  pendingShots = 0;
  currentStreak = 0;
  bestStreak = 0;
  updateStatisticsDisplay();
}

export function getScore() {
  return totalScore;
}

export function getShotAttempts() {
  return shotAttempts;
}

export function getShotsMade() {
  return shotsMade;
}

export function getCurrentStreak() {
  return currentStreak;
}

export function getBestStreak() {
  return bestStreak;
}

export function getShootingPercentage() {
  return shotAttempts > 0 ? (shotsMade / shotAttempts * 100) : 0;
}

export function getStatistics() {
  return {
    totalScore,
    shotAttempts,
    shotsMade,
    shootingPercentage: shotAttempts > 0 ? (shotsMade / shotAttempts * 100).toFixed(1) : 0.0
  };
}

updateStatisticsDisplay();
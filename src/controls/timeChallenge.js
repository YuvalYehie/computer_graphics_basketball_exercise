class TimeChallenge {
  constructor() {
    this.isActive = false;
    this.timeRemaining = 20;
    this.challengeStartScore = 0;
    this.challengeInterval = null;
    this.timerElement = null;
    this.messageElement = null;
    
    this.createUI();
  }
  
  createUI() {
    this.timerElement = document.createElement('div');
    this.timerElement.style.position = 'absolute';
    this.timerElement.style.top = '20px';
    this.timerElement.style.right = '20px';
    this.timerElement.style.color = '#fff';
    this.timerElement.style.fontSize = '24px';
    this.timerElement.style.fontWeight = 'bold';
    this.timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.timerElement.style.padding = '10px 15px';
    this.timerElement.style.borderRadius = '5px';
    this.timerElement.style.border = '2px solid #00ff00';
    this.timerElement.style.display = 'none';
    this.timerElement.style.zIndex = '1000';
    document.body.appendChild(this.timerElement);
    
    this.messageElement = document.getElementById('shot-message');
  }
  
  startChallenge(currentScore) {
    if (this.isActive) return; 
    
    this.isActive = true;
    this.timeRemaining = 20;
    this.challengeStartScore = currentScore;
    
    this.showMessage("20 SECONDS, SCORE AS MUCH AS YOU CAN!", "challenge-start");
    
    this.timerElement.style.display = 'block';
    this.updateTimerDisplay();
    
    this.challengeInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerDisplay();
      
      if (this.timeRemaining <= 0) {
        this.endChallenge();
      }
    }, 1000);
    
    console.log("Time Challenge Started!");
  }
  
  endChallenge() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.challengeInterval) {
      clearInterval(this.challengeInterval);
      this.challengeInterval = null;
    }
    
    this.timerElement.style.display = 'none';
    
    const currentScore = this.getCurrentScore();
    const shotsMadeDuringChallenge = Math.floor((currentScore - this.challengeStartScore) / 2); 
    
    this.showMessage(`CHALLENGE ENDED! YOU MADE ${shotsMadeDuringChallenge} SHOTS`, "challenge-end");
    
    console.log(`Challenge ended! Shots made: ${shotsMadeDuringChallenge}`);
  }
  
  updateTimerDisplay() {
    this.timerElement.innerText = `Time: ${this.timeRemaining}s`;
    
    if (this.timeRemaining <= 5) {
      this.timerElement.style.color = '#ff4444';
      this.timerElement.style.borderColor = '#ff4444';
    } else if (this.timeRemaining <= 10) {
      this.timerElement.style.color = '#ffaa44';
      this.timerElement.style.borderColor = '#ffaa44';
    } else {
      this.timerElement.style.color = '#fff'; 
      this.timerElement.style.borderColor = '#00ff00'; 
    }
  }
  
  showMessage(text, type) {
    if (!this.messageElement) return;
    
    this.messageElement.innerText = text;
    
    if (type === "challenge-start") {
      this.messageElement.className = "show challenge-start";
    } else if (type === "challenge-end") {
      this.messageElement.className = "show challenge-end";
    }
    
    setTimeout(() => {
      this.messageElement.className = "";
    }, 3000);
  }
  
  getCurrentScore() {
    return 0;
  }
  
  setScoreGetter(scoreGetter) {
    this.getCurrentScore = scoreGetter;
  }
  
  isChallengActive() {
    return this.isActive;
  }
}

const timeChallenge = new TimeChallenge();
export default timeChallenge; 
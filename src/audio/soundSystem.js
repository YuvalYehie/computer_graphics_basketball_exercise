class SoundSystem {
  constructor() {
    this.successSound = new Audio('./src/audio/success.mp3');
    this.failureSound = new Audio('./src/audio/failure.mp3');
    
    this.successSound.volume = 0.7;
    this.failureSound.volume = 0.5;
    
    this.successSound.preload = 'auto';
    this.failureSound.preload = 'auto';
    
    this.successSound.onerror = () => {
      console.warn('Could not load success sound effect');
    };
    
    this.failureSound.onerror = () => {
      console.warn('Could not load failure sound effect');
    };
  }
  
  playSuccessSound() {
    try {
      this.successSound.currentTime = 0;
      this.successSound.play().catch(error => {
        console.warn('Could not play success sound:', error);
      });
    } catch (error) {
      console.warn('Error playing success sound:', error);
    }
  }
  
  playFailureSound() {
    try {
      this.failureSound.currentTime = 0;
      this.failureSound.play().catch(error => {
        console.warn('Could not play failure sound:', error);
      });
    } catch (error) {
      console.warn('Error playing failure sound:', error);
    }
  }
  
  setVolume(successVolume, failureVolume) {
    this.successSound.volume = Math.max(0, Math.min(1, successVolume));
    this.failureSound.volume = Math.max(0, Math.min(1, failureVolume));
  }
}

const soundSystem = new SoundSystem();
export default soundSystem; 
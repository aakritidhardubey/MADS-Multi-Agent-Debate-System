// Speech-to-Text and Text-to-Speech functionality
// Uses Web Speech API (built into modern browsers)

class SpeechManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.speechQueue = [];
        this.speechRate = parseFloat(localStorage.getItem('speechRate')) || 1.0;
        this.speechPitch = parseFloat(localStorage.getItem('speechPitch')) || 1.0;
        
        this.initSpeechRecognition();
        this.initSpeechSynthesis();
    }
    
    // Initialize Speech Synthesis with resume capability
    initSpeechSynthesis() {
        if (!this.synthesis) return;
        
        // Resume speech if it gets paused (browser limitation workaround)
        setInterval(() => {
            if (this.isSpeaking && this.synthesis.paused) {
                this.synthesis.resume();
            }
        }, 1000);
    }
    
    // Initialize Speech Recognition
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateMicButton(true);
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateMicButton(false);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateMicButton(false);
            
            if (event.error === 'not-allowed') {
                this.showSpeechNotification('Microphone access denied. Please enable it in your browser settings.', 'error');
            }
        };
        
        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.handleFinalTranscript(finalTranscript);
            }
        };
    }
    
    // Start listening
    startListening(targetElement) {
        if (!this.recognition) {
            this.showSpeechNotification('Speech recognition not supported in your browser', 'error');
            return;
        }
        
        if (this.isListening) {
            this.stopListening();
            return;
        }
        
        this.targetElement = targetElement;
        
        try {
            this.recognition.start();
            this.showSpeechNotification('Listening... Speak now', 'info');
        } catch (error) {
            console.error('Error starting recognition:', error);
        }
    }
    
    // Stop listening
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }
    
    // Handle final transcript
    handleFinalTranscript(transcript) {
        if (this.targetElement) {
            const currentValue = this.targetElement.value;
            this.targetElement.value = currentValue ? currentValue + ' ' + transcript : transcript;
            
            // Trigger input event for character counter
            this.targetElement.dispatchEvent(new Event('input'));
        }
        
        this.showSpeechNotification('Speech captured successfully', 'success');
    }
    
    // Text-to-Speech: Speak text
    speak(text, options = {}) {
        if (!this.synthesis) {
            this.showSpeechNotification('Text-to-speech not supported in your browser', 'error');
            return;
        }
        
        // Stop any ongoing speech
        if (this.isSpeaking) {
            this.stopSpeaking();
            return;
        }
        
        // Clean HTML tags from text
        const cleanText = text.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        
        if (!cleanText) {
            this.showSpeechNotification('No text to speak', 'error');
            return;
        }
        
        // Split text into chunks to avoid browser limits
        const chunks = this.splitTextIntoChunks(cleanText, 200);
        this.speakChunks(chunks, options);
    }
    
    // Split text into manageable chunks
    splitTextIntoChunks(text, maxLength) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks = [];
        let currentChunk = '';
        
        sentences.forEach(sentence => {
            sentence = sentence.trim();
            
            // If single sentence is too long, split by commas or spaces
            if (sentence.length > maxLength) {
                const parts = sentence.split(/[,;]/);
                parts.forEach(part => {
                    part = part.trim();
                    if (part.length > maxLength) {
                        // Split by words if still too long
                        const words = part.split(' ');
                        let wordChunk = '';
                        words.forEach(word => {
                            if ((wordChunk + ' ' + word).length > maxLength) {
                                if (wordChunk) chunks.push(wordChunk.trim());
                                wordChunk = word;
                            } else {
                                wordChunk += (wordChunk ? ' ' : '') + word;
                            }
                        });
                        if (wordChunk) chunks.push(wordChunk.trim());
                    } else {
                        if ((currentChunk + ' ' + part).length > maxLength) {
                            if (currentChunk) chunks.push(currentChunk.trim());
                            currentChunk = part;
                        } else {
                            currentChunk += (currentChunk ? ' ' : '') + part;
                        }
                    }
                });
            } else {
                if ((currentChunk + ' ' + sentence).length > maxLength) {
                    if (currentChunk) chunks.push(currentChunk.trim());
                    currentChunk = sentence;
                } else {
                    currentChunk += (currentChunk ? ' ' : '') + sentence;
                }
            }
        });
        
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks.filter(chunk => chunk.length > 0);
    }
    
    // Speak text chunks sequentially
    speakChunks(chunks, options = {}) {
        if (chunks.length === 0) return;
        
        this.isSpeaking = true;
        this.updateSpeakerButtons(true);
        this.showSpeechNotification('Speaking...', 'info');
        
        let currentIndex = 0;
        
        const speakNextChunk = () => {
            if (currentIndex >= chunks.length || !this.isSpeaking) {
                this.isSpeaking = false;
                this.updateSpeakerButtons(false);
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
            utterance.rate = options.rate || this.speechRate;
            utterance.pitch = options.pitch || this.speechPitch;
            utterance.volume = options.volume || 1.0;
            utterance.lang = options.lang || 'en-US';
            
            utterance.onend = () => {
                currentIndex++;
                // Small delay between chunks for natural flow
                setTimeout(() => {
                    speakNextChunk();
                }, 100);
            };
            
            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                // Try to continue with next chunk on error
                currentIndex++;
                setTimeout(() => {
                    speakNextChunk();
                }, 100);
            };
            
            this.currentUtterance = utterance;
            this.synthesis.speak(utterance);
        };
        
        speakNextChunk();
    }
    
    // Stop speaking
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateSpeakerButtons(false);
            this.showSpeechNotification('Speech stopped', 'info');
        }
    }
    
    // Update microphone button state
    updateMicButton(isActive) {
        const micButtons = document.querySelectorAll('.mic-btn');
        micButtons.forEach(btn => {
            if (isActive) {
                btn.classList.add('listening');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fas fa-stop-circle';
            } else {
                btn.classList.remove('listening');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fas fa-microphone';
            }
        });
    }
    
    // Update speaker button state
    updateSpeakerButtons(isActive) {
        const speakerButtons = document.querySelectorAll('.speaker-btn');
        speakerButtons.forEach(btn => {
            if (isActive) {
                btn.classList.add('speaking');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fas fa-stop-circle';
            } else {
                btn.classList.remove('speaking');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'fas fa-volume-up';
            }
        });
    }
    
    // Show notification
    showSpeechNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Initialize Speech Manager
const speechManager = new SpeechManager();

// Add speech controls to the page after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    addSpeechControls();
    addSpeechSettingsPanel();
});

function addSpeechControls() {
    // Add microphone button to topic textarea
    const topicTextarea = document.getElementById('topic');
    if (topicTextarea && topicTextarea.parentElement) {
        const micBtn = document.createElement('button');
        micBtn.type = 'button';
        micBtn.className = 'mic-btn';
        micBtn.title = 'Speech to Text';
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        micBtn.onclick = () => speechManager.startListening(topicTextarea);
        
        topicTextarea.parentElement.style.position = 'relative';
        topicTextarea.parentElement.appendChild(micBtn);
    }
    
    // Add microphone button to follow-up input
    const followupInput = document.getElementById('followupInput');
    if (followupInput && followupInput.parentElement) {
        const micBtn = document.createElement('button');
        micBtn.type = 'button';
        micBtn.className = 'mic-btn mic-btn-small';
        micBtn.title = 'Speech to Text';
        micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        micBtn.onclick = () => speechManager.startListening(followupInput);
        
        followupInput.parentElement.style.position = 'relative';
        followupInput.parentElement.appendChild(micBtn);
    }
    
    // Add speaker buttons to debate results (will be added dynamically when results load)
    observeDebateResults();
}

// Observe debate results and add speaker buttons
function observeDebateResults() {
    const debateResults = document.getElementById('debateResults');
    if (!debateResults) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && debateResults.innerHTML.trim() !== '') {
                addSpeakerButtonsToResults();
            }
        });
    });
    
    observer.observe(debateResults, { childList: true, subtree: true });
}

// Add speaker buttons to debate results
function addSpeakerButtonsToResults() {
    // Add speaker button to "Arguments For" section
    const forColumn = document.querySelector('.for-column .argument-header');
    if (forColumn && !forColumn.querySelector('.speaker-btn')) {
        const speakerBtn = createSpeakerButton('for');
        forColumn.appendChild(speakerBtn);
    }
    
    // Add speaker button to "Arguments Against" section
    const againstColumn = document.querySelector('.against-column .argument-header');
    if (againstColumn && !againstColumn.querySelector('.speaker-btn')) {
        const speakerBtn = createSpeakerButton('against');
        againstColumn.appendChild(speakerBtn);
    }
    
    // Add speaker button to "Summary" section
    const summaryHeader = document.querySelector('.summary-header');
    if (summaryHeader && !summaryHeader.querySelector('.speaker-btn')) {
        const speakerBtn = createSpeakerButton('summary');
        summaryHeader.appendChild(speakerBtn);
    }
}

// Create speaker button
function createSpeakerButton(section) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'speaker-btn';
    btn.title = 'Read Aloud';
    btn.innerHTML = '<i class="fas fa-volume-up"></i>';
    
    btn.onclick = () => {
        let content = '';
        
        if (section === 'for') {
            const forContent = document.querySelector('.for-column .argument-content');
            content = forContent ? forContent.textContent : '';
        } else if (section === 'against') {
            const againstContent = document.querySelector('.against-column .argument-content');
            content = againstContent ? againstContent.textContent : '';
        } else if (section === 'summary') {
            const summaryContent = document.querySelector('.summary-content');
            content = summaryContent ? summaryContent.textContent : '';
        }
        
        if (content) {
            speechManager.speak(content);
        }
    };
    
    return btn;
}

// Add speaker button to follow-up chat messages
document.addEventListener('DOMContentLoaded', function() {
    const followupChat = document.getElementById('followupChat');
    if (followupChat) {
        const chatObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('chat-message') && node.classList.contains('ai')) {
                        addSpeakerToMessage(node);
                    }
                });
            });
        });
        
        chatObserver.observe(followupChat, { childList: true });
    }
});

// Add speaker button to chat message
function addSpeakerToMessage(messageElement) {
    const bubble = messageElement.querySelector('.chat-bubble');
    if (bubble && !bubble.querySelector('.speaker-btn-inline')) {
        const speakerBtn = document.createElement('button');
        speakerBtn.type = 'button';
        speakerBtn.className = 'speaker-btn-inline';
        speakerBtn.title = 'Read Aloud';
        speakerBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        
        speakerBtn.onclick = () => {
            const text = bubble.textContent.replace('Read Aloud', '').trim();
            speechManager.speak(text);
        };
        
        bubble.appendChild(speakerBtn);
    }
}

// Add speech settings panel
function addSpeechSettingsPanel() {
    const headerControls = document.getElementById('headerControls');
    if (!headerControls) {
        setTimeout(addSpeechSettingsPanel, 100);
        return;
    }
    
    // Check if button already exists
    if (document.querySelector('.speech-settings-btn')) return;
    
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'speech-settings-btn';
    settingsBtn.innerHTML = '<i class="fas fa-sliders-h"></i>';
    settingsBtn.title = 'Speech Settings';
    settingsBtn.onclick = () => toggleSpeechSettings();
    
    // Append to header controls
    headerControls.appendChild(settingsBtn);
    
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'speechSettingsPanel';
    settingsPanel.className = 'speech-settings-panel';
    settingsPanel.style.display = 'none';
    settingsPanel.innerHTML = `
        <div class="settings-header">
            <h4><i class="fas fa-volume-up"></i> Speech Settings</h4>
            <button class="settings-close" onclick="toggleSpeechSettings()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="settings-body">
            <div class="setting-group">
                <label for="speechRateSlider">
                    <i class="fas fa-tachometer-alt"></i> Speech Speed
                    <span class="setting-value" id="rateValue">${speechManager.speechRate.toFixed(1)}x</span>
                </label>
                <input type="range" id="speechRateSlider" min="0.5" max="2.0" step="0.1" 
                       value="${speechManager.speechRate}" 
                       oninput="updateSpeechRate(this.value)">
                <div class="slider-labels">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label for="speechPitchSlider">
                    <i class="fas fa-music"></i> Voice Pitch
                    <span class="setting-value" id="pitchValue">${speechManager.speechPitch.toFixed(1)}</span>
                </label>
                <input type="range" id="speechPitchSlider" min="0.5" max="2.0" step="0.1" 
                       value="${speechManager.speechPitch}" 
                       oninput="updateSpeechPitch(this.value)">
                <div class="slider-labels">
                    <span>Low</span>
                    <span>Normal</span>
                    <span>High</span>
                </div>
            </div>
            
            <div class="setting-actions">
                <button class="btn-test-speech" onclick="testSpeech()">
                    <i class="fas fa-play"></i> Test Voice
                </button>
                <button class="btn-reset-speech" onclick="resetSpeechSettings()">
                    <i class="fas fa-undo"></i> Reset
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsPanel);
}

function toggleSpeechSettings() {
    const panel = document.getElementById('speechSettingsPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        panel.classList.add('show');
    } else {
        panel.style.display = 'none';
        panel.classList.remove('show');
    }
}

function updateSpeechRate(value) {
    speechManager.speechRate = parseFloat(value);
    localStorage.setItem('speechRate', value);
    document.getElementById('rateValue').textContent = parseFloat(value).toFixed(1) + 'x';
}

function updateSpeechPitch(value) {
    speechManager.speechPitch = parseFloat(value);
    localStorage.setItem('speechPitch', value);
    document.getElementById('pitchValue').textContent = parseFloat(value).toFixed(1);
}

function testSpeech() {
    const testText = "Hello! This is a test of the speech settings. You can adjust the speed and pitch to your preference.";
    speechManager.speak(testText, {
        rate: speechManager.speechRate,
        pitch: speechManager.speechPitch
    });
}

function resetSpeechSettings() {
    speechManager.speechRate = 1.0;
    speechManager.speechPitch = 1.0;
    localStorage.setItem('speechRate', '1.0');
    localStorage.setItem('speechPitch', '1.0');
    document.getElementById('speechRateSlider').value = 1.0;
    document.getElementById('speechPitchSlider').value = 1.0;
    document.getElementById('rateValue').textContent = '1.0x';
    document.getElementById('pitchValue').textContent = '1.0';
    speechManager.showSpeechNotification('Speech settings reset to default', 'success');
}

// Global functions for external access
window.speechManager = speechManager;
window.startSpeechRecognition = (element) => speechManager.startListening(element);
window.speakText = (text, options) => speechManager.speak(text, options);
window.stopSpeaking = () => speechManager.stopSpeaking();
window.toggleSpeechSettings = toggleSpeechSettings;
window.updateSpeechRate = updateSpeechRate;
window.updateSpeechPitch = updateSpeechPitch;
window.testSpeech = testSpeech;
window.resetSpeechSettings = resetSpeechSettings;

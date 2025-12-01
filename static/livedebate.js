// Live Debate Mode - Real-time streaming debate with live updates
// Shows arguments as they're being generated

class LiveDebateMode {
    constructor() {
        this.isLiveMode = false;
        this.eventSource = null;
        this.currentStream = null;
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.injectLiveModeToggle();
            this.setupLiveDebateUI();
        });
    }
    
    injectLiveModeToggle() {
        const debateForm = document.getElementById('debateForm');
        if (!debateForm) return;
        
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'live-mode-toggle-container';
        toggleContainer.innerHTML = `
            <div class="live-mode-toggle">
                <div class="toggle-header">
                    <div class="toggle-icon">
                        <i class="fas fa-broadcast-tower"></i>
                    </div>
                    <div class="toggle-info">
                        <h4>Live Debate Mode</h4>
                        <p>Watch arguments unfold in real-time as AI agents debate</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="liveModeToggle" onchange="liveDebate.toggleLiveMode(this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="live-mode-features">
                    <div class="feature-badge">
                        <i class="fas fa-bolt"></i>
                        <span>Real-time streaming</span>
                    </div>
                    <div class="feature-badge">
                        <i class="fas fa-eye"></i>
                        <span>Watch AI think</span>
                    </div>
                    <div class="feature-badge">
                        <i class="fas fa-comments"></i>
                        <span>Live commentary</span>
                    </div>
                </div>
            </div>
        `;
        
        // Insert before model selection
        const modelSelection = document.querySelector('.form-group:has(#modelSelection)');
        if (modelSelection) {
            modelSelection.parentNode.insertBefore(toggleContainer, modelSelection);
        }
    }
    
    setupLiveDebateUI() {
        // Create live debate container
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        const liveContainer = document.createElement('div');
        liveContainer.id = 'liveDebateContainer';
        liveContainer.className = 'live-debate-container';
        liveContainer.style.display = 'none';
        liveContainer.innerHTML = `
            <div class="live-debate-stage">
                <div class="live-header">
                    <div class="live-indicator">
                        <span class="live-dot"></span>
                        <span class="live-text">LIVE</span>
                    </div>
                    <div class="live-timer" id="liveTimer">00:00</div>
                </div>
                
                <div class="debate-arena">
                    <div class="agent-panel agent-for">
                        <div class="agent-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="agent-info">
                            <h3>Agent FOR</h3>
                            <div class="agent-status" id="forStatus">Waiting...</div>
                        </div>
                        <div class="agent-output" id="forOutput">
                            <div class="typing-indicator" style="display: none;">
                                <span></span><span></span><span></span>
                            </div>
                            <div class="agent-text" id="forText"></div>
                        </div>
                    </div>
                    
                    <div class="vs-divider">
                        <div class="vs-circle">VS</div>
                        <div class="vs-line"></div>
                    </div>
                    
                    <div class="agent-panel agent-against">
                        <div class="agent-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="agent-info">
                            <h3>Agent AGAINST</h3>
                            <div class="agent-status" id="againstStatus">Waiting...</div>
                        </div>
                        <div class="agent-output" id="againstOutput">
                            <div class="typing-indicator" style="display: none;">
                                <span></span><span></span><span></span>
                            </div>
                            <div class="agent-text" id="againstText"></div>
                        </div>
                    </div>
                </div>
                
                <div class="judge-panel" id="judgePanel" style="display: none;">
                    <div class="judge-header">
                        <div class="judge-avatar">
                            <i class="fas fa-gavel"></i>
                        </div>
                        <div class="judge-info">
                            <h3>Final Judge</h3>
                            <div class="judge-status" id="judgeStatus">Analyzing...</div>
                        </div>
                    </div>
                    <div class="judge-output" id="judgeOutput">
                        <div class="typing-indicator" style="display: none;">
                            <span></span><span></span><span></span>
                        </div>
                        <div class="judge-text" id="judgeText"></div>
                    </div>
                </div>
                
                <div class="live-controls">
                    <button class="live-control-btn" onclick="liveDebate.pauseLive()" id="pauseBtn">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button class="live-control-btn" onclick="liveDebate.stopLive()">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                </div>
            </div>
        `;
        
        // Insert at the beginning of results section
        const resultsContainer = resultsSection.querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.insertBefore(liveContainer, resultsContainer.firstChild);
        }
    }
    
    toggleLiveMode(enabled) {
        this.isLiveMode = enabled;
        localStorage.setItem('liveDebateMode', enabled);
        
        const toggleContainer = document.querySelector('.live-mode-toggle');
        
        if (enabled) {
            this.showNotification('🎥 Live Debate Mode ENABLED! Watch AI agents debate in real-time with typing animations.', 'success');
            if (toggleContainer) {
                toggleContainer.style.borderColor = '#10b981';
                toggleContainer.style.background = 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))';
            }
        } else {
            this.showNotification('Live Debate Mode disabled - using standard mode', 'info');
            if (toggleContainer) {
                toggleContainer.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                toggleContainer.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))';
            }
        }
    }
    
    async startLiveDebate(topic, modelChoice) {
        console.log('Starting live debate mode...');
        
        // Hide normal results, show live container
        const debateResults = document.getElementById('debateResults');
        const statusDisplay = document.getElementById('statusDisplay');
        const liveContainer = document.getElementById('liveDebateContainer');
        
        if (debateResults) debateResults.style.display = 'none';
        if (statusDisplay) statusDisplay.style.display = 'none';
        if (liveContainer) liveContainer.style.display = 'block';
        
        // Reset UI
        this.resetLiveUI();
        
        // Start timer
        this.startTimer();
        this.startSpeaking();
        
        // Start streaming debate
        try {
            await this.streamDebate(topic, modelChoice);
            return true;
        } catch (error) {
            console.error('Live debate error:', error);
            this.showNotification('Live debate failed: ' + error.message, 'error');
            
            // Fallback to normal mode
            if (liveContainer) liveContainer.style.display = 'none';
            if (debateResults) debateResults.style.display = 'block';
            if (statusDisplay) statusDisplay.style.display = 'block';
            
            throw error;
        }
    }
    
    async streamDebate(topic, modelChoice) {
        try {
            // Store the promise so stop button can wait for it
            this.debatePromise = (async () => {
                // Make actual API call to backend
                const response = await fetch('/api/debate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topic: topic,
                        model_choice: modelChoice
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (result.status === 'success' && result.data && result.data.results) {
                    // Stream the actual results
                    await this.streamRealResults(result.data.results);
                } else {
                    throw new Error('Invalid response format');
                }
                
                // Store results for export
                window.currentDebateData = result.data;
                
                return result;
            })();
            
            await this.debatePromise;
            
            // Complete
            this.completeLiveDebate();
            
        } catch (error) {
            console.error('Stream debate error:', error);
            throw error;
        } finally {
            this.debatePromise = null;
        }
    }
    
    async streamRealResults(results) {
        // Phase 1: Stream FOR arguments
        if (results.for_arguments) {
            await this.streamAgentText('for', results.for_arguments);
        }
        
        // Phase 2: Stream AGAINST arguments
        if (results.against_arguments) {
            await this.streamAgentText('against', results.against_arguments);
        }
        
        // Phase 3: Stream Judge verdict
        if (results.summary) {
            await this.streamJudgeText(results.summary);
        }
    }
    
    async streamAgentText(type, text) {
        const statusEl = document.getElementById(`${type}Status`);
        const textEl = document.getElementById(`${type}Text`);
        const outputEl = document.getElementById(`${type}Output`);
        const typingIndicator = outputEl.querySelector('.typing-indicator');
        
        // Show thinking
        statusEl.textContent = 'Thinking...';
        statusEl.className = 'agent-status thinking';
        typingIndicator.style.display = 'flex';
        
        await this.delay(800);
        
        // Start speaking
        statusEl.textContent = 'Speaking...';
        statusEl.className = 'agent-status speaking';
        typingIndicator.style.display = 'none';
        
        // Stream the actual text
        await this.typeText(textEl, text, 20);
        
        // Complete
        statusEl.textContent = 'Complete';
        statusEl.className = 'agent-status complete';
        
        await this.delay(500);
    }
    
    async streamJudgeText(text) {
        const judgePanel = document.getElementById('judgePanel');
        judgePanel.style.display = 'block';
        
        const statusEl = document.getElementById('judgeStatus');
        const textEl = document.getElementById('judgeText');
        const outputEl = document.getElementById('judgeOutput');
        const typingIndicator = outputEl.querySelector('.typing-indicator');
        
        // Show analyzing
        statusEl.textContent = 'Analyzing arguments...';
        statusEl.className = 'judge-status analyzing';
        typingIndicator.style.display = 'flex';
        
        await this.delay(1500);
        
        // Start delivering verdict
        statusEl.textContent = 'Delivering verdict...';
        statusEl.className = 'judge-status speaking';
        typingIndicator.style.display = 'none';
        
        // Stream the actual verdict
        await this.typeText(textEl, text, 25);
        
        // Complete
        statusEl.textContent = 'Complete';
        statusEl.className = 'judge-status complete';
    }
    
    async typeText(element, text, speed = 10) {
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            if (!this.isSpeaking) break; // Stop if stopped
            
            element.textContent += text[i];
            element.scrollTop = element.scrollHeight;
            
            // Variable speed for more natural typing
            const delay = text[i] === '.' || text[i] === '!' || text[i] === '?' ? speed * 2 : speed;
            await this.delay(delay);
        }
    }
    
    startSpeaking() {
        this.isSpeaking = true;
    }
    
    stopSpeaking() {
        this.isSpeaking = false;
    }
    
    generateSampleArgument(type, topic) {
        const forArgs = [
            `Regarding "${topic}", there are several compelling reasons to support this position.`,
            `First, evidence suggests that this approach leads to positive outcomes in multiple domains.`,
            `Second, historical precedents demonstrate the effectiveness of similar implementations.`,
            `Third, expert consensus increasingly favors this perspective based on recent research.`,
            `Finally, the practical benefits outweigh potential drawbacks when properly implemented.`
        ].join(' ');
        
        const againstArgs = [
            `However, when examining "${topic}" critically, significant concerns emerge.`,
            `First, there are substantial risks that haven't been adequately addressed.`,
            `Second, alternative approaches may achieve better results with fewer complications.`,
            `Third, implementation challenges could undermine the intended benefits.`,
            `Finally, unintended consequences could create more problems than solutions.`
        ].join(' ');
        
        return type === 'for' ? forArgs : againstArgs;
    }
    
    generateSampleVerdict(topic) {
        return `After carefully considering both perspectives on "${topic}", several key insights emerge. Both sides present valid points that merit consideration. The supporting arguments demonstrate clear benefits and evidence-based reasoning. However, the opposing viewpoints raise important concerns about implementation and potential risks. A balanced approach that incorporates the strengths of both positions while mitigating identified risks would likely yield the best outcomes. Further research and careful planning are recommended before full implementation.`;
    }
    
    resetLiveUI() {
        document.getElementById('forText').textContent = '';
        document.getElementById('againstText').textContent = '';
        document.getElementById('judgeText').textContent = '';
        document.getElementById('judgePanel').style.display = 'none';
        
        ['forStatus', 'againstStatus'].forEach(id => {
            const el = document.getElementById(id);
            el.textContent = 'Waiting...';
            el.className = 'agent-status';
        });
    }
    
    startTimer() {
        let seconds = 0;
        const timerEl = document.getElementById('liveTimer');
        
        this.timerInterval = setInterval(() => {
            seconds++;
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    pauseLive() {
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn.innerHTML.includes('Pause')) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            this.showNotification('Live debate paused', 'info');
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            this.showNotification('Live debate resumed', 'info');
        }
    }
    
    async stopLive() {
        this.stopTimer();
        this.stopSpeaking();
        
        // If debate is still running, wait for completion
        if (this.debatePromise) {
            this.showNotification('Waiting for debate to complete...', 'info');
            try {
                await this.debatePromise;
            } catch (error) {
                console.error('Error waiting for debate:', error);
            }
        }
        
        // Copy current content to regular results
        this.copyToRegularResults();
        
        // Initialize follow-up for live debate
        this.initializeFollowUp();
        
        // Hide live container, show regular results
        const liveContainer = document.getElementById('liveDebateContainer');
        const debateResults = document.getElementById('debateResults');
        
        if (liveContainer) liveContainer.style.display = 'none';
        if (debateResults) debateResults.style.display = 'block';
        
        // Show export and followup sections
        const exportSection = document.getElementById('exportSection');
        const followupSection = document.getElementById('followupSection');
        if (exportSection) exportSection.style.display = 'block';
        if (followupSection) followupSection.style.display = 'block';
        
        // Trigger visualizations
        if (window.debateViz) {
            setTimeout(() => {
                window.debateViz.analyzeAndVisualize();
            }, 500);
        }
        
        this.showNotification('Showing complete debate results', 'success');
    }
    
    completeLiveDebate() {
        this.stopTimer();
        this.stopSpeaking();
        
        // Copy live content to regular results
        this.copyToRegularResults();
        
        // Initialize follow-up for live debate
        this.initializeFollowUp();
        
        // Transition from live to regular view
        setTimeout(() => {
            const liveContainer = document.getElementById('liveDebateContainer');
            const debateResults = document.getElementById('debateResults');
            
            if (liveContainer) liveContainer.style.display = 'none';
            if (debateResults) debateResults.style.display = 'block';
            
            // Show export and followup sections
            const exportSection = document.getElementById('exportSection');
            const followupSection = document.getElementById('followupSection');
            if (exportSection) exportSection.style.display = 'block';
            if (followupSection) followupSection.style.display = 'block';
            
            // Trigger visualizations
            if (window.debateViz) {
                setTimeout(() => {
                    window.debateViz.analyzeAndVisualize();
                }, 500);
            }
            
            this.showNotification('Live debate complete! Showing final results and analytics.', 'success');
        }, 1500); // Wait 1.5 seconds before transitioning
    }
    
    copyToRegularResults() {
        // Create regular results structure for visualization and display
        const debateResults = document.getElementById('debateResults');
        if (!debateResults) return;
        
        const forText = document.getElementById('forText')?.textContent || '';
        const againstText = document.getElementById('againstText')?.textContent || '';
        const judgeText = document.getElementById('judgeText')?.textContent || '';
        
        // Format text with line breaks
        const formatText = (text) => {
            return text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        };
        
        // Create the full structure that matches normal debate results
        debateResults.innerHTML = `
            <div class="debate-layout">
                <div class="arguments-container">
                    <div class="argument-column for-column">
                        <div class="argument-header for-header">
                            <div class="argument-icon">
                                <i class="fas fa-thumbs-up"></i>
                            </div>
                            <h3>Arguments For</h3>
                        </div>
                        <div class="argument-content">
                            ${formatText(forText)}
                        </div>
                    </div>
                    
                    <div class="argument-column against-column">
                        <div class="argument-header against-header">
                            <div class="argument-icon">
                                <i class="fas fa-thumbs-down"></i>
                            </div>
                            <h3>Arguments Against</h3>
                        </div>
                        <div class="argument-content">
                            ${formatText(againstText)}
                        </div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <div class="summary-header">
                        <div class="summary-icon">
                            <i class="fas fa-balance-scale"></i>
                        </div>
                        <h3>Conclusion & Analysis</h3>
                    </div>
                    <div class="summary-content">
                        ${formatText(judgeText)}
                    </div>
                </div>
            </div>
        `;
        
        // Store for export - set both window and global scope
        const debateData = {
            results: {
                for_arguments: forText,
                against_arguments: againstText,
                summary: judgeText
            }
        };
        
        window.currentDebateData = debateData;
        
        // Also set in global scope if it exists
        if (typeof currentDebateData !== 'undefined') {
            currentDebateData = debateData;
        }
        
        console.log('Set currentDebateData:', window.currentDebateData);
    }
    
    initializeFollowUp() {
        // Get the debate data from live panels
        const forText = document.getElementById('forText')?.textContent || '';
        const againstText = document.getElementById('againstText')?.textContent || '';
        const judgeText = document.getElementById('judgeText')?.textContent || '';
        const topic = document.getElementById('currentTopic')?.textContent || '';
        
        console.log('Initializing follow-up for live debate');
        console.log('Topic:', topic);
        console.log('For text length:', forText.length);
        console.log('Against text length:', againstText.length);
        console.log('Judge text length:', judgeText.length);
        
        // Store debate context for follow-up questions
        if (typeof window.debateContext !== 'undefined') {
            window.debateContext = `
Topic: ${topic}

Arguments For:
${forText}

Arguments Against:
${againstText}

Conclusion:
${judgeText}
            `.trim();
        }
        
        // Store current model choice
        if (typeof window.selectedModel !== 'undefined') {
            window.currentModelChoice = window.selectedModel;
        }
        
        // Ensure currentDebateData is set for export
        if (!window.currentDebateData) {
            window.currentDebateData = {
                results: {
                    for_arguments: forText,
                    against_arguments: againstText,
                    summary: judgeText
                }
            };
            console.log('Set currentDebateData for export');
        }
        
        // Clear previous chat messages and add welcome message
        const followupChat = document.getElementById('followupChat');
        if (followupChat) {
            followupChat.innerHTML = '<div class="chat-message ai"><div class="message-label"><i class="fas fa-robot"></i> AI Assistant</div><div class="chat-bubble">Feel free to ask me any questions about this debate!</div></div>';
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
}

// Initialize
const liveDebate = new LiveDebateMode();
window.liveDebate = liveDebate;

// Hook into existing debate submission
document.addEventListener('DOMContentLoaded', function() {
    // Load saved preference
    const savedLiveMode = localStorage.getItem('liveDebateMode') === 'true';
    const toggle = document.getElementById('liveModeToggle');
    if (toggle && savedLiveMode) {
        toggle.checked = true;
        liveDebate.isLiveMode = true;
    }
});

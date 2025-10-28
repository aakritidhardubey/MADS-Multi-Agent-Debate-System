// Global variables
let currentDebateData = null;
let selectedModel = null;

// DOM Elements
const welcomeSection = document.getElementById('welcomeSection');
const inputSection = document.getElementById('inputSection');
const resultsSection = document.getElementById('resultsSection');
const debateForm = document.getElementById('debateForm');
const topicTextarea = document.getElementById('topic');
const charCount = document.getElementById('charCount');
const modelSelection = document.getElementById('modelSelection');
const startDebateBtn = document.getElementById('startDebateBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadModels();
    setupEventListeners();
    showWelcome();
});

// Setup event listeners
function setupEventListeners() {
    // Character counter for topic textarea
    if (topicTextarea) {
        topicTextarea.addEventListener('input', updateCharCount);
    }
    
    // Form submission
    if (debateForm) {
        debateForm.addEventListener('submit', handleDebateSubmission);
    }
    
    // Modal close on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
}

// Update character count
function updateCharCount() {
    const count = topicTextarea.value.length;
    charCount.textContent = count;
    
    if (count > 450) {
        charCount.style.color = 'var(--danger-color)';
    } else if (count > 350) {
        charCount.style.color = 'var(--warning-color)';
    } else {
        charCount.style.color = 'var(--text-muted)';
    }
}

// Load available models
async function loadModels() {
    try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        if (data.models && modelSelection) {
            modelSelection.innerHTML = '';
            
            data.models.forEach(model => {
                const modelOption = createModelOption(model);
                modelSelection.appendChild(modelOption);
            });
        }
    } catch (error) {
        console.error('Error loading models:', error);
        showError('Failed to load AI models. Please refresh the page.');
    }
}

// Create model option element
function createModelOption(model) {
    const div = document.createElement('div');
    div.className = 'model-option';
    div.innerHTML = `
        <input type="radio" name="model" value="${model.id}" id="model-${model.id}">
        <div class="model-info">
            <h4>${model.name}</h4>
            <p>${model.description}</p>
        </div>
    `;
    
    div.addEventListener('click', function() {
        selectModel(model.id, div);
    });
    
    return div;
}

// Select model
function selectModel(modelId, element) {
    // Remove previous selection
    document.querySelectorAll('.model-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selection to clicked element
    element.classList.add('selected');
    
    // Update radio button
    const radio = element.querySelector('input[type="radio"]');
    radio.checked = true;
    
    selectedModel = modelId;
}

// Navigation functions
function showWelcome() {
    hideAllSections();
    if (welcomeSection) {
        welcomeSection.style.display = 'block';
        welcomeSection.classList.add('fade-in');
    }
}

function showDebateForm() {
    hideAllSections();
    if (inputSection) {
        inputSection.style.display = 'block';
        inputSection.classList.add('slide-up');
    }
}

function showResults() {
    hideAllSections();
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
    }
}

function hideAllSections() {
    [welcomeSection, inputSection, resultsSection].forEach(section => {
        if (section) {
            section.style.display = 'none';
            section.classList.remove('fade-in', 'slide-up');
        }
    });
}

// Handle debate form submission
async function handleDebateSubmission(e) {
    e.preventDefault();
    
    const topic = topicTextarea.value.trim();
    const modelChoice = selectedModel;
    
    if (!topic) {
        showError('Please enter a debate topic.');
        return;
    }
    
    if (!modelChoice) {
        showError('Please select an AI model.');
        return;
    }
    
    // Show loading state
    setButtonLoading(true);
    
    try {
        await startDebate(topic, modelChoice);
    } catch (error) {
        console.error('Debate error:', error);
        showError('Failed to start debate. Please try again.');
        setButtonLoading(false);
    }
}

// Start debate
async function startDebate(topic, modelChoice) {
    showResults();
    
    // Update UI with debate info
    updateDebateInfo(topic, modelChoice);
    
    // Reset progress
    resetProgress();
    
    // Show status display
    showStatusDisplay();
    
    try {
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
        
        if (result.status === 'success') {
            displayDebateResults(result.data);
        } else {
            throw new Error(result.message || 'Unknown error occurred');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to complete debate: ' + error.message);
    } finally {
        setButtonLoading(false);
    }
}

// Update debate info in results section
function updateDebateInfo(topic, modelChoice) {
    const currentTopicEl = document.getElementById('currentTopic');
    const selectedModelEl = document.getElementById('selectedModel');
    
    if (currentTopicEl) {
        currentTopicEl.textContent = topic;
    }
    
    if (selectedModelEl) {
        // Get model name from the selection
        const modelNames = {
            '1': 'Llama 3.1 8B Instant',
            '3': 'Llama 3.3 70B Versatile'
        };
        selectedModelEl.textContent = modelNames[modelChoice] || 'Unknown Model';
    }
}

// Reset progress indicators
function resetProgress() {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) {
            step.classList.add('active');
        }
    });
}

// Update progress
function updateProgress(step) {
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    
    const progressPercentages = [33, 66, 100];
    
    if (progressFill && step <= progressPercentages.length) {
        progressFill.style.width = progressPercentages[step - 1] + '%';
    }
    
    steps.forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index < step - 1) {
            stepEl.classList.add('completed');
        } else if (index === step - 1) {
            stepEl.classList.add('active');
        }
    });
}

// Show status display
function showStatusDisplay() {
    const statusDisplay = document.getElementById('statusDisplay');
    const debateResults = document.getElementById('debateResults');
    
    if (statusDisplay) {
        statusDisplay.style.display = 'block';
    }
    if (debateResults) {
        debateResults.style.display = 'none';
    }
    
    updateStatus('Initializing AI Agents', 'Setting up the debate environment and preparing AI models...');
    
    // Simulate progress updates
    setTimeout(() => {
        updateStatus('Arguments For', 'AI agent is formulating supporting arguments...');
        updateProgress(1);
    }, 2000);
    
    setTimeout(() => {
        updateStatus('Arguments Against', 'AI agent is developing counterarguments...');
        updateProgress(2);
    }, 4000);
    
    setTimeout(() => {
        updateStatus('Final Analysis', 'Synthesizing arguments and preparing summary...');
        updateProgress(3);
    }, 6000);
}

// Update status
function updateStatus(title, message) {
    const statusTitle = document.getElementById('statusTitle');
    const statusMessage = document.getElementById('statusMessage');
    
    if (statusTitle) {
        statusTitle.textContent = title;
    }
    if (statusMessage) {
        statusMessage.textContent = message;
    }
}

// Display debate results
function displayDebateResults(data) {
    const statusDisplay = document.getElementById('statusDisplay');
    const debateResults = document.getElementById('debateResults');
    const exportSection = document.getElementById('exportSection');
    const statusBadge = document.getElementById('statusBadge');
    
    // Hide status display
    if (statusDisplay) {
        statusDisplay.style.display = 'none';
    }
    
    // Show results
    if (debateResults) {
        debateResults.style.display = 'block';
        debateResults.innerHTML = formatSideBySideResults(data.results || data);
    }
    
    // Show export section
    if (exportSection) {
        exportSection.style.display = 'block';
    }
    
    // Update status badge
    if (statusBadge) {
        statusBadge.textContent = 'Completed';
        statusBadge.classList.add('completed');
    }
    
    // Store current debate data
    currentDebateData = data;
    
    // Complete all progress steps
    updateProgress(3);
    
    // Mark all steps as completed
    setTimeout(() => {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
            step.classList.add('completed');
        });
    }, 500);
}

// Format debate results side by side
function formatSideBySideResults(results) {
    // Handle both new structured format and old format
    let forArguments = '';
    let againstArguments = '';
    let summary = '';
    
    if (results.for_arguments && results.against_arguments && results.summary) {
        // New structured format
        forArguments = results.for_arguments;
        againstArguments = results.against_arguments;
        summary = results.summary;
    } else if (results.result) {
        // Old format - try to parse
        const resultText = results.result;
        const sections = resultText.split('\n\n');
        
        sections.forEach(section => {
            if (section.toLowerCase().includes('for') || section.toLowerCase().includes('support')) {
                forArguments = section;
            } else if (section.toLowerCase().includes('against') || section.toLowerCase().includes('counter')) {
                againstArguments = section;
            } else if (section.toLowerCase().includes('summary') || section.toLowerCase().includes('conclusion')) {
                summary = section;
            }
        });
        
        // If parsing failed, use fallback
        if (!forArguments && !againstArguments) {
            forArguments = "Arguments for the topic";
            againstArguments = "Arguments against the topic";
            summary = resultText;
        }
    }
    
    return `
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
                        ${formatText(forArguments)}
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
                        ${formatText(againstArguments)}
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
                    ${formatText(summary)}
                </div>
            </div>
        </div>
    `;
}

// Format debate results for display (keeping for backward compatibility)
function formatDebateResults(resultText) {
    return formatSideBySideResults({ result: resultText });
}

// Format text with basic HTML
function formatText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Set button loading state
function setButtonLoading(loading) {
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    if (loading) {
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'flex';
        if (startDebateBtn) startDebateBtn.disabled = true;
    } else {
        if (btnText) btnText.style.display = 'flex';
        if (btnLoader) btnLoader.style.display = 'none';
        if (startDebateBtn) startDebateBtn.disabled = false;
    }
}

// Start new debate
function startNewDebate() {
    // Reset form
    if (topicTextarea) {
        topicTextarea.value = '';
    }
    
    // Reset model selection
    document.querySelectorAll('.model-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.querySelectorAll('input[name="model"]').forEach(radio => {
        radio.checked = false;
    });
    
    selectedModel = null;
    currentDebateData = null;
    
    // Reset character count
    if (charCount) {
        charCount.textContent = '0';
        charCount.style.color = 'var(--text-muted)';
    }
    
    // Show input section
    showDebateForm();
}

// Export functions
function exportResults(format) {
    if (!currentDebateData) {
        showError('No debate results to export.');
        return;
    }
    
    const filename = `debate-results-${Date.now()}`;
    
    if (format === 'txt') {
        const content = formatExportContent();
        downloadTextFile(content, filename + '.txt');
    } else if (format === 'pdf') {
        generatePDF(filename + '.pdf');
    }
}

function formatExportContent() {
    if (!currentDebateData) return '';
    
    const topic = document.getElementById('currentTopic')?.textContent || 'Unknown Topic';
    const model = document.getElementById('selectedModel')?.textContent || 'Unknown Model';
    const timestamp = new Date().toLocaleString();
    
    let content = `
AI DEBATE RESULTS
================

Topic: ${topic}
Model: ${model}
Generated: ${timestamp}

`;

    // Handle new structured format
    if (currentDebateData.results) {
        content += `
ARGUMENTS FOR:
${currentDebateData.results.for_arguments || 'Not available'}

ARGUMENTS AGAINST:
${currentDebateData.results.against_arguments || 'Not available'}

CONCLUSION & ANALYSIS:
${currentDebateData.results.summary || 'Not available'}
`;
    } else if (currentDebateData.result) {
        content += currentDebateData.result;
    }
    
    content += `

---
Generated by AI Debate Arena`;
    
    return content.trim();
}

function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Generate PDF function
function generatePDF(filename) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get debate data
        const topic = document.getElementById('currentTopic')?.textContent || 'Unknown Topic';
        const model = document.getElementById('selectedModel')?.textContent || 'Unknown Model';
        const timestamp = new Date().toLocaleString();
        
        // PDF styling
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = 30;
        
        // Helper function to add text with word wrapping
        function addWrappedText(text, x, y, maxWidth, fontSize = 12, isBold = false) {
            doc.setFontSize(fontSize);
            if (isBold) {
                doc.setFont(undefined, 'bold');
            } else {
                doc.setFont(undefined, 'normal');
            }
            
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return y + (lines.length * (fontSize * 0.5));
        }
        
        // Helper function to clean text (remove HTML tags and format)
        function cleanText(text) {
            return text
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();
        }
        
        // Title
        doc.setFillColor(99, 102, 241);
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setTextColor(255, 255, 255);
        yPosition = addWrappedText('AI DEBATE ARENA', margin, 15, maxWidth, 20, true);
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
        
        // Topic and metadata
        yPosition = addWrappedText(`Topic: ${topic}`, margin, yPosition, maxWidth, 14, true);
        yPosition += 5;
        yPosition = addWrappedText(`Model: ${model}`, margin, yPosition, maxWidth, 10);
        yPosition += 5;
        yPosition = addWrappedText(`Generated: ${timestamp}`, margin, yPosition, maxWidth, 10);
        yPosition += 15;
        
        // Check if we have structured results
        if (currentDebateData.results) {
            // Arguments For section
            doc.setFillColor(16, 185, 129);
            doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
            doc.setTextColor(255, 255, 255);
            yPosition = addWrappedText('ARGUMENTS FOR', margin + 5, yPosition, maxWidth, 12, true);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;
            
            const forText = cleanText(currentDebateData.results.for_arguments || 'Not available');
            yPosition = addWrappedText(forText, margin, yPosition, maxWidth, 10);
            yPosition += 15;
            
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            // Arguments Against section
            doc.setFillColor(239, 68, 68);
            doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
            doc.setTextColor(255, 255, 255);
            yPosition = addWrappedText('ARGUMENTS AGAINST', margin + 5, yPosition, maxWidth, 12, true);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;
            
            const againstText = cleanText(currentDebateData.results.against_arguments || 'Not available');
            yPosition = addWrappedText(againstText, margin, yPosition, maxWidth, 10);
            yPosition += 15;
            
            // Check if we need a new page
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 30;
            }
            
            // Conclusion section
            doc.setFillColor(59, 130, 246);
            doc.rect(margin, yPosition - 5, maxWidth, 8, 'F');
            doc.setTextColor(255, 255, 255);
            yPosition = addWrappedText('CONCLUSION & ANALYSIS', margin + 5, yPosition, maxWidth, 12, true);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;
            
            const summaryText = cleanText(currentDebateData.results.summary || 'Not available');
            yPosition = addWrappedText(summaryText, margin, yPosition, maxWidth, 10);
            
        } else if (currentDebateData.result) {
            // Fallback for old format
            const resultText = cleanText(currentDebateData.result);
            yPosition = addWrappedText(resultText, margin, yPosition, maxWidth, 10);
        }
        
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Generated by AI Debate Arena', margin, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
        }
        
        // Save the PDF
        doc.save(filename);
        showSuccess('PDF downloaded successfully!');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showError('Failed to generate PDF. Please try again.');
    }
}

function copyToClipboard() {
    if (!currentDebateData) {
        showError('No debate results to copy.');
        return;
    }
    
    const content = formatExportContent();
    
    navigator.clipboard.writeText(content).then(() => {
        showSuccess('Results copied to clipboard!');
    }).catch(() => {
        showError('Failed to copy to clipboard.');
    });
}

// Modal functions
function showAbout() {
    showModal('aboutModal');
}

function showHelp() {
    // You can implement a help modal similar to about
    showError('Help documentation coming soon!');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// Notification functions
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        z-index: 1001;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        backdrop-filter: blur(20px);
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        error: 'fa-exclamation-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach(modal => {
            modal.classList.remove('show');
        });
    }
    
    // Ctrl/Cmd + Enter to submit form
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (inputSection && inputSection.style.display !== 'none') {
            debateForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Add some CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        animation: slideInRight 0.3s ease-out;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex: 1;
    }
    
    .notification-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification-warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .notification-info {
        border-left: 4px solid var(--info-color);
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: var(--bg-tertiary);
        color: var(--text-primary);
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);
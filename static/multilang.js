// Multi-Language Support for AI Debate Arena
// Supports translation and language detection

class MultiLanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.supportedLanguages = {
            'en': { name: 'English', flag: '🇺🇸', code: 'en-US' },
            'es': { name: 'Español', flag: '🇪🇸', code: 'es-ES' },
            'fr': { name: 'Français', flag: '🇫🇷', code: 'fr-FR' },
            'de': { name: 'Deutsch', flag: '🇩🇪', code: 'de-DE' },
            'zh': { name: '中文', flag: '🇨🇳', code: 'zh-CN' },
            'ja': { name: '日本語', flag: '🇯🇵', code: 'ja-JP' },
            'ar': { name: 'العربية', flag: '🇸🇦', code: 'ar-SA' },
            'hi': { name: 'हिन्दी', flag: '🇮🇳', code: 'hi-IN' },
            'pt': { name: 'Português', flag: '🇧🇷', code: 'pt-BR' },
            'ru': { name: 'Русский', flag: '🇷🇺', code: 'ru-RU' }
        };
        
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.injectLanguageSelector();
            this.loadSavedLanguage();
            this.setupTranslationObserver();
        });
    }
    
    injectLanguageSelector() {
        const headerControls = document.getElementById('headerControls');
        if (!headerControls) return;
        
        const langSelector = document.createElement('div');
        langSelector.className = 'language-selector';
        langSelector.innerHTML = `
            <button class="lang-btn" onclick="multiLang.toggleLanguageMenu()">
                <span class="current-lang-flag">${this.supportedLanguages[this.currentLanguage].flag}</span>
                <span class="current-lang-name">${this.supportedLanguages[this.currentLanguage].name}</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="lang-menu" id="langMenu" style="display: none;">
                <div class="lang-menu-header">
                    <i class="fas fa-globe"></i>
                    <span>Select Language</span>
                </div>
                <div class="lang-options">
                    ${Object.entries(this.supportedLanguages).map(([code, lang]) => `
                        <button class="lang-option ${code === this.currentLanguage ? 'active' : ''}" 
                                data-lang="${code}"
                                onclick="multiLang.changeLanguage('${code}')">
                            <span class="lang-flag">${lang.flag}</span>
                            <span class="lang-name">${lang.name}</span>
                            ${code === this.currentLanguage ? '<i class="fas fa-check"></i>' : ''}
                        </button>
                    `).join('')}
                </div>
                <div class="lang-menu-footer">
                    <label class="auto-translate-toggle">
                        <input type="checkbox" id="autoTranslate" onchange="multiLang.toggleAutoTranslate(this.checked)">
                        <span>Auto-translate results</span>
                    </label>
                </div>
            </div>
        `;
        
        headerControls.appendChild(langSelector);
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                document.getElementById('langMenu').style.display = 'none';
            }
        });
    }
    
    toggleLanguageMenu() {
        const menu = document.getElementById('langMenu');
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
    }
    
    changeLanguage(langCode) {
        this.currentLanguage = langCode;
        const lang = this.supportedLanguages[langCode];
        
        // Update button
        document.querySelector('.current-lang-flag').textContent = lang.flag;
        document.querySelector('.current-lang-name').textContent = lang.name;
        
        // Update active state
        document.querySelectorAll('.lang-option').forEach(opt => {
            opt.classList.remove('active');
            opt.querySelector('.fa-check')?.remove();
        });
        
        const activeOption = document.querySelector(`[data-lang="${langCode}"]`);
        activeOption.classList.add('active');
        activeOption.innerHTML += '<i class="fas fa-check"></i>';
        
        // Save preference
        localStorage.setItem('debateLanguage', langCode);
        
        // Update speech recognition language
        if (window.speechManager && window.speechManager.recognition) {
            window.speechManager.recognition.lang = lang.code;
        }
        
        // Close menu
        this.toggleLanguageMenu();
        
        // Show notification
        this.showNotification(`Language changed to ${lang.name}`, 'success');
        
        // Translate existing content if auto-translate is enabled
        if (document.getElementById('autoTranslate')?.checked) {
            this.translateExistingContent();
        }
    }
    
    loadSavedLanguage() {
        const saved = localStorage.getItem('debateLanguage');
        if (saved && this.supportedLanguages[saved]) {
            this.changeLanguage(saved);
        }
        
        // Load auto-translate preference
        const autoTranslate = localStorage.getItem('autoTranslate') === 'true';
        const checkbox = document.getElementById('autoTranslate');
        if (checkbox) {
            checkbox.checked = autoTranslate;
        }
    }
    
    toggleAutoTranslate(enabled) {
        localStorage.setItem('autoTranslate', enabled);
        
        if (enabled && this.currentLanguage !== 'en') {
            this.translateExistingContent();
            this.showNotification('Auto-translation enabled', 'success');
        } else {
            this.showNotification('Auto-translation disabled', 'info');
        }
    }
    
    setupTranslationObserver() {
        const debateResults = document.getElementById('debateResults');
        if (!debateResults) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && 
                    debateResults.innerHTML.trim() !== '' &&
                    document.getElementById('autoTranslate')?.checked &&
                    this.currentLanguage !== 'en') {
                    setTimeout(() => this.translateExistingContent(), 500);
                }
            });
        });
        
        observer.observe(debateResults, { childList: true });
    }
    
    async translateExistingContent() {
        if (this.currentLanguage === 'en') return;
        
        const forContent = document.querySelector('.for-column .argument-content');
        const againstContent = document.querySelector('.against-column .argument-content');
        const summaryContent = document.querySelector('.summary-content');
        
        if (!forContent || !againstContent || !summaryContent) return;
        
        this.showNotification('Translating content...', 'info');
        
        try {
            // Use browser's built-in translation or fallback to API
            await Promise.all([
                this.translateElement(forContent),
                this.translateElement(againstContent),
                this.translateElement(summaryContent)
            ]);
            
            this.showNotification('Translation complete', 'success');
        } catch (error) {
            console.error('Translation error:', error);
            this.showNotification('Translation failed. Using original text.', 'error');
        }
    }
    
    async translateElement(element) {
        if (!element) return;
        
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        
        // Store original text
        if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', originalText);
        }
        
        // If returning to English, restore original
        if (this.currentLanguage === 'en') {
            element.innerHTML = this.formatText(originalText);
            return;
        }
        
        // Simulate translation (in production, use Google Translate API or similar)
        const translated = await this.mockTranslate(originalText, this.currentLanguage);
        element.innerHTML = this.formatText(translated);
    }
    
    async mockTranslate(text, targetLang) {
        // This is a mock function. In production, integrate with:
        // - Google Cloud Translation API
        // - Microsoft Translator API
        // - DeepL API
        // - Or use the backend to call translation services
        
        // For now, just add a language indicator
        return `[${this.supportedLanguages[targetLang].name}] ${text}`;
    }
    
    formatText(text) {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    // Get language-specific debate prompt
    getDebatePrompt(topic) {
        const prompts = {
            'en': `Debate topic: ${topic}`,
            'es': `Tema de debate: ${topic}`,
            'fr': `Sujet de débat: ${topic}`,
            'de': `Debattenthema: ${topic}`,
            'zh': `辩论主题: ${topic}`,
            'ja': `討論トピック: ${topic}`,
            'ar': `موضوع النقاش: ${topic}`,
            'hi': `बहस का विषय: ${topic}`,
            'pt': `Tópico de debate: ${topic}`,
            'ru': `Тема дебатов: ${topic}`
        };
        
        return prompts[this.currentLanguage] || prompts['en'];
    }
    
    // Translate UI elements
    translateUI() {
        const translations = {
            'en': {
                'start_debate': 'Start Your First Debate',
                'configure': 'Configure Your Debate',
                'topic_placeholder': 'e.g., "Should artificial intelligence be regulated by governments?"',
                'launch': 'Launch Debate',
                'new_debate': 'New Debate',
                'export': 'Export Results',
                'for': 'Arguments For',
                'against': 'Arguments Against',
                'conclusion': 'Conclusion & Analysis'
            },
            'es': {
                'start_debate': 'Comienza Tu Primer Debate',
                'configure': 'Configura Tu Debate',
                'topic_placeholder': 'ej., "¿Debería regularse la inteligencia artificial por los gobiernos?"',
                'launch': 'Iniciar Debate',
                'new_debate': 'Nuevo Debate',
                'export': 'Exportar Resultados',
                'for': 'Argumentos A Favor',
                'against': 'Argumentos En Contra',
                'conclusion': 'Conclusión y Análisis'
            },
            'fr': {
                'start_debate': 'Commencez Votre Premier Débat',
                'configure': 'Configurez Votre Débat',
                'topic_placeholder': 'ex., "L\'intelligence artificielle devrait-elle être réglementée par les gouvernements?"',
                'launch': 'Lancer le Débat',
                'new_debate': 'Nouveau Débat',
                'export': 'Exporter les Résultats',
                'for': 'Arguments Pour',
                'against': 'Arguments Contre',
                'conclusion': 'Conclusion et Analyse'
            }
            // Add more languages as needed
        };
        
        return translations[this.currentLanguage] || translations['en'];
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
const multiLang = new MultiLanguageManager();
window.multiLang = multiLang;

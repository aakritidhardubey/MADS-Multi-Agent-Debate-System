// Real-time Debate Visualization
// Animated charts and visual analytics for debate arguments

class DebateVisualization {
    constructor() {
        this.charts = {};
        this.animationFrames = [];
        this.init();
    }
    
    init() {
        // Inject visualization container into results section
        document.addEventListener('DOMContentLoaded', () => {
            this.injectVisualizationUI();
            this.observeDebateResults();
            this.checkExistingResults();
        });
    }
    
    checkExistingResults() {
        // Wait a bit for DOM to stabilize, then check
        setTimeout(() => {
            const debateResults = document.getElementById('debateResults');
            if (debateResults && debateResults.innerHTML.trim() !== '') {
                console.log('Found existing debate results, triggering visualization...');
                this.analyzeAndVisualize();
            }
        }, 500);
        
        // Also add a longer fallback check
        setTimeout(() => {
            const vizContainer = document.getElementById('visualizationContainer');
            const debateResults = document.getElementById('debateResults');
            
            if (vizContainer && vizContainer.style.display === 'none' && 
                debateResults && debateResults.innerHTML.trim() !== '') {
                console.log('Fallback: Triggering visualization...');
                this.analyzeAndVisualize();
            }
        }, 2000);
    }
    
    // Add manual trigger method for external use
    manualTrigger() {
        console.log('Manual trigger called');
        this.analyzeAndVisualize();
    }
    
    injectVisualizationUI() {
        const resultsSection = document.getElementById('resultsSection');
        if (!resultsSection) return;
        
        // Create visualization container
        const vizContainer = document.createElement('div');
        vizContainer.id = 'visualizationContainer';
        vizContainer.className = 'visualization-container';
        vizContainer.style.display = 'none';
        vizContainer.innerHTML = `
            <div class="viz-card">
                <div class="viz-header">
                    <h3><i class="fas fa-chart-line"></i> Live Debate Analytics</h3>
                    <button class="viz-toggle-btn" onclick="debateViz.toggleVisualization()">
                        <i class="fas fa-eye-slash"></i> Hide Analytics
                    </button>
                </div>
                <div class="viz-content" id="vizContent">
                    <div class="viz-tabs">
                        <button class="viz-tab active" data-tab="strength" onclick="debateViz.switchTab('strength')">
                            <i class="fas fa-balance-scale"></i> Argument Strength
                        </button>
                        <button class="viz-tab" data-tab="keywords" onclick="debateViz.switchTab('keywords')">
                            <i class="fas fa-tags"></i> Key Topics
                        </button>
                        <button class="viz-tab" data-tab="comparison" onclick="debateViz.switchTab('comparison')">
                            <i class="fas fa-exchange-alt"></i> Side Comparison
                        </button>
                    </div>
                    
                    <div class="viz-panels">
                        <div class="viz-panel active" id="strengthPanel">
                            <canvas id="strengthChart"></canvas>
                            <div class="viz-legend" id="strengthLegend"></div>
                        </div>
                        
                        <div class="viz-panel" id="keywordsPanel">
                            <div class="word-cloud" id="wordCloud"></div>
                        </div>
                        
                        <div class="viz-panel" id="comparisonPanel">
                            <div class="comparison-metrics" id="comparisonMetrics"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after debate results but before export section
        const debateResults = document.getElementById('debateResults');
        if (debateResults && debateResults.parentNode) {
            debateResults.parentNode.insertBefore(vizContainer, debateResults.nextSibling);
        }
    }
    
    observeDebateResults() {
        const debateResults = document.getElementById('debateResults');
        if (!debateResults) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && debateResults.innerHTML.trim() !== '') {
                    this.analyzeAndVisualize();
                }
            });
        });
        
        observer.observe(debateResults, { childList: true });
    }
    
    analyzeAndVisualize() {
        const forContent = document.querySelector('.for-column .argument-content')?.textContent || '';
        const againstContent = document.querySelector('.against-column .argument-content')?.textContent || '';
        const summaryContent = document.querySelector('.summary-content')?.textContent || '';
        
        if (!forContent || !againstContent) return;
        
        // Show visualization container and content automatically
        const vizContainer = document.getElementById('visualizationContainer');
        const vizContent = document.getElementById('vizContent');
        const toggleBtn = document.querySelector('.viz-toggle-btn');
        
        if (vizContainer) {
            vizContainer.style.display = 'block';
        }
        
        // Auto-show visualizations
        if (vizContent) {
            vizContent.style.display = 'block';
        }
        
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Visualization';
        }
        
        // Analyze content
        const analysis = {
            for: this.analyzeText(forContent),
            against: this.analyzeText(againstContent),
            summary: this.analyzeText(summaryContent)
        };
        
        // Generate visualizations
        this.createStrengthChart(analysis, summaryContent);
        this.createWordCloud(forContent, againstContent);
        this.createComparisonChart(analysis);
    }
    
    extractVerdict(summaryText) {
        if (!summaryText) return { winner: null, margin: 'moderate' };
        
        const text = summaryText.toLowerCase();
        
        // Check for winner - more comprehensive patterns
        let winner = null;
        
        // Check for "FOR" winning patterns
        if (text.includes('for side wins') || 
            text.includes('for wins') || 
            text.includes('verdict: for') ||
            text.includes('verdict: the for') ||
            (text.includes('for') && text.includes('wins')) ||
            (text.includes('arguments for') && text.includes('stronger')) ||
            (text.includes('supporting') && text.includes('stronger'))) {
            winner = 'FOR';
        } 
        // Check for "AGAINST" winning patterns
        else if (text.includes('against side wins') || 
                 text.includes('against wins') || 
                 text.includes('verdict: against') ||
                 text.includes('verdict: the against') ||
                 (text.includes('against') && text.includes('wins')) ||
                 (text.includes('arguments against') && text.includes('stronger')) ||
                 (text.includes('opposing') && text.includes('stronger'))) {
            winner = 'AGAINST';
        }
        
        // Check for margin
        let margin = 'moderate';
        if (text.includes('strong advantage') || 
            text.includes('strongly') || 
            text.includes('significantly') ||
            text.includes('clear winner') ||
            text.includes('decisively')) {
            margin = 'strong';
        } else if (text.includes('slight advantage') || 
                   text.includes('slightly') || 
                   text.includes('marginally') ||
                   text.includes('narrow')) {
            margin = 'slight';
        }
        
        return { winner, margin };
    }
    
    analyzeText(text) {
        const words = text.toLowerCase().split(/\s+/);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Count argument indicators
        const strongWords = ['proven', 'evidence', 'research', 'study', 'fact', 'data', 'statistics', 'clearly', 'definitely', 'undoubtedly'];
        const weakWords = ['maybe', 'perhaps', 'possibly', 'might', 'could', 'seems', 'appears'];
        const positiveWords = ['benefit', 'advantage', 'improve', 'better', 'positive', 'success', 'effective', 'efficient'];
        const negativeWords = ['risk', 'danger', 'problem', 'issue', 'concern', 'negative', 'harmful', 'ineffective'];
        
        const strongCount = words.filter(w => strongWords.includes(w)).length;
        const weakCount = words.filter(w => weakWords.includes(w)).length;
        const positiveCount = words.filter(w => positiveWords.includes(w)).length;
        const negativeCount = words.filter(w => negativeWords.includes(w)).length;
        
        return {
            wordCount: words.length,
            sentenceCount: sentences.length,
            avgWordsPerSentence: words.length / Math.max(sentences.length, 1),
            strongCount,
            weakCount,
            positiveCount,
            negativeCount,
            strength: Math.min(100, (strongCount * 10) + (sentences.length * 2)),
            sentiment: positiveCount - negativeCount,
            confidence: Math.max(0, Math.min(100, ((strongCount - weakCount) * 10) + 50))
        };
    }
    
    createStrengthChart(analysis, summaryText) {
        const canvas = document.getElementById('strengthChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 350;
        
        // Determine winner from verdict in summary
        const verdict = this.extractVerdict(summaryText || '');
        
        let forStrength, againstStrength, winner;
        if (verdict.winner === 'FOR') {
            forStrength = 75 + (verdict.margin === 'strong' ? 20 : verdict.margin === 'moderate' ? 10 : 5);
            againstStrength = 100 - forStrength + 10;
            winner = 'FOR';
        } else if (verdict.winner === 'AGAINST') {
            againstStrength = 75 + (verdict.margin === 'strong' ? 20 : verdict.margin === 'moderate' ? 10 : 5);
            forStrength = 100 - againstStrength + 10;
            winner = 'AGAINST';
        } else {
            // Fallback to analysis if no clear verdict
            forStrength = Math.min(100, analysis.for.strength + (analysis.for.sentenceCount * 3));
            againstStrength = Math.min(100, analysis.against.strength + (analysis.against.sentenceCount * 3));
            winner = forStrength > againstStrength ? 'FOR' : 'AGAINST';
        }
        
        const maxStrength = 100;
        
        // Animate bars with gradient
        this.animateBar(ctx, canvas, forStrength, againstStrength, maxStrength);
        
        // Update legend with more details
        const legend = document.getElementById('strengthLegend');
        if (legend) {
            const difference = Math.abs(forStrength - againstStrength).toFixed(0);
            
            legend.innerHTML = `
                <div class="legend-stats">
                    <div class="legend-item">
                        <span class="legend-color for-color"></span>
                        <div class="legend-details">
                            <span class="legend-label">Arguments For</span>
                            <span class="legend-value">${forStrength.toFixed(0)}%</span>
                        </div>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color against-color"></span>
                        <div class="legend-details">
                            <span class="legend-label">Arguments Against</span>
                            <span class="legend-value">${againstStrength.toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
                <div class="legend-winner">
                    <i class="fas fa-trophy"></i>
                    <span>Stronger Side: <strong>${winner}</strong> (${difference}% advantage)</span>
                </div>
                <div class="legend-note">
                    <i class="fas fa-info-circle"></i>
                    Strength calculated from evidence keywords, argument count, and clarity
                </div>
            `;
        }
    }
    
    animateBar(ctx, canvas, forValue, againstValue, maxValue) {
        let progress = 0;
        const duration = 2000;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function
            const eased = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barHeight = 70;
            const spacing = 120;
            const maxBarWidth = canvas.width - 220;
            const startX = 180;
            
            // Draw "For" bar with gradient
            const forWidth = (forValue / maxValue) * maxBarWidth * eased;
            const forGradient = ctx.createLinearGradient(startX, 0, startX + forWidth, 0);
            forGradient.addColorStop(0, '#10b981');
            forGradient.addColorStop(1, '#059669');
            ctx.fillStyle = forGradient;
            this.drawRoundedRect(ctx, startX, 50, forWidth, barHeight, 12);
            
            // Draw "For" label and value
            ctx.fillStyle = '#10b981';
            ctx.font = 'bold 18px Inter';
            ctx.textAlign = 'right';
            ctx.fillText('FOR', startX - 20, 90);
            
            // Draw percentage inside bar if wide enough, otherwise outside
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Inter';
            ctx.textAlign = 'left';
            const forPercentText = Math.round(forValue * eased) + '%';
            if (forWidth > 80) {
                ctx.fillText(forPercentText, startX + forWidth - 60, 90);
            } else {
                ctx.fillStyle = '#10b981';
                ctx.fillText(forPercentText, startX + forWidth + 10, 90);
            }
            
            // Draw "Against" bar with gradient
            const againstWidth = (againstValue / maxValue) * maxBarWidth * eased;
            const againstGradient = ctx.createLinearGradient(startX, 0, startX + againstWidth, 0);
            againstGradient.addColorStop(0, '#ef4444');
            againstGradient.addColorStop(1, '#dc2626');
            ctx.fillStyle = againstGradient;
            this.drawRoundedRect(ctx, startX, 50 + spacing, againstWidth, barHeight, 12);
            
            // Draw "Against" label and value
            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 18px Inter';
            ctx.textAlign = 'right';
            ctx.fillText('AGAINST', startX - 20, 90 + spacing);
            
            // Draw percentage
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Inter';
            ctx.textAlign = 'left';
            const againstPercentText = Math.round(againstValue * eased) + '%';
            if (againstWidth > 80) {
                ctx.fillText(againstPercentText, startX + againstWidth - 60, 90 + spacing);
            } else {
                ctx.fillStyle = '#ef4444';
                ctx.fillText(againstPercentText, startX + againstWidth + 10, 90 + spacing);
            }
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const x = startX + (maxBarWidth * i / 4);
                ctx.beginPath();
                ctx.moveTo(x, 40);
                ctx.lineTo(x, canvas.height - 40);
                ctx.stroke();
                
                // Draw percentage labels
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.font = '12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText((i * 25) + '%', x, canvas.height - 20);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    
    createSentimentChart(analysis) {
        const canvas = document.getElementById('sentimentChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = 300;
        
        // Draw sentiment gauge
        this.drawSentimentGauge(ctx, canvas, analysis);
        
        // Update stats
        const stats = document.getElementById('sentimentStats');
        if (stats) {
            const forSentiment = analysis.for.sentiment > 0 ? 'Positive' : analysis.for.sentiment < 0 ? 'Negative' : 'Neutral';
            const againstSentiment = analysis.against.sentiment > 0 ? 'Positive' : analysis.against.sentiment < 0 ? 'Negative' : 'Neutral';
            
            stats.innerHTML = `
                <div class="stat-card">
                    <div class="stat-label">Arguments For</div>
                    <div class="stat-value ${forSentiment.toLowerCase()}">${forSentiment}</div>
                    <div class="stat-detail">Confidence: ${analysis.for.confidence.toFixed(0)}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Arguments Against</div>
                    <div class="stat-value ${againstSentiment.toLowerCase()}">${againstSentiment}</div>
                    <div class="stat-detail">Confidence: ${analysis.against.confidence.toFixed(0)}%</div>
                </div>
            `;
        }
    }
    
    drawSentimentGauge(ctx, canvas, analysis) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        // Draw gauge background
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.stroke();
        
        // Calculate overall sentiment
        const overallSentiment = (analysis.for.sentiment + analysis.against.sentiment) / 2;
        const normalizedSentiment = Math.max(-10, Math.min(10, overallSentiment));
        const angle = Math.PI + (normalizedSentiment + 10) / 20 * Math.PI;
        
        // Draw sentiment arc
        const gradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
        gradient.addColorStop(0, '#ef4444');
        gradient.addColorStop(0.5, '#fbbf24');
        gradient.addColorStop(1, '#10b981');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, angle);
        ctx.stroke();
        
        // Draw needle
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * (radius - 10),
            centerY + Math.sin(angle) * (radius - 10)
        );
        ctx.stroke();
        
        // Draw center circle
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw labels
        ctx.fillStyle = '#fff';
        ctx.font = '14px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Negative', centerX - radius, centerY + 30);
        ctx.fillText('Positive', centerX + radius, centerY + 30);
        ctx.font = 'bold 18px Inter';
        ctx.fillText(overallSentiment > 0 ? 'Positive' : overallSentiment < 0 ? 'Negative' : 'Neutral', centerX, centerY - radius - 20);
    }
    
    createWordCloud(forText, againstText) {
        const wordCloud = document.getElementById('wordCloud');
        if (!wordCloud) return;
        
        // Extract keywords
        const forKeywords = this.extractKeywords(forText);
        const againstKeywords = this.extractKeywords(againstText);
        
        // Create separate maps for FOR and AGAINST
        const forMap = new Map();
        const againstMap = new Map();
        
        forKeywords.forEach(kw => {
            forMap.set(kw.word, kw.count);
        });
        
        againstKeywords.forEach(kw => {
            againstMap.set(kw.word, kw.count);
        });
        
        // Combine all unique words
        const allWords = new Set([...forMap.keys(), ...againstMap.keys()]);
        const wordData = Array.from(allWords).map(word => {
            const forCount = forMap.get(word) || 0;
            const againstCount = againstMap.get(word) || 0;
            const totalCount = forCount + againstCount;
            const side = forCount > againstCount ? 'for' : againstCount > forCount ? 'against' : 'neutral';
            
            return { word, count: totalCount, side, forCount, againstCount };
        });
        
        // Sort by frequency and take top 40
        const sortedWords = wordData.sort((a, b) => b.count - a.count).slice(0, 40);
        
        // Generate word cloud HTML with colors based on side
        wordCloud.innerHTML = `
            <div class="word-cloud-legend">
                <span class="legend-for"><i class="fas fa-circle"></i> Arguments For</span>
                <span class="legend-against"><i class="fas fa-circle"></i> Arguments Against</span>
                <span class="legend-neutral"><i class="fas fa-circle"></i> Both Sides</span>
            </div>
            <div class="word-cloud-container">
                ${sortedWords.map((item, index) => {
                    const size = Math.min(48, 14 + item.count * 4);
                    const opacity = Math.min(1, 0.6 + item.count * 0.08);
                    const colorClass = `cloud-word-${item.side}`;
                    const delay = index * 0.05;
                    
                    return `<span class="cloud-word ${colorClass}" 
                                  style="font-size: ${size}px; opacity: ${opacity}; animation-delay: ${delay}s"
                                  title="${item.word}: ${item.forCount} for, ${item.againstCount} against"
                                  data-count="${item.count}">
                                ${item.word}
                            </span>`;
                }).join('')}
            </div>
        `;
    }
    
    extractKeywords(text) {
        const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'in', 'with', 'to', 'for', 'of', 'as', 'by', 'that', 'this', 'it', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can']);
        
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));
        
        const wordCount = new Map();
        words.forEach(word => {
            wordCount.set(word, (wordCount.get(word) || 0) + 1);
        });
        
        return Array.from(wordCount.entries())
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count);
    }
    
    createComparisonChart(analysis) {
        // Update metrics only (no canvas chart)
        const metrics = document.getElementById('comparisonMetrics');
        if (metrics) {
            metrics.innerHTML = `
                <div class="metric-row">
                    <span class="metric-label">Word Count</span>
                    <span class="metric-for">${analysis.for.wordCount}</span>
                    <span class="metric-against">${analysis.against.wordCount}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Arguments</span>
                    <span class="metric-for">${analysis.for.sentenceCount}</span>
                    <span class="metric-against">${analysis.against.sentenceCount}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Avg Words/Sentence</span>
                    <span class="metric-for">${analysis.for.avgWordsPerSentence.toFixed(1)}</span>
                    <span class="metric-against">${analysis.against.avgWordsPerSentence.toFixed(1)}</span>
                </div>
            `;
        }
    }
    
    drawRadarChart(ctx, canvas, analysis) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        const metrics = ['Strength', 'Confidence', 'Detail', 'Clarity'];
        const angles = metrics.map((_, i) => (Math.PI * 2 * i) / metrics.length - Math.PI / 2);
        
        // Normalize values
        const forValues = [
            analysis.for.strength / 100,
            analysis.for.confidence / 100,
            Math.min(analysis.for.wordCount / 200, 1),
            Math.min(analysis.for.sentenceCount / 10, 1)
        ];
        
        const againstValues = [
            analysis.against.strength / 100,
            analysis.against.confidence / 100,
            Math.min(analysis.against.wordCount / 200, 1),
            Math.min(analysis.against.sentenceCount / 10, 1)
        ];
        
        // Draw grid
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 5; i++) {
            ctx.beginPath();
            angles.forEach((angle, idx) => {
                const x = centerX + Math.cos(angle) * radius * (i / 5);
                const y = centerY + Math.sin(angle) * radius * (i / 5);
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.stroke();
        }
        
        // Draw axes
        angles.forEach(angle => {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
            ctx.stroke();
        });
        
        // Draw "For" polygon
        ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        forValues.forEach((value, idx) => {
            const x = centerX + Math.cos(angles[idx]) * radius * value;
            const y = centerY + Math.sin(angles[idx]) * radius * value;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw "Against" polygon
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        againstValues.forEach((value, idx) => {
            const x = centerX + Math.cos(angles[idx]) * radius * value;
            const y = centerY + Math.sin(angles[idx]) * radius * value;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw labels
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        metrics.forEach((label, idx) => {
            const x = centerX + Math.cos(angles[idx]) * (radius + 30);
            const y = centerY + Math.sin(angles[idx]) * (radius + 30);
            ctx.fillText(label, x, y);
        });
    }
    
    toggleVisualization() {
        const content = document.getElementById('vizContent');
        const btn = document.querySelector('.viz-toggle-btn');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            btn.innerHTML = '<i class="fas fa-eye-slash"></i> Hide Visualization';
        } else {
            content.style.display = 'none';
            btn.innerHTML = '<i class="fas fa-eye"></i> Show Visualization';
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.viz-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });
        
        // Update panels
        document.querySelectorAll('.viz-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(tabName + 'Panel').classList.add('active');
    }
}

// Initialize
const debateViz = new DebateVisualization();
window.debateViz = debateViz;

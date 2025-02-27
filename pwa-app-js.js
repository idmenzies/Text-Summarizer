document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const summarizeBtn = document.getElementById('summarizeBtn');
    const summaryOutput = document.getElementById('summaryOutput');
    const summaryContainer = document.getElementById('summaryContainer');
    const wordCount = document.getElementById('wordCount');
    const loadingIndicator = document.getElementById('loadingIndicator');

    summarizeBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        
        if (!text) {
            alert('Please enter or paste some text to summarize.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        summaryContainer.classList.add('hidden');
        
        // Use setTimeout to allow the UI to update before processing
        setTimeout(() => {
            const summary = summarizeText(text);
            
            // Update the UI with the summary
            summaryOutput.textContent = summary.text;
            wordCount.textContent = summary.wordCount;
            
            // Hide loading, show summary
            loadingIndicator.classList.add('hidden');
            summaryContainer.classList.remove('hidden');
        }, 10);
    });

    // Summarization function
    function summarizeText(text) {
        // 1. Split text into sentences
        const sentences = text
            .replace(/([.?!])\s*(?=[A-Z])/g, "$1|")
            .split("|")
            .filter(sentence => sentence.trim().length > 0);
        
        // 2. Calculate word frequency
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        const wordFrequency = {};
        
        words.forEach(word => {
            if (word.length > 3) { // Ignore short words
                wordFrequency[word] = (wordFrequency[word] || 0) + 1;
            }
        });
        
        // 3. Score sentences based on word frequency
        const sentenceScores = sentences.map(sentence => {
            const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            let score = 0;
            
            sentenceWords.forEach(word => {
                if (wordFrequency[word]) {
                    score += wordFrequency[word];
                }
            });
            
            return { 
                sentence, 
                score: score / Math.max(1, sentenceWords.length) 
            };
        });
        
        // 4. Sort sentences by score and pick top ones until we reach ~75 words
        const sortedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);
        
        let summaryText = '';
        let currentWordCount = 0;
        let sentenceIndex = 0;
        
        // Original sentence positions for proper ordering
        const originalPositions = sentenceScores.map((s, i) => ({ 
            sentence: s.sentence, 
            position: i 
        }));
        
        // Selected sentences based on score
        const selectedSentences = [];
        
        while (currentWordCount < 75 && sentenceIndex < sortedSentences.length) {
            const currentSentence = sortedSentences[sentenceIndex].sentence;
            const sentenceWordCount = (currentSentence.match(/\b\w+\b/g) || []).length;
            
            if (currentWordCount + sentenceWordCount <= 85) {
                selectedSentences.push(currentSentence);
                currentWordCount += sentenceWordCount;
            }
            
            sentenceIndex++;
        }
        
        // Reorder selected sentences to maintain original flow
        const selectedInOrder = selectedSentences
            .map(sentence => {
                const position = originalPositions.find(item => item.sentence === sentence)?.position || 0;
                return { sentence, position };
            })
            .sort((a, b) => a.position - b.position)
            .map(item => item.sentence);
        
        summaryText = selectedInOrder.join(' ');
        
        return {
            text: summaryText,
            wordCount: currentWordCount
        };
    }
});
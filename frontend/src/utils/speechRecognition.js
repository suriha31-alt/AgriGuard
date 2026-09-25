/**
 * Web Speech API Voice-to-Text helper for AgriGuard farmers.
 * Supports Tamil (ta-IN) and English (en-IN/en-US).
 */

export const isSpeechRecognitionSupported = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const createSpeechRecognizer = (lang = 'en', onResult, onError, onEnd) => {
    if (!isSpeechRecognitionSupported()) {
        if (onError) onError('Speech recognition is not supported in this browser.');
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map((res) => res[0].transcript)
            .join(' ');
        if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (onError) onError(event.error);
    };

    recognition.onend = () => {
        if (onEnd) onEnd();
    };

    return recognition;
};

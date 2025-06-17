import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceInput: (text: string) => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ isOpen, onClose, onVoiceInput }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const handleSend = () => {
    if (transcript.trim()) {
      onVoiceInput(transcript);
      setTranscript('');
      onClose();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Assistant</h2>
              <p className="text-gray-600">Speak naturally and I'll help you explore the scriptures</p>
            </div>

            {/* Animated Orb */}
            <div className="flex justify-center mb-8">
              <motion.div
                className="relative w-32 h-32"
                animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: isListening ? Infinity : 0, duration: 2 }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 opacity-20 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-40" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
                  {isListening ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Mic className="w-8 h-8 text-white" />
                    </motion.div>
                  ) : (
                    <MicOff className="w-8 h-8 text-white" />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Transcript Display */}
            {transcript && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-800">{transcript}</p>
              </div>
            )}

            {/* Controls */}
            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                <span>{isListening ? 'Stop' : 'Start'}</span>
              </button>

              {transcript && (
                <button
                  onClick={handleSend}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
                >
                  Send
                </button>
              )}
            </div>

            {/* Status */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {isListening ? 'Listening... Speak now' : 'Tap start to begin speaking'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
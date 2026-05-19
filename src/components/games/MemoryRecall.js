import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const WORDS_POOL = ["apple", "chair", "river", "lamp", "doctor", "orange", "garden", "window", "school", "pencil"];
const COLORS = [theme.colors.vgreen, theme.colors.purple, theme.colors.orange, theme.colors.yellow, theme.colors.t400, theme.colors.dgreen];

const getRandomElements = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export default function MemoryRecall({ onComplete }) {
  const [round, setRound] = useState(1);
  const [step, setStep] = useState('memorize'); // 'memorize', 'recall'
  const [words, setWords] = useState([]);
  const [options, setOptions] = useState([]);
  const [askIndex, setAskIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState(null);
  
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(38); // overall timer or round timer? Let's use 38s total test timer
  const [stats, setStats] = useState({ correct: 0, totalTime: 0 });

  useEffect(() => {
    // Total timer logic
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          finishGame(true); // timed out completely
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    startRound();
  }, [round]);

  const startRound = () => {
    setStep('memorize');
    setSelectedWord(null);
    const chosenWords = getRandomElements(WORDS_POOL, 4);
    setWords(chosenWords);
    
    const targetIdx = Math.floor(Math.random() * 4);
    setAskIndex(targetIdx);
    
    const targetWord = chosenWords[targetIdx];
    let otherWords = getRandomElements(WORDS_POOL.filter(w => !chosenWords.includes(w)), 5);
    setOptions(getRandomElements([targetWord, ...otherWords], 6));

    const t = setTimeout(() => {
      setStep('recall');
      setStartTime(Date.now());
    }, 3000);

    return () => clearTimeout(t);
  };

  const handleSelect = (word) => {
    setSelectedWord(word);
    
    setTimeout(() => {
      const timeTaken = (Date.now() - startTime) / 1000;
      const isCorrect = word === words[askIndex];
      
      const newStats = {
        correct: stats.correct + (isCorrect ? 1 : 0),
        totalTime: stats.totalTime + timeTaken
      };
      setStats(newStats);

      if (round < 8) {
        setRound(r => r + 1);
      } else {
        finishGame(false, newStats);
      }
    }, 800);
  };

  const finishGame = (timedOut, finalStats = stats) => {
    onComplete({ 
      memCorrect: finalStats.correct >= 5, // Pass if 5/8 correct
      memTime: finalStats.totalTime / 8, // Average time
      memTimeout: timedOut 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backBtn}>←</Text>
        <Text style={styles.title}>Memory Recall</Text>
        <Text style={styles.timer}>0:{timeLeft.toString().padStart(2, '0')} left</Text>
      </View>

      <View style={styles.content}>
        {step === 'memorize' ? (
          <>
            <Text style={styles.prompt}>Memorize these words</Text>
            <View style={styles.grid}>
              {words.map((w, i) => (
                <View key={i} style={[styles.wordBtn, { backgroundColor: COLORS[i % COLORS.length] }]}>
                  <Text style={styles.wordTxt}>{w}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>Which word was at position {askIndex + 1}?</Text>
            <View style={styles.grid}>
              {options.map((w, i) => {
                const isSelected = selectedWord === w;
                const isCorrect = w === words[askIndex];
                
                let bgColor = theme.colors.card;
                if (isSelected && isCorrect) bgColor = theme.colors.vgreen;
                else if (isSelected && !isCorrect) bgColor = theme.colors.redTxt;

                return (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.wordBtn, { backgroundColor: bgColor }]}
                    onPress={() => !selectedWord && handleSelect(w)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.wordTxt}>{w} {isSelected && isCorrect ? '✓' : ''}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      {/* Bottom Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{round}/8</Text>
          <Text style={styles.statLbl}>Round</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{round === 1 ? '--' : Math.round((stats.correct / (round - 1)) * 100)}%</Text>
          <Text style={styles.statLbl}>Accuracy</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{round === 1 ? '--' : (stats.totalTime / (round - 1)).toFixed(1)}s</Text>
          <Text style={styles.statLbl}>Avg RT</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.navy, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 40 },
  backBtn: { color: theme.colors.t400, fontSize: 24 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timer: { color: theme.colors.t400, fontSize: 14 },
  
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  prompt: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 40, lineHeight: 30 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  wordBtn: { width: '45%', paddingVertical: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wordTxt: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  statsBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  statBox: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLbl: { color: theme.colors.t400, fontSize: 12 }
});

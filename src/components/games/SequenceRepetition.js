import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export default function SequenceRepetition({ onComplete }) {
  const [round, setRound] = useState(1);
  const [step, setStep] = useState('watch'); // 'watch', 'play'
  const [sequence, setSequence] = useState('');
  const [userInput, setUserInput] = useState('');
  
  const [startTime, setStartTime] = useState(0);
  const [stats, setStats] = useState({ correct: 0, totalTime: 0 });
  const [timeLeft, setTimeLeft] = useState(90); // 90s total timer

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          finishGame(true);
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
    setStep('watch');
    setUserInput('');
    const length = Math.floor(Math.random() * 3) + 4; // 4 to 6 digits
    let seq = '';
    for (let i = 0; i < length; i++) {
      seq += Math.floor(Math.random() * 10).toString();
    }
    setSequence(seq);

    const t = setTimeout(() => {
      setStep('play');
      setStartTime(Date.now());
    }, 3000);

    return () => clearTimeout(t);
  };

  const handleSubmit = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = userInput.trim() === sequence;

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
  };

  const finishGame = (timedOut, finalStats = stats) => {
    onComplete({
      seqCorrect: finalStats.correct >= 5, // Pass if 5/8 correct
      seqTime: finalStats.totalTime / 8,
      seqTimeout: timedOut
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backBtn}>←</Text>
        <Text style={styles.title}>Sequence Recall</Text>
        <Text style={styles.timer}>0:{timeLeft.toString().padStart(2, '0')} left</Text>
      </View>

      <View style={styles.content}>
        {step === 'watch' ? (
          <>
            <Text style={styles.prompt}>Remember this sequence</Text>
            <View style={styles.seqBox}>
              <Text style={styles.seqText}>{sequence}</Text>
            </View>
            <Text style={styles.helperText}>Game starts in 3s...</Text>
          </>
        ) : (
          <>
            <Text style={styles.prompt}>Repeat the sequence exactly</Text>
            
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              keyboardType="numeric"
              placeholder="Type numbers here..."
              placeholderTextColor={theme.colors.t400}
              autoFocus
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnTxt}>Submit Answer</Text>
            </TouchableOpacity>
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
  prompt: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 40 },
  
  seqBox: { paddingVertical: 40, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, marginBottom: 40, width: '100%', alignItems: 'center' },
  seqText: { fontSize: 48, fontWeight: '900', letterSpacing: 12, color: theme.colors.vgreen },
  helperText: { color: theme.colors.t400, fontSize: 14 },

  input: { width: '100%', padding: 24, fontSize: 32, letterSpacing: 8, borderRadius: 16, marginBottom: 40, backgroundColor: theme.colors.card, color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  submitBtn: { backgroundColor: theme.colors.vgreen, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 100, width: '100%', alignItems: 'center' },
  submitBtnTxt: { color: '#fff', fontWeight: 'bold', fontSize: 18 },

  statsBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  statBox: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLbl: { color: theme.colors.t400, fontSize: 12 }
});

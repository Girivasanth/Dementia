import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const PAIRS = {
  "spoon": "kitchen", "toothbrush": "bathroom", "pillow": "bedroom",
  "book": "library", "stethoscope": "hospital", "vegetables": "market",
  "soap": "bathroom", "towel": "bathroom", "pan": "kitchen", "plate": "kitchen",
  "blanket": "bedroom", "lamp": "bedroom", "notebook": "library", "pen": "library",
  "syringe": "hospital", "bandage": "hospital", "fruit": "market", "bread": "market"
};

const getRandomElements = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export default function ObjectMatching({ onComplete }) {
  const [round, setRound] = useState(1);
  const [item, setItem] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  const [startTime, setStartTime] = useState(0);
  const [stats, setStats] = useState({ correct: 0, totalTime: 0 });
  const [timeLeft, setTimeLeft] = useState(60); // 60s total timer for 8 matches

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
    setSelectedPlace(null);
    const keys = Object.keys(PAIRS);
    const chosenItem = keys[Math.floor(Math.random() * keys.length)];
    const correctPlace = PAIRS[chosenItem];
    
    // Get unique other places
    const allPlaces = [...new Set(Object.values(PAIRS))];
    let otherPlaces = getRandomElements(allPlaces.filter(p => p !== correctPlace), 3);
    
    // Sometimes we might not have 3 unique wrong places if PAIRS is small, but PAIRS has 5 unique places, so we do.
    setOptions(getRandomElements([correctPlace, ...otherPlaces], 4));
    
    setItem(chosenItem);
    setCorrectAnswer(correctPlace);
    setStartTime(Date.now());
  };

  const handleSelect = (place) => {
    setSelectedPlace(place);
    
    setTimeout(() => {
      const timeTaken = (Date.now() - startTime) / 1000;
      const isCorrect = place === correctAnswer;
      
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
      matchCorrect: finalStats.correct >= 5, // Pass if 5/8 correct
      matchTime: finalStats.totalTime / 8, // Average time
      matchTimeout: timedOut
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backBtn}>←</Text>
        <Text style={styles.title}>Object Matching</Text>
        <Text style={styles.timer}>0:{timeLeft.toString().padStart(2, '0')} left</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>Match the object to the correct place</Text>
        
        <View style={styles.itemBox}>
          <Text style={styles.itemText}>{item}</Text>
        </View>

        <View style={styles.optionsGrid}>
          {options.map((opt, i) => {
            const isSelected = selectedPlace === opt;
            const isCorrect = opt === correctAnswer;
            let bgColor = theme.colors.card;
            if (isSelected && isCorrect) bgColor = theme.colors.vgreen;
            else if (isSelected && !isCorrect) bgColor = theme.colors.redTxt;

            return (
              <TouchableOpacity 
                key={i} 
                style={[styles.optBtn, { backgroundColor: bgColor }]} 
                onPress={() => !selectedPlace && handleSelect(opt)}
                activeOpacity={0.8}
              >
                <Text style={styles.optText}>{opt} {isSelected && isCorrect ? '✓' : ''}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  prompt: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 40 },
  
  itemBox: { paddingVertical: 32, paddingHorizontal: 40, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, marginBottom: 40, width: '100%', alignItems: 'center' },
  itemText: { fontSize: 32, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' },
  
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  optBtn: { width: '45%', paddingVertical: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optText: { fontSize: 16, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' },

  statsBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  statBox: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLbl: { color: theme.colors.t400, fontSize: 12 }
});

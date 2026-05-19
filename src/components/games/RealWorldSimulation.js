import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const SCENARIOS = [
  { q: "You need to take medicine after breakfast. What should you do first?", a: "eat breakfast", fake: ["take medicine", "call doctor", "drink water"] },
  { q: "You are going to the market and need milk, rice, and soap. What item would you buy for cooking?", a: "rice", fake: ["milk", "soap", "pot"] },
  { q: "You smell gas in the kitchen. What should you do first?", a: "turn off the stove", fake: ["light a match", "call friend", "close window"] },
  { q: "You want to visit a doctor tomorrow morning. What should you do tonight?", a: "set a reminder", fake: ["go to hospital", "eat breakfast", "sleep late"] },
  { q: "The room is dark and you want to read. What should you do first?", a: "turn on the light", fake: ["open book", "wear glasses", "close eyes"] },
  { q: "You spilled water on the floor. What should you do next?", a: "wipe it up", fake: ["walk over it", "pour more water", "ignore it"] },
  { q: "Your phone battery is at 1%. What should you do?", a: "charge it", fake: ["make a call", "play a game", "turn up brightness"] },
  { q: "You are feeling cold in your room. What should you do?", a: "wear a sweater", fake: ["open the fridge", "turn on AC", "drink cold water"] }
];

const getRandomElements = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

export default function RealWorldSimulation({ onComplete }) {
  const [round, setRound] = useState(1);
  const [scenario, setScenario] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOpt, setSelectedOpt] = useState(null);
  
  const [startTime, setStartTime] = useState(0);
  const [stats, setStats] = useState({ correct: 0, totalTime: 0 });
  const [timeLeft, setTimeLeft] = useState(120); // 120s total timer for 8 questions

  // Keep track of shown scenarios to not repeat them if possible
  const [usedScenarios, setUsedScenarios] = useState([]);

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
    setSelectedOpt(null);
    
    // Pick an unused scenario if possible
    let available = SCENARIOS.filter(s => !usedScenarios.includes(s.q));
    if (available.length === 0) available = SCENARIOS;
    
    const sc = available[Math.floor(Math.random() * available.length)];
    setUsedScenarios(prev => [...prev, sc.q]);

    const opts = getRandomElements([sc.a, ...sc.fake], 4);
    
    setScenario(sc);
    setOptions(opts);
    setStartTime(Date.now());
  };

  const handleSelect = (opt) => {
    setSelectedOpt(opt);
    
    setTimeout(() => {
      const timeTaken = (Date.now() - startTime) / 1000;
      const isCorrect = opt === scenario.a;

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
      simCorrect: finalStats.correct >= 5, // Pass if 5/8 correct
      simTime: finalStats.totalTime / 8,
      simTimeout: timedOut
    });
  };

  if (!scenario) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backBtn}>←</Text>
        <Text style={styles.title}>Real-World Simulation</Text>
        <Text style={styles.timer}>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} left</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>{scenario.q}</Text>

        <View style={styles.optionsList}>
          {options.map((opt, i) => {
            const isSelected = selectedOpt === opt;
            const isCorrect = opt === scenario.a;
            let bgColor = theme.colors.card;
            if (isSelected && isCorrect) bgColor = theme.colors.vgreen;
            else if (isSelected && !isCorrect) bgColor = theme.colors.redTxt;

            return (
              <TouchableOpacity 
                key={i} 
                style={[styles.optBtn, { backgroundColor: bgColor }]} 
                onPress={() => !selectedOpt && handleSelect(opt)}
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
  
  content: { flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  prompt: { color: '#fff', fontSize: 22, textAlign: 'center', marginBottom: 40, lineHeight: 32, fontFamily: 'DM Serif Display' },
  
  optionsList: { width: '100%', gap: 16 },
  optBtn: { width: '100%', paddingVertical: 20, paddingHorizontal: 24, borderRadius: 16, alignItems: 'center' },
  optText: { fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'capitalize' },

  statsBar: { flexDirection: 'row', justifyContent: 'space-around', padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  statBox: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLbl: { color: theme.colors.t400, fontSize: 12 }
});

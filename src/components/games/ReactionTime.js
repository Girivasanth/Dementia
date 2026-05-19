import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export default function ReactionTime({ onComplete }) {
  const [round, setRound] = useState(1);
  const [state, setState] = useState('waiting'); // 'waiting', 'ready', 'too_early', 'done'
  
  const [startTime, setStartTime] = useState(0);
  const [lastRoundMs, setLastRoundMs] = useState('--');
  
  const [stats, setStats] = useState({ totalReactTime: 0, earlyTaps: 0, validTaps: 0 });
  const [timeLeft, setTimeLeft] = useState(45); // 45 seconds total

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
    setState('waiting');
    const delay = Math.random() * 2500 + 1500;
    const t = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
    return () => clearTimeout(t);
  };

  const handleTap = () => {
    if (state === 'waiting') {
      setState('too_early');
      setStats(s => ({ ...s, earlyTaps: s.earlyTaps + 1 }));
      setTimeout(() => startRound(), 1500);
    } else if (state === 'ready') {
      const reactTimeMs = Date.now() - startTime;
      const reactTimeSeconds = reactTimeMs / 1000;
      setLastRoundMs(reactTimeMs + 'ms');
      setState('done');
      
      const newStats = {
        ...stats,
        totalReactTime: stats.totalReactTime + reactTimeSeconds,
        validTaps: stats.validTaps + 1
      };
      setStats(newStats);

      setTimeout(() => {
        if (round < 8) {
          setRound(r => r + 1);
        } else {
          finishGame(false, newStats);
        }
      }, 1000);
    }
  };

  const finishGame = (timedOut, finalStats = stats) => {
    const avgReact = finalStats.validTaps > 0 ? (finalStats.totalReactTime / finalStats.validTaps) : 99;
    onComplete({ 
      reactCorrect: avgReact < 1.2 && !timedOut,
      reactTime: avgReact,
      reactTimeout: timedOut
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.backBtn}>←</Text>
        <Text style={styles.title}>Reaction Time</Text>
        <Text style={styles.timer}>0:{timeLeft.toString().padStart(2, '0')} left</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>Tap the green circle the instant it appears</Text>
        
        <View style={styles.circleContainer}>
          {state === 'ready' && (
            <TouchableOpacity 
              style={styles.giantCircle} 
              activeOpacity={0.7}
              onPress={handleTap}
            >
              <Text style={styles.circleTitle}>GO!</Text>
              <Text style={styles.circleSub}>Tap now!</Text>
            </TouchableOpacity>
          )}

          {(state === 'waiting' || state === 'too_early' || state === 'done') && (
            <TouchableOpacity 
              style={[
                styles.placeholderCircle,
                state === 'too_early' && { borderColor: theme.colors.redTxt, borderWidth: 2 }
              ]} 
              activeOpacity={1}
              onPress={handleTap}
            >
              {state === 'too_early' && <Text style={styles.errorTxt}>Too Early!</Text>}
              {state === 'done' && <Text style={styles.doneTxt}>Captured</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{round}/8</Text>
          <Text style={styles.statLbl}>Round</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{lastRoundMs}</Text>
          <Text style={styles.statLbl}>Last round</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statVal}>{stats.earlyTaps}</Text>
          <Text style={styles.statLbl}>Early taps</Text>
        </View>
      </View>
      <Text style={styles.helperText}>Response times compared against your personal baseline · Not a population average</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.black, paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 40 },
  backBtn: { color: theme.colors.t400, fontSize: 24 },
  title: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timer: { color: theme.colors.t400, fontSize: 14 },
  
  content: { flex: 1, paddingHorizontal: 30, alignItems: 'center' },
  prompt: { color: theme.colors.t400, fontSize: 16, textAlign: 'center', marginBottom: 60, lineHeight: 24 },
  
  circleContainer: { height: 280, alignItems: 'center', justifyContent: 'center' },
  giantCircle: { width: 280, height: 280, borderRadius: 140, backgroundColor: theme.colors.vgreen, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.vgreen, shadowOffset: {width:0, height:0}, shadowOpacity: 0.5, shadowRadius: 40 },
  circleTitle: { color: '#fff', fontSize: 48, fontWeight: '900', marginBottom: 8 },
  circleSub: { color: '#fff', fontSize: 18 },
  
  placeholderCircle: { width: 280, height: 280, borderRadius: 140, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  errorTxt: { color: theme.colors.redTxt, fontSize: 24, fontWeight: 'bold' },
  doneTxt: { color: theme.colors.t400, fontSize: 24, fontWeight: 'bold' },

  statsBar: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24, paddingVertical: 20 },
  statBox: { alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLbl: { color: theme.colors.t400, fontSize: 12 },
  
  helperText: { color: theme.colors.t400, fontSize: 10, textAlign: 'center', paddingHorizontal: 40, paddingBottom: 40, lineHeight: 16 }
});

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MemoryRecall from './MemoryRecall';
import ObjectMatching from './ObjectMatching';
import ReactionTime from './ReactionTime';
import SequenceRepetition from './SequenceRepetition';
import RealWorldSimulation from './RealWorldSimulation';

export default function GameEngine({ onComplete }) {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [scores, setScores] = useState({});

  const handlePhaseComplete = (phase, phaseScore) => {
    const newScores = { ...scores, ...phaseScore };
    setScores(newScores);

    if (phase < 5) {
      setCurrentPhase(phase + 1);
    } else {
      calculateFinalResults(newScores);
    }
  };

  const calculateFinalResults = (finalScores) => {
    // Same scoring logic as before
    const memScore = finalScores.memCorrect ? 20 : 0;
    const matchScore = finalScores.matchCorrect ? 20 : 0;
    
    let reactScore = 0;
    if (finalScores.reactCorrect) {
      reactScore = finalScores.reactTime < 0.8 ? 20 : (finalScores.reactTime < 1.2 ? 15 : 10);
    }
    
    const seqScore = finalScores.seqCorrect ? 20 : 0;
    const simScore = finalScores.simCorrect ? 20 : 0;

    const ccs = memScore + matchScore + reactScore + seqScore + simScore;
    const frs = Math.min(100, ccs * 1.1);
    
    let riskLevel = 'Low Risk';
    if (frs < 55) riskLevel = 'High Risk';
    else if (frs < 75) riskLevel = 'Moderate';

    const avgTime = ((finalScores.memTime || 5) + (finalScores.matchTime || 5) + (finalScores.seqTime || 5) + (finalScores.simTime || 5)) / 4;
    const confidence = Math.max(50, 95 - (avgTime * 2));

    onComplete({
      score: frs.toFixed(1),
      ccs: ccs.toFixed(1),
      riskLevel,
      confidence: Math.floor(confidence)
    });
  };

  return (
    <View style={styles.container}>
      {currentPhase === 1 && <MemoryRecall onComplete={(s) => handlePhaseComplete(1, s)} />}
      {currentPhase === 2 && <ObjectMatching onComplete={(s) => handlePhaseComplete(2, s)} />}
      {currentPhase === 3 && <ReactionTime onComplete={(s) => handlePhaseComplete(3, s)} />}
      {currentPhase === 4 && <SequenceRepetition onComplete={(s) => handlePhaseComplete(4, s)} />}
      {currentPhase === 5 && <RealWorldSimulation onComplete={(s) => handlePhaseComplete(5, s)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  }
});

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  SafeAreaView, TextInput, KeyboardAvoidingView, Platform,
  StatusBar, Animated, Dimensions,
} from 'react-native';
import io from 'socket.io-client';
import { theme } from './theme';
import GameEngine from './src/components/games/GameEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.1.32:4000';

const socket = io(SOCKET_URL, { reconnectionAttempts: 5 });

// ─── Small reusable components ────────────────────────────────────────────────

function Avatar({ name, size = 44 }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarTxt, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

function StatusPill({ label, color, bg }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillTxt, { color }]}>{label}</Text>
    </View>
  );
}

function ScoreRing({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(parseFloat(score) || 0, 0), 100);
  const strokeDashoffset = circumference * (1 - pct / 100);
  const color = pct >= 75 ? theme.colors.vgreen : pct >= 55 ? '#EF9F27' : theme.colors.redTxt;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: 'rgba(255,255,255,0.12)' }} />
      {/* Score text */}
      <Text style={{ color: '#fff', fontSize: size * 0.28, fontWeight: '900' }}>{score || '--'}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: size * 0.1, marginTop: 2 }}>/ 100</Text>
    </View>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const handleSubmit = () => {
    if (mode === 'signup' && (!name.trim() || !age.trim())) return;
    const fallbackName = name.trim() || 'Patient';
    const genId = fallbackName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PT';
    socket.emit('register_patient', { id: genId, name: fallbackName, email, age: parseInt(age) || 45 });
    onAuth({ id: genId, name: fallbackName, age: parseInt(age) || 45 });
  };

  return (
    <SafeAreaView style={styles.authBg}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Logo */}
            <View style={styles.authLogoRow}>
              <View style={styles.authLogoDot} />
              <Text style={styles.authLogoTxt}>CogniSense</Text>
            </View>

            {/* Hero */}
            <View style={styles.authHero}>
              <View style={styles.authBrainCircle}>
                <Text style={{ fontSize: 40 }}>🧠</Text>
              </View>
              <Text style={styles.authTitle}>
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </Text>
              <Text style={styles.authSub}>
                Doctor-supervised cognitive health monitoring
              </Text>
            </View>

            {/* Form card */}
            <View style={styles.authCard}>
              {mode === 'signup' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput style={styles.input} placeholder="e.g. Priya Sharma" value={name} onChangeText={setName} placeholderTextColor={theme.colors.t400} />
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Age</Text>
                    <TextInput style={styles.input} placeholder="e.g. 68" value={age} onChangeText={setAge} keyboardType="numeric" placeholderTextColor={theme.colors.t400} />
                  </View>
                </>
              )}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput style={styles.input} placeholder="you@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor={theme.colors.t400} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput style={styles.input} placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={theme.colors.t400} />
              </View>

              <TouchableOpacity style={styles.authBtn} onPress={handleSubmit} activeOpacity={0.85}>
                <Text style={styles.authBtnTxt}>{mode === 'signup' ? 'Create Account' : 'Sign In'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={styles.authToggle}>
                <Text style={styles.authToggleTxt}>
                  {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                  <Text style={{ color: theme.colors.dgreen, fontWeight: '700' }}>
                    {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.authFooter}>NDHM Aligned · Ayushman Bharat Integrated</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Home / Dashboard Screen ──────────────────────────────────────────────────

function HomeScreen({ user, testState, appointmentState, lastResults, onStartTest, onBookAppointment, onOpenChat }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const score = lastResults?.score || '--';
  const riskLevel = lastResults?.riskLevel || 'Pending';
  const riskColor = riskLevel === 'High Risk' ? theme.colors.redTxt : riskLevel === 'Moderate' ? '#EF9F27' : riskLevel === 'Low Risk' ? theme.colors.vgreen : theme.colors.t400;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.dgreen }}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <Animated.View style={[styles.homeHeader, { opacity: fadeAnim }]}>
          <View style={styles.homeHeaderTop}>
            <View>
              <Text style={styles.homeGreet}>{greeting} 👋</Text>
              <Text style={styles.homeName}>{user.name}</Text>
            </View>
            <TouchableOpacity style={styles.chatFab} onPress={onOpenChat}>
              <Text style={{ fontSize: 20 }}>💬</Text>
            </TouchableOpacity>
          </View>

          {/* Score card */}
          <View style={styles.scoreCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreCardLbl}>Cognitive Score</Text>
              <Text style={styles.scoreCardVal}>{score}</Text>
              <View style={[styles.riskBadge, { backgroundColor: `${riskColor}25` }]}>
                <Text style={[styles.riskBadgeTxt, { color: riskColor }]}>{riskLevel}</Text>
              </View>
            </View>
            <ScoreRing score={score} size={100} />
          </View>
        </Animated.View>

        {/* ── Body ── */}
        <Animated.View style={[styles.homeBody, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Test assignment card */}
          {testState === 'assigned' && (
            <View style={styles.taskCard}>
              <View style={styles.taskCardHeader}>
                <Text style={styles.taskCardTitle}>🧠 Cognitive Assessment</Text>
                <View style={styles.dueBadge}><Text style={styles.dueBadgeTxt}>Due Today</Text></View>
              </View>
              <Text style={styles.taskCardDesc}>Assigned by Dr. Raghavan · ~5 minutes</Text>
              <View style={styles.taskProgress}>
                <View style={styles.taskProgressFill} />
              </View>
              <TouchableOpacity style={styles.startBtn} onPress={onStartTest} activeOpacity={0.85}>
                <Text style={styles.startBtnTxt}>Start Assessment →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Appointment section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>APPOINTMENTS</Text>
          </View>

          {appointmentState === 'idle' && (
            <TouchableOpacity style={styles.appointmentCard} onPress={onBookAppointment} activeOpacity={0.85}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>📅</Text>
              <Text style={styles.appointmentCardTitle}>Book an Appointment</Text>
              <Text style={styles.appointmentCardDesc}>Request a consultation with Dr. Raghavan</Text>
            </TouchableOpacity>
          )}

          {appointmentState === 'pending' && (
            <View style={[styles.appointmentCard, { borderColor: '#EF9F27', backgroundColor: '#FFFBF0' }]}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>⏳</Text>
              <Text style={[styles.appointmentCardTitle, { color: '#B06000' }]}>Appointment Pending</Text>
              <Text style={[styles.appointmentCardDesc, { color: '#B06000' }]}>Awaiting Dr. Raghavan's confirmation</Text>
            </View>
          )}

          {appointmentState === 'accepted' && (
            <View style={[styles.appointmentCard, { borderColor: theme.colors.vgreen, backgroundColor: '#F0FFF6' }]}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>✅</Text>
              <Text style={[styles.appointmentCardTitle, { color: theme.colors.dgreen }]}>Appointment Confirmed</Text>
              <Text style={[styles.appointmentCardDesc, { color: theme.colors.t600 }]}>Dr. Raghavan will message you shortly</Text>
            </View>
          )}

          {/* Quick stats */}
          {lastResults && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>LAST ASSESSMENT</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardVal}>{lastResults.ccs || '--'}</Text>
                  <Text style={styles.statCardLbl}>CCS Score</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardVal}>{lastResults.confidence || '--'}%</Text>
                  <Text style={styles.statCardLbl}>Confidence</Text>
                </View>
                <View style={[styles.statCard, { borderColor: riskColor }]}>
                  <Text style={[styles.statCardVal, { color: riskColor, fontSize: 13 }]}>{riskLevel}</Text>
                  <Text style={styles.statCardLbl}>Risk Level</Text>
                </View>
              </View>
            </>
          )}

          {/* No test assigned idle state */}
          {testState === 'idle' && (
            <View style={styles.idleCard}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>🌿</Text>
              <Text style={styles.idleCardTitle}>All caught up</Text>
              <Text style={styles.idleCardDesc}>No assessments pending. Your doctor will assign one when needed.</Text>
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Advisory Screen ──────────────────────────────────────────────────────────

function AdvisoryScreen({ onProceed }) {
  return (
    <SafeAreaView style={[styles.advisoryBg]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.advisoryScroll}>
        <View style={styles.advisoryIcon}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
        </View>
        <Text style={styles.advisoryTitle}>Additional Scans Advised</Text>
        <Text style={styles.advisoryBody}>
          Based on your age profile, Dr. Raghavan has requested that you complete both an{' '}
          <Text style={{ fontWeight: '700', color: theme.colors.t800 }}>MRI Brain Scan</Text> and an{' '}
          <Text style={{ fontWeight: '700', color: theme.colors.t800 }}>OCT Retinal Scan</Text> in addition to this cognitive test.
        </Text>

        <View style={styles.advisorySteps}>
          {[
            { icon: '🧠', title: 'MRI Brain Scan', desc: 'Structural brain imaging at your nearest diagnostic centre' },
            { icon: '👁', title: 'OCT Retinal Scan', desc: 'Non-invasive retinal imaging — available at most eye clinics' },
            { icon: '📱', title: 'Cognitive Assessment', desc: 'Complete the 5-game test below (takes ~5 minutes)' },
          ].map((step, i) => (
            <View key={i} style={styles.advisoryStep}>
              <View style={styles.advisoryStepNum}><Text style={styles.advisoryStepNumTxt}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.advisoryStepTitle}>{step.icon} {step.title}</Text>
                <Text style={styles.advisoryStepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.advisoryBtn} onPress={onProceed} activeOpacity={0.85}>
          <Text style={styles.advisoryBtnTxt}>I understand — Start Cognitive Test</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────

function ResultsScreen({ results, onHome, onChat }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const score = parseFloat(results.score) || 0;
  const riskColor = results.riskLevel === 'High Risk' ? theme.colors.redTxt : results.riskLevel === 'Moderate' ? '#EF9F27' : theme.colors.vgreen;
  const riskBg = results.riskLevel === 'High Risk' ? theme.colors.redBg : results.riskLevel === 'Moderate' ? '#FFF8EC' : '#F0FFF6';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.cream }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.resultsScroll}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <TouchableOpacity onPress={onHome} style={styles.resultsBack}>
            <Text style={styles.resultsBackTxt}>← Back to Home</Text>
          </TouchableOpacity>

          <Text style={styles.resultsTitle}>Assessment Complete</Text>
          <Text style={styles.resultsDate}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>

          {/* Score card */}
          <Animated.View style={[styles.resultsScoreCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.resultsScoreLbl}>Final Risk Score (FRS)</Text>
            <Text style={styles.resultsScoreBig}>{results.score}</Text>
            <View style={[styles.resultsRiskBadge, { backgroundColor: `${riskColor}30` }]}>
              <Text style={[styles.resultsRiskTxt, { color: riskColor }]}>{results.riskLevel}</Text>
            </View>
            <View style={styles.resultsScoreBar}>
              <View style={[styles.resultsScoreBarFill, { width: `${score}%`, backgroundColor: riskColor }]} />
            </View>
          </Animated.View>

          {/* Domain breakdown */}
          <View style={styles.domainGrid}>
            {[
              { label: 'CCS Score', value: results.ccs },
              { label: 'Confidence', value: `${results.confidence}%` },
            ].map((d, i) => (
              <View key={i} style={styles.domainCard}>
                <Text style={styles.domainVal}>{d.value}</Text>
                <Text style={styles.domainLbl}>{d.label}</Text>
              </View>
            ))}
          </View>

          {/* Status message */}
          <View style={[styles.resultsAlert, { backgroundColor: riskBg, borderColor: `${riskColor}40` }]}>
            <Text style={[styles.resultsAlertTitle, { color: riskColor }]}>
              {results.riskLevel === 'High Risk' ? '⚠️ Attention Required' : results.riskLevel === 'Moderate' ? '📋 Follow-up Recommended' : '✅ Results Look Good'}
            </Text>
            <Text style={[styles.resultsAlertBody, { color: riskColor }]}>
              {results.riskLevel === 'High Risk'
                ? 'Your results have been flagged. Dr. Raghavan will review and contact you shortly.'
                : results.riskLevel === 'Moderate'
                ? 'Moderate indicators detected. A follow-up assessment is recommended in 3 months.'
                : 'No significant cognitive concerns detected. Continue routine check-ins.'}
            </Text>
          </View>

          <View style={styles.resultsTransmit}>
            <Text style={styles.resultsTransmitTxt}>🔒 Results securely transmitted to Dr. Raghavan</Text>
          </View>

          <TouchableOpacity style={styles.chatBtn} onPress={onChat} activeOpacity={0.85}>
            <Text style={styles.chatBtnTxt}>💬 Message Dr. Raghavan</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeBtn} onPress={onHome} activeOpacity={0.85}>
            <Text style={styles.homeBtnTxt}>Return to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Chat Screen ──────────────────────────────────────────────────────────────

function ChatScreen({ userId, userName, messages, onBack, onSend }) {
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={onBack} style={styles.chatBackBtn}>
          <Text style={styles.chatBackTxt}>←</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Avatar name="Dr Raghavan" size={36} />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.chatHeaderName}>Dr. Raghavan</Text>
            <Text style={styles.chatHeaderRole}>Neurologist · CMC</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={styles.chatMessages}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.chatSecure}>🔒 End-to-end encrypted</Text>
        {messages.length === 0 && (
          <Text style={styles.chatEmpty}>No messages yet. Say hello to Dr. Raghavan!</Text>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender === 'patient';
          return (
            <View key={i} style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
              {!isMe && <Avatar name="Dr Raghavan" size={28} />}
              <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleThem]}>
                {msg.type === 'game_request' ? (
                  <View>
                    <Text style={[styles.msgTxt, { fontWeight: '700', marginBottom: 6 }]}>🧠 Cognitive Test Requested</Text>
                    <Text style={styles.msgTxt}>{msg.text}</Text>
                  </View>
                ) : (
                  <Text style={[styles.msgTxt, isMe && { color: '#fff' }]}>{msg.text}</Text>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Message Dr. Raghavan..."
            placeholderTextColor={theme.colors.t400}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity style={[styles.chatSendBtn, !text.trim() && { opacity: 0.4 }]} onPress={handleSend} disabled={!text.trim()}>
            <Text style={styles.chatSendTxt}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState('auth'); // 'auth' | 'home' | 'advisory' | 'playing' | 'results' | 'chat'
  const [user, setUser] = useState(null);
  const [testState, setTestState] = useState('idle'); // 'idle' | 'assigned'
  const [appointmentState, setAppointmentState] = useState('idle');
  const [results, setResults] = useState(null);
  const [requireScans, setRequireScans] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on('test_assigned', (data) => {
      setRequireScans(!!data.requireScans);
      setTestState('assigned');
      setScreen('home');
    });

    socket.on('appointment_accepted', (data) => {
      if (user && data.patientId === user.id) setAppointmentState('accepted');
    });

    socket.on('receive_message', (data) => {
      if (user && data.patientId === user.id && data.sender === 'doctor') {
        setMessages(prev => [...prev, data]);
      }
    });

    socket.on('game_attendance_requested', (data) => {
      if (user && data.patientId === user.id) setTestState('assigned');
    });

    return () => {
      socket.off('test_assigned');
      socket.off('appointment_accepted');
      socket.off('receive_message');
      socket.off('game_attendance_requested');
    };
  }, [user]);

  const handleAuth = (userData) => {
    setUser(userData);
    setScreen('home');
  };

  const handleStartTest = () => {
    setScreen(requireScans ? 'advisory' : 'playing');
  };

  const handleGameComplete = (gameResults) => {
    setResults(gameResults);
    setScreen('results');
    socket.emit('complete_test', { patientId: user?.id, results: gameResults });
  };

  const handleBookAppointment = () => {
    setAppointmentState('pending');
    socket.emit('book_appointment', { patientId: user?.id, name: user?.name });
  };

  const handleSendMessage = (text) => {
    const msg = { patientId: user?.id, sender: 'patient', text, type: 'text' };
    socket.emit('send_message', msg);
    setMessages(prev => [...prev, msg]);
  };

  if (screen === 'auth') return <AuthScreen onAuth={handleAuth} />;

  if (screen === 'playing') return <GameEngine onComplete={handleGameComplete} />;

  if (screen === 'advisory') return <AdvisoryScreen onProceed={() => setScreen('playing')} />;

  if (screen === 'results') return (
    <ResultsScreen
      results={results}
      onHome={() => { setScreen('home'); setTestState('idle'); setAppointmentState('idle'); }}
      onChat={() => setScreen('chat')}
    />
  );

  if (screen === 'chat') return (
    <ChatScreen
      userId={user?.id}
      userName={user?.name}
      messages={messages}
      onBack={() => setScreen('home')}
      onSend={handleSendMessage}
    />
  );

  // Home
  return (
    <HomeScreen
      user={user}
      testState={testState}
      appointmentState={appointmentState}
      lastResults={results}
      onStartTest={handleStartTest}
      onBookAppointment={handleBookAppointment}
      onOpenChat={() => setScreen('chat')}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Avatar
  avatar: { backgroundColor: theme.colors.dgreen, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { color: '#fff', fontWeight: '800' },

  // Pill
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  pillTxt: { fontSize: 11, fontWeight: '700' },

  // ── Auth ──
  authBg: { flex: 1, backgroundColor: theme.colors.mint },
  authScroll: { flexGrow: 1, padding: 28, paddingTop: 20 },
  authLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 },
  authLogoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.dgreen },
  authLogoTxt: { fontSize: 20, fontWeight: '800', color: theme.colors.dgreen },
  authHero: { alignItems: 'center', marginBottom: 32 },
  authBrainCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.vgreen, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: theme.colors.vgreen, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  authTitle: { fontSize: 28, fontWeight: '800', color: theme.colors.t800, textAlign: 'center', marginBottom: 8 },
  authSub: { fontSize: 14, color: theme.colors.t600, textAlign: 'center', lineHeight: 20 },
  authCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: theme.colors.t600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: theme.colors.mint, borderRadius: 12, padding: 14, fontSize: 15, color: theme.colors.t800, borderWidth: 1, borderColor: theme.colors.lgreen },
  authBtn: { backgroundColor: theme.colors.dgreen, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, shadowColor: theme.colors.dgreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  authBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  authToggle: { marginTop: 16, alignItems: 'center' },
  authToggleTxt: { fontSize: 13, color: theme.colors.t600 },
  authFooter: { textAlign: 'center', fontSize: 11, color: theme.colors.t400, marginTop: 24 },

  // ── Home ──
  homeHeader: { backgroundColor: theme.colors.dgreen, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  homeHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  homeGreet: { fontSize: 13, color: theme.colors.lgreen, marginBottom: 2 },
  homeName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  chatFab: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  scoreCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  scoreCardLbl: { fontSize: 12, color: theme.colors.lgreen, marginBottom: 4 },
  scoreCardVal: { fontSize: 44, fontWeight: '900', color: '#fff', lineHeight: 48 },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginTop: 8 },
  riskBadgeTxt: { fontSize: 12, fontWeight: '700' },

  homeBody: { backgroundColor: theme.colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -16, padding: 24, minHeight: 500 },
  sectionHeader: { marginBottom: 12, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.t400, letterSpacing: 1, textTransform: 'uppercase' },

  taskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  taskCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskCardTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.t800 },
  dueBadge: { backgroundColor: '#FFF0D4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dueBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#B06000' },
  taskCardDesc: { fontSize: 13, color: theme.colors.t400, marginBottom: 14 },
  taskProgress: { height: 4, backgroundColor: theme.colors.mint, borderRadius: 100, marginBottom: 16 },
  taskProgressFill: { height: 4, width: '0%', backgroundColor: theme.colors.vgreen, borderRadius: 100 },
  startBtn: { backgroundColor: theme.colors.dgreen, borderRadius: 12, padding: 14, alignItems: 'center', shadowColor: theme.colors.dgreen, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  startBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  appointmentCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.lgreen, borderStyle: 'dashed' },
  appointmentCardTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.dgreen, marginBottom: 4 },
  appointmentCardDesc: { fontSize: 13, color: theme.colors.t400, textAlign: 'center' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)' },
  statCardVal: { fontSize: 20, fontWeight: '800', color: theme.colors.t800, marginBottom: 2 },
  statCardLbl: { fontSize: 10, color: theme.colors.t400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },

  idleCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  idleCardTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.t800, marginBottom: 6 },
  idleCardDesc: { fontSize: 13, color: theme.colors.t400, textAlign: 'center', lineHeight: 20 },

  // ── Advisory ──
  advisoryBg: { flex: 1, backgroundColor: theme.colors.cream },
  advisoryScroll: { flexGrow: 1, padding: 28 },
  advisoryIcon: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  advisoryTitle: { fontSize: 26, fontWeight: '800', color: theme.colors.t800, textAlign: 'center', marginBottom: 12 },
  advisoryBody: { fontSize: 15, color: theme.colors.t600, textAlign: 'center', lineHeight: 24, marginBottom: 28 },
  advisorySteps: { gap: 12, marginBottom: 32 },
  advisoryStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  advisoryStepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.dgreen, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  advisoryStepNumTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  advisoryStepTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.t800, marginBottom: 3 },
  advisoryStepDesc: { fontSize: 12, color: theme.colors.t400, lineHeight: 18 },
  advisoryBtn: { backgroundColor: theme.colors.dgreen, borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: theme.colors.dgreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  advisoryBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // ── Results ──
  resultsScroll: { flexGrow: 1, padding: 24 },
  resultsBack: { marginBottom: 16 },
  resultsBackTxt: { fontSize: 14, color: theme.colors.t400, fontWeight: '600' },
  resultsTitle: { fontSize: 24, fontWeight: '800', color: theme.colors.t800, marginBottom: 4 },
  resultsDate: { fontSize: 13, color: theme.colors.t400, marginBottom: 24 },
  resultsScoreCard: { backgroundColor: theme.colors.dgreen, borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16, shadowColor: theme.colors.dgreen, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  resultsScoreLbl: { fontSize: 12, color: theme.colors.lgreen, marginBottom: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultsScoreBig: { fontSize: 72, fontWeight: '900', color: '#fff', lineHeight: 76 },
  resultsRiskBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, marginTop: 10, marginBottom: 16 },
  resultsRiskTxt: { fontSize: 14, fontWeight: '800' },
  resultsScoreBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 100, overflow: 'hidden' },
  resultsScoreBarFill: { height: 6, borderRadius: 100 },
  domainGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  domainCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  domainVal: { fontSize: 24, fontWeight: '800', color: theme.colors.t800, marginBottom: 4 },
  domainLbl: { fontSize: 11, color: theme.colors.t400, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  resultsAlert: { borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1 },
  resultsAlertTitle: { fontSize: 14, fontWeight: '800', marginBottom: 6 },
  resultsAlertBody: { fontSize: 13, lineHeight: 20 },
  resultsTransmit: { backgroundColor: theme.colors.mint, borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 16 },
  resultsTransmitTxt: { fontSize: 12, color: theme.colors.dgreen, fontWeight: '600' },
  chatBtn: { backgroundColor: theme.colors.dgreen, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, shadowColor: theme.colors.dgreen, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 3 },
  chatBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  homeBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.lgreen },
  homeBtnTxt: { color: theme.colors.dgreen, fontSize: 15, fontWeight: '700' },

  // ── Chat ──
  chatHeader: { backgroundColor: theme.colors.dgreen, paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatBackBtn: { padding: 4 },
  chatBackTxt: { color: '#fff', fontSize: 22, fontWeight: '600' },
  chatHeaderInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  chatHeaderName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  chatHeaderRole: { color: theme.colors.lgreen, fontSize: 11, marginTop: 1 },
  chatMessages: { flexGrow: 1, padding: 20 },
  chatSecure: { textAlign: 'center', fontSize: 11, color: theme.colors.t400, marginBottom: 16 },
  chatEmpty: { textAlign: 'center', color: theme.colors.t400, fontSize: 13, marginTop: 40 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgBubble: { maxWidth: SCREEN_WIDTH * 0.72, padding: 12, borderRadius: 16 },
  msgBubbleMe: { backgroundColor: theme.colors.dgreen, borderBottomRightRadius: 4 },
  msgBubbleThem: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  msgTxt: { fontSize: 15, color: theme.colors.t800, lineHeight: 22 },
  chatInputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.06)', gap: 10 },
  chatInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: theme.colors.t800, maxHeight: 100 },
  chatSendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.dgreen, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.dgreen, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  chatSendTxt: { color: '#fff', fontSize: 18, fontWeight: '800' },
});

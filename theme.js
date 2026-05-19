export const theme = {
  colors: {
    mint: '#EEF7F2',
    cream: '#FAF7F2',
    dgreen: '#16694D',
    lgreen: '#A2D8B3',
    vgreen: '#26B166',
    navy: '#110D2C',
    black: '#0C0C0C',
    white: '#FFFFFF',
    t800: '#123C2A',
    t600: '#355C4D',
    t400: '#6F8B7D',
    redBg: '#FFEAEB',
    redTxt: '#D0303E',
    orange: '#EA6B1E',
    purple: '#6E55D0',
    yellow: '#ECA621',
    card: '#242045', // For navy screen cards
  },
  radius: {
    s: 12,
    m: 20,
    l: 32,
    xl: 100
  }
};

// Aliases for backward compatibility in components that haven't been fully updated yet
theme.pri = theme.colors.dgreen;
theme.mu = theme.colors.t400;
theme.g50 = '#F5F5F5';
theme.g100 = '#E0E0E0';
theme.t100 = theme.colors.mint;
theme.t50 = theme.colors.mint;
theme.t800 = theme.colors.t800;
theme.t600 = theme.colors.t600;
theme.red = theme.colors.redTxt;

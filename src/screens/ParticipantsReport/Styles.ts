export const participantsReportStyles = {
  container: {
    space: 'md',
    width: '100%',
  },
  sampleCard: {
    bg: '$white',
    borderRadius: '$xl',
    borderWidth: 1,
    borderColor: '$borderColor',
    p: '$6',
    alignItems: 'center',
  },
  sampleTitle: {
    fontSize: '$lg',
    fontWeight: '$semibold',
    color: '$textForeground',
    textAlign: 'center',
  },
  sampleText: {
    fontSize: '$sm',
    color: '$textMutedForeground',
    textAlign: 'center',
  },
} as const;

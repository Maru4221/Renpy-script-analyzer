export const buildVAGuide = async (character) => {
  const textSample = character.lines.map(l => l.text).join(' ').toLowerCase();

  let personality = 'Helpful and informative.';
  let tone = 'Neutral, clear delivery.';
  let archetype = 'Supporting Character';

  if (textSample.includes('stay') || textSample.includes('stop') || textSample.includes('must') || textSample.includes('careful') || textSample.includes('safe')) {
    personality = 'Authoritative and serious. Driven by duty and logic. They often take charge in stressful situations.';
    tone = 'Lower register, firm, steady cadence with clear articulation.';
    archetype = 'The Guardian';
  } else if (textSample.includes('!') || textSample.includes('yay') || textSample.includes('hello') || textSample.includes('hi')) {
    personality = 'Energetic, cheerful, and approachable. A ray of sunshine in the story who lifts the mood.';
    tone = 'High pitch, melodic, enthusiastic with varied inflection.';
    archetype = 'The Optimist';
  } else if (textSample.includes('?') || textSample.includes('maybe') || (textSample.includes('think') && textSample.length > 30)) {
    personality = 'Inquisitive and slightly uncertain. Highly intellectual but socially cautious.';
    tone = 'Soft-spoken, thoughtful pauses, slightly breathy.';
    archetype = 'The Scholar';
  }

  const script = character.lines.map(line => ({
    id: line.lineNum,
    text: line.text,
    direction: line.text.includes('?') ? 'Inquisitive' : (line.text.includes('!') ? 'Exclamatory' : 'Neutral')
  }));

  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    characterName: character.name,
    analysis: {
      personality,
      tone,
      archetype,
    },
    script,
    totalLines: character.lineCount,
    totalWords: character.wordCount
  };
};

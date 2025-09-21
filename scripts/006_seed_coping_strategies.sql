-- Seed the coping strategies table with initial strategies
insert into public.coping_strategies (title, description, category, difficulty_level, duration_minutes, instructions) values
('Deep Breathing Exercise', 'A simple breathing technique to reduce anxiety and stress', 'breathing', 'easy', 5, ARRAY[
  'Find a comfortable seated position',
  'Close your eyes or soften your gaze',
  'Breathe in slowly through your nose for 4 counts',
  'Hold your breath for 4 counts',
  'Exhale slowly through your mouth for 6 counts',
  'Repeat for 5-10 cycles'
]),
('5-4-3-2-1 Grounding Technique', 'Use your senses to ground yourself in the present moment', 'mindfulness', 'easy', 3, ARRAY[
  'Name 5 things you can see around you',
  'Name 4 things you can touch',
  'Name 3 things you can hear',
  'Name 2 things you can smell',
  'Name 1 thing you can taste'
]),
('Quick Walk', 'Take a short walk to clear your mind and boost mood', 'physical', 'easy', 10, ARRAY[
  'Step outside or find a quiet indoor space',
  'Walk at a comfortable pace',
  'Focus on your surroundings',
  'Take deep breaths while walking',
  'Notice how your body feels'
]),
('Reach Out to a Friend', 'Connect with someone you trust for support', 'social', 'medium', 15, ARRAY[
  'Think of someone who makes you feel supported',
  'Send them a message or give them a call',
  'Share how you are feeling if comfortable',
  'Ask about their day too',
  'Plan to meet up if possible'
]),
('Creative Expression', 'Express your feelings through art, writing, or music', 'creative', 'medium', 20, ARRAY[
  'Choose your preferred creative medium',
  'Set aside judgment about the outcome',
  'Focus on the process, not perfection',
  'Let your emotions guide your creation',
  'Reflect on how you feel afterward'
]),
('Study Break Meditation', 'A short meditation specifically for academic stress', 'mindfulness', 'medium', 8, ARRAY[
  'Sit comfortably at your study space',
  'Close your eyes and take three deep breaths',
  'Acknowledge your study stress without judgment',
  'Visualize yourself succeeding in your goals',
  'Set an intention for your next study session',
  'Return to studying with renewed focus'
]);

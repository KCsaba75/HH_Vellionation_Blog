const DAILY_TIPS = [
  "Drink a glass of water before every meal — it boosts metabolism and reduces overeating by up to 20%.",
  "A 10-minute morning walk resets your cortisol rhythm and burns more fat than longer afternoon sessions.",
  "Eating protein at breakfast keeps you full 4x longer than carbs alone — aim for 25g before 9am.",
  "Sleep 7-8 hours tonight. Poor sleep raises ghrelin (hunger hormone) by 30% the next day.",
  "Add 1 tablespoon of apple cider vinegar to water before meals to improve insulin sensitivity.",
  "Stand up and move for 2 minutes every hour. Sitting 8+ hours daily is linked to slower metabolism after 40.",
  "Swap white rice for cauliflower rice tonight — same satisfaction, 75% fewer calories.",
  "Do 10 squats before bed. Leg muscles are your largest — activating them burns fat even while you sleep.",
  "Magnesium at night improves sleep quality and supports hormonal balance in adults over 40.",
  "Replace one coffee with green tea today — EGCG in green tea boosts fat oxidation by up to 17%.",
  "Eat your last meal 3 hours before bed. Late eating increases fat storage and disrupts growth hormone release.",
  "Add a handful of walnuts to your afternoon snack — omega-3s reduce inflammation linked to belly fat.",
  "Take 5 deep breaths before meals. Stress eating adds 300+ extra calories per day on average.",
  "Try a 12-hour overnight fast: finish dinner by 7pm, breakfast at 7am. No extra effort, real results.",
  "Berries for dessert tonight — they satisfy sweet cravings and are packed with metabolism-boosting antioxidants.",
  "Do 3 sets of wall push-ups today. Upper body strength declines 30% faster after 40 without resistance training.",
  "Drink 500ml of water right after waking. Overnight dehydration slows metabolism by up to 3%.",
  "Add turmeric to your dinner — curcumin reduces inflammation that makes weight loss harder after 40.",
  "Walk for 15 minutes after dinner. Post-meal walking lowers blood sugar spikes by 22%.",
  "Eat slowly today — put your fork down between bites. It takes 20 minutes for satiety signals to reach your brain.",
  "Swap vegetable oil for olive oil today. Healthy fats support estrogen and testosterone balance after 40.",
  "Do a 5-minute stretch this morning. Flexibility reduces injury risk and improves circulation to fat-burning muscles.",
  "Try intermittent fasting: skip breakfast and eat between 12pm–8pm. Many adults over 40 see results in 2 weeks.",
  "Add fiber today — one apple, a handful of oats, or some lentils. Fiber feeds gut bacteria that regulate weight.",
  "Reduce screen time 1 hour before bed. Blue light disrupts melatonin, which controls fat metabolism overnight.",
  "Do a 10-minute plank circuit today — core strength protects your spine and activates deep abdominal fat burning.",
  "Eat a palm-sized portion of salmon or sardines this week — omega-3s reduce cortisol and belly fat directly.",
  "Smile and laugh today. Laughter lowers cortisol by 39% — high cortisol is the #1 cause of belly fat after 40.",
  "Batch cook a healthy protein source today — chicken, eggs, or legumes — so you have easy choices all week.",
  "Try a cold water rinse at the end of your shower. Cold exposure activates brown fat that burns calories for heat.",
  "Choose stairs over the elevator today. 10 minutes of stair climbing burns 100 calories and strengthens your heart.",
  "Eat leafy greens at lunch — spinach and kale contain compounds that naturally boost testosterone and estrogen balance.",
  "Do 20 minutes of light yoga or stretching today. Cortisol drops significantly after even gentle movement.",
  "Drink herbal tea in the evening instead of snacking — chamomile reduces cortisol and improves sleep depth.",
  "Set a 10pm phone cutoff tonight. Quality sleep is the most underrated weight loss tool for adults over 40.",
  "Eat fermented foods today — yogurt, kefir, or sauerkraut. Gut microbiome health directly affects fat metabolism.",
  "Try body weight squats during a TV commercial break. 3 sets of 15 is all it takes to stimulate muscle growth.",
  "Reduce sodium today — choose fresh over processed. Excess sodium causes water retention and bloating that masks progress.",
  "Take a 5-minute mindful pause at lunch. Mindful eating reduces calorie intake by 300+ calories per day on average.",
  "Add seeds to your salad today — flax, chia, or hemp seeds are rich in omega-3s that fight hormonal weight gain.",
  "Do a 20-minute resistance band workout today. Bands are as effective as weights for building muscle after 40.",
  "Try eating dinner earlier this week — before 6pm. Early time-restricted eating improves insulin sensitivity overnight.",
  "Weigh yourself at the same time each morning — not to judge, but to track trends. Trends matter, not daily numbers.",
  "Add cinnamon to your coffee or oatmeal today. Cinnamon improves insulin response and reduces sugar cravings.",
  "Plan tomorrow's meals tonight. Planned eating leads to 25% fewer impulsive food choices the next day.",
  "Do 10 minutes of walking in sunlight today — vitamin D supports testosterone, estrogen, and fat metabolism.",
  "Replace one processed snack with a boiled egg. Eggs are the most satiating food per calorie for adults over 40.",
  "Practice gratitude for 2 minutes before bed. Gratitude reduces cortisol and improves sleep quality measurably.",
  "Avoid alcohol for 3 days this week. Alcohol disrupts fat metabolism for up to 36 hours after consumption.",
  "Do a digital detox for 1 hour today — no phone, no screen. Mental rest reduces cortisol and emotional eating.",
  "Cook one new healthy recipe this week. Food variety improves gut microbiome diversity linked to healthy weight.",
  "Hydrate before your afternoon slump — dehydration is often mistaken for hunger, leading to 200+ extra calories.",
  "Try a 15-minute HIIT workout: 30 seconds on, 30 seconds off. Short HIIT sessions boost metabolism for 24 hours.",
  "Eat protein with every snack today — protein triggers satiety hormones that fat and carbs alone cannot match.",
  "Take a short nap (15-20 min) if you can — power naps lower cortisol and improve evening willpower for food choices.",
  "Prepare overnight oats tonight — a fiber-rich, protein-packed breakfast ready in the morning with zero effort.",
  "Add one extra serving of vegetables today. Each additional daily serving of vegetables reduces belly fat risk by 17%.",
  "Take your vitamins today — D3, magnesium, and zinc are the three most deficient nutrients in adults over 40.",
  "Write down 3 healthy things you did this week. Positive reinforcement is more effective than guilt for lasting change.",
  "Try a 2-minute meditation today — even one mindful pause a day rewires the stress response over time.",
  "Celebrate a small win today. Every positive choice compounds — this journey is built one good decision at a time.",
];

const DAILY_INTENTIONS = [
  { id: 'walk', icon: '🚶', label: '30-minute walk' },
  { id: 'water', icon: '💧', label: '2 liters of water' },
  { id: 'sugar', icon: '🚫', label: 'No sugar today' },
  { id: 'sleep', icon: '😴', label: '7+ hours of sleep' },
  { id: 'veggies', icon: '🥦', label: 'Extra veggies at lunch' },
  { id: 'meditation', icon: '🧘', label: '5-minute meditation' },
];

export function getDailyTip() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % DAILY_TIPS.length;
  return { tip: DAILY_TIPS[index], dayIndex: index + 1 };
}

export function getDailyIntentionOptions() {
  return DAILY_INTENTIONS;
}

export function getTodayIntentionKey() {
  const today = new Date().toISOString().split('T')[0];
  return `vellio_intention_${today}`;
}

export function getSavedIntention() {
  try {
    const key = getTodayIntentionKey();
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveIntention(intentionId) {
  try {
    const key = getTodayIntentionKey();
    localStorage.setItem(key, intentionId);
  } catch {
  }
}

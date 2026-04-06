const MONEY_TIPS = [
  { icon: '🛒', name: 'Buy from wet markets',          desc: 'vs supermarkets for fresh produce',        savings: '₱ 600/mo' },
  { icon: '💡', name: 'Unplug idle appliances',         desc: 'Reduce your electric bill',                savings: '₱ 200/mo' },
  { icon: '📱', name: 'Use free WiFi when available',   desc: 'Skip daily mobile data top-ups',           savings: '₱ 150/mo' },
  { icon: '🍱', name: 'Meal prep for the week',         desc: 'Cook in bulk to save time and money',      savings: '₱ 800/mo' },
  { icon: '💧', name: 'Bring a tumbler',                desc: 'Skip buying bottled water daily',          savings: '₱ 200/mo' },
  { icon: '🚶', name: 'Walk short distances',           desc: 'Under 1km, skip the tricycle',             savings: '₱ 300/mo' },
  { icon: '☕', name: 'Make coffee at home',             desc: 'vs buying from coffee shops daily',        savings: '₱ 500/mo' },
  { icon: '📋', name: 'Write a grocery list',           desc: 'Avoid impulse buying at the store',        savings: '₱ 400/mo' },
  { icon: '🏷️', name: 'Buy generic brands',             desc: 'Same quality, lower price',                savings: '₱ 350/mo' },
  { icon: '📦', name: 'Buy in bulk when on sale',       desc: 'Stock up on non-perishables',              savings: '₱ 450/mo' },
  { icon: '🔌', name: 'Air-dry clothes',                desc: 'Reduce electric dryer usage',              savings: '₱ 150/mo' },
  { icon: '🎬', name: 'Share streaming subscriptions',  desc: 'Split costs with family or friends',       savings: '₱ 200/mo' },
  { icon: '🏦', name: 'Pay yourself first',             desc: 'Save before spending, not after',          savings: 'Habit'     },
  { icon: '🧾', name: 'Track every expense',            desc: 'Awareness is the first step to saving',    savings: 'Habit'     },
  { icon: '🛍️', name: 'Wait 24hrs before buying',       desc: 'Avoid impulse purchases online',           savings: '₱ 500/mo' },
  { icon: '💊', name: 'Buy generic medicines',          desc: 'Same active ingredients, lower cost',      savings: '₱ 200/mo' },
  { icon: '🌱', name: 'Grow your own herbs',            desc: 'Basil, onions, garlic — easy to grow',     savings: '₱ 150/mo' },
  { icon: '🚿', name: 'Take shorter showers',           desc: 'Reduce water and electricity bills',       savings: '₱ 100/mo' },
  { icon: '📚', name: 'Use the library',                desc: 'Free books, magazines, and internet',      savings: '₱ 300/mo' },
  { icon: '🤝', name: 'Borrow before buying',           desc: 'Tools and equipment you rarely use',       savings: '₱ 500/mo' },
]

export function getRandomTips(count = 3) {
  const shuffled = [...MONEY_TIPS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
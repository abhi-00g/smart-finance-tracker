function detectRecurring(expenses) {
    const recurrenceMap = {};
  
    expenses.forEach(exp => {
      const key = exp.description?.trim().toLowerCase();
  
      if (!key) return;
  
      if (!recurrenceMap[key]) {
        recurrenceMap[key] = [];
      }
  
      recurrenceMap[key].push(new Date(exp.date));
    });
  
    const recurring = [];
  
    for (const [desc, dates] of Object.entries(recurrenceMap)) {
      if (dates.length < 2) continue;
  
      // Sort dates
      dates.sort((a, b) => a - b);
  
      let isMonthly = true;
  
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        if (Math.abs(diff - 30) > 5) { // 5-day tolerance
          isMonthly = false;
          break;
        }
      }
  
      if (isMonthly) {
        recurring.push({
          description: desc,
          count: dates.length,
          lastPaid: dates[dates.length - 1],
          estimatedNext: new Date(dates[dates.length - 1].getTime() + 30 * 24 * 60 * 60 * 1000),
          isRecurring: true
        });
      }
    }
  
    return recurring;
  }
  
  module.exports = { detectRecurring };
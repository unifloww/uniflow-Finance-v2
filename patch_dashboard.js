const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const calcStr = `
  const { healthScore, savingsRate, debtToIncomeRatio } = useMemo(() => {
    const totalIncome = income;
    const _savingsRate = totalIncome > 0 ? ((totalIncome - expense) / totalIncome) * 100 : 0;
    const _debtToIncomeRatio = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : (totalDebt > 0 ? 100 : 0);

    let savingsScore = 0;
    if (_savingsRate >= 20) savingsScore = 50;
    else if (_savingsRate >= 10) savingsScore = 40;
    else if (_savingsRate > 0) savingsScore = 30;
    else savingsScore = 0;

    let debtScore = 0;
    if (_debtToIncomeRatio === 0) debtScore = 50;
    else if (_debtToIncomeRatio <= 20) debtScore = 40;
    else if (_debtToIncomeRatio <= 40) debtScore = 30;
    else debtScore = 0;

    return { healthScore: Math.max(0, Math.min(100, savingsScore + debtScore)), savingsRate: _savingsRate, debtToIncomeRatio: _debtToIncomeRatio };
  }, [income, expense, totalDebt]);
`;

code = code.replace(
  "const netProfit = income - expense;", 
  calcStr + "\n  const netProfit = income - expense;"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

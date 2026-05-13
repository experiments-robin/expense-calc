const fs = require('fs');
const files = [
  'src/components/GroupView.tsx',
  'src/components/Dashboard.tsx',
  'src/components/group/TransactionHistory.tsx',
  'src/components/group/GroupCharts.tsx',
  'src/components/group/AddExpenseModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (file === 'src/components/group/AddExpenseModal.tsx') {
    content = content.replace("import { BaseExpense } from '../../domain/expenses/types';", "import { BaseExpense } from '../../domain/expenses/types';\nimport { useCurrency } from '../../hooks/useCurrency';");
    content = content.replace("export default function AddExpenseModal({ isOpen, onClose, groupId, user, editingExpense }: AddExpenseModalProps) {", "export default function AddExpenseModal({ isOpen, onClose, groupId, user, editingExpense }: AddExpenseModalProps) {\n  const { currencySymbol } = useCurrency();");
  } else if (file === 'src/components/group/TransactionHistory.tsx') {
    content = content.replace("import { formatCurrency } from '../../utils/format';", "import { formatCurrency } from '../../utils/format';\nimport { useCurrency } from '../../hooks/useCurrency';");
    content = content.replace("}: TransactionHistoryProps) {", "}: TransactionHistoryProps) {\n  const { currencySymbol } = useCurrency();");
  } else if (file === 'src/components/group/GroupCharts.tsx') {
    content = content.replace("import { formatCurrency } from '../../utils/format';", "import { formatCurrency } from '../../utils/format';\nimport { useCurrency } from '../../hooks/useCurrency';");
    content = content.replace("export default function GroupCharts({ group, expenses, currentPeriodExpenses, theme }: GroupChartsProps) {", "export default function GroupCharts({ group, expenses, currentPeriodExpenses, theme }: GroupChartsProps) {\n  const { currencySymbol } = useCurrency();");
  } else if (file === 'src/components/Dashboard.tsx') {
    content = content.replace("import { handleFirestoreError, OperationType } from '../utils/errorHandling';", "import { handleFirestoreError, OperationType } from '../utils/errorHandling';\nimport { useCurrency } from '../hooks/useCurrency';");
    content = content.replace("export default function Dashboard({ user, onSelectGroup, onSettingsClick }: DashboardProps) {", "export default function Dashboard({ user, onSelectGroup, onSettingsClick }: DashboardProps) {\n  const { currencySymbol } = useCurrency();");
  }

  // Replace literal text $${formatCurrency with ${currencySymbol}${formatCurrency
  content = content.replace(/\$\$\{formatCurrency/g, '${currencySymbol}${formatCurrency');
  // Replace >${formatCurrency with >{currencySymbol}{formatCurrency
  content = content.replace(/>\$\{formatCurrency/g, '>{currencySymbol}{formatCurrency');
  // Replace $${value} with ${currencySymbol}${value}
  content = content.replace(/\$\$\{value\}/g, '${currencySymbol}${value}');
  content = content.replace(/\$\$\{value\.toFixed/g, '${currencySymbol}${value.toFixed');
  // Replace >${entry.value.toFixed with >{currencySymbol}{entry.value.toFixed
  content = content.replace(/>\$\{entry\.value\.toFixed/g, '>{currencySymbol}{entry.value.toFixed');
  // Replace budget amounts manually
  content = content.replace(/\(\$\$\{totalSpent\.toFixed\(2\)\} \/ \$\$\{g\.maxBudget\.toFixed\(2\)\}\)/g, '(${currencySymbol}${totalSpent.toFixed(2)} / ${currencySymbol}${g.maxBudget.toFixed(2)})');
  // Add Expense input symbol
  content = content.replace(/<span className="absolute left-5 top-1\/2 -translate-y-1\/2 text-zinc-400 font-mono font-bold">\$<\/span>/g, '<span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold">{currencySymbol}</span>');
  
  // GroupView specific totalSpent in AI prompt
  content = content.replace(/Total Spent in Current Period: \$\$\{totalSpent\.toFixed\(2\)\}/g, 'Total Spent in Current Period: ${currencySymbol}${totalSpent.toFixed(2)}');
  content = content.replace(/\$\{formatCurrency\(currentBudgetSpent\)\} of \$\{formatCurrency\(group\.maxBudget\)\}/g, '{currencySymbol}{formatCurrency(currentBudgetSpent)} of {currencySymbol}{formatCurrency(group.maxBudget)}');
  
  // GroupView AI modal selected stat details
  content = content.replace(/>\$\{formatCurrency\(selectedStatDetails\.amount\)\}/g, '>{currencySymbol}{formatCurrency(selectedStatDetails.amount)}');
  content = content.replace(/\$\{formatCurrency\(selectedStatDetails\.amount\)\} /g, '{currencySymbol}{formatCurrency(selectedStatDetails.amount)} ');

  // Dashboard AI modal selected stat details
  content = content.replace(/>\$\{selectedStatDetails\.amount\.toFixed\(2\)\}/g, '>{currencySymbol}{selectedStatDetails.amount.toFixed(2)}');

  fs.writeFileSync(file, content);
});

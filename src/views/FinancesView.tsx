import React, { useState } from 'react';
import { Plus, Trash2, Download, ShieldCheck, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import type { BusinessProfile, Expense, Order } from '../types';
import { formatMoney } from '../utils/regions';

interface FinancesViewProps {
  orders: Order[];
  expenses: Expense[];
  profile: BusinessProfile;
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({
  orders,
  expenses,
  profile,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Supplies & Materials');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const paidOrders = orders.filter((o) => o.isPaid);
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const taxReserveRate = profile.taxReserveRate || 20;
  const recommendedTaxReserve = netProfit > 0 ? (netProfit * taxReserveRate) / 100 : 0;
  const safeTakeHome = Math.max(0, netProfit - recommendedTaxReserve);

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: amountNum,
      category: expenseCategory,
      date: expenseDate,
    };

    onAddExpense(newExpense);
    setExpenseTitle('');
    setExpenseAmount('');
    setShowExpenseForm(false);
  };

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Date,Reference/Title,Category/Method,Customer,Amount\n';

    orders.forEach((o) => {
      csvContent += `Sale,${o.createdAt.split('T')[0]},${o.orderNumber},${o.paymentMethod},"${o.customerName}",${o.total}\n`;
    });

    expenses.forEach((e) => {
      csvContent += `Expense,${e.date},"${e.title}",${e.category},-,${e.amount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `business_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            Finances & Cash Flow
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Clear tracking of revenue, expenses, and automated tax buffer recommendations.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center space-x-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-stone-500" />
          <span>Export Spreadsheet (CSV)</span>
        </button>
      </div>

      {/* Main Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            <span>Sales Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-mono">
            {formatMoney(totalRevenue, profile.currency)}
          </div>
          <div className="text-xs text-stone-500 mt-1 font-medium">{paidOrders.length} completed transactions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            <span>Total Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-mono">
            {formatMoney(totalExpenses, profile.currency)}
          </div>
          <div className="text-xs text-stone-500 mt-1 font-medium">{expenses.length} logged costs</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
            <span>Net Business Profit</span>
            <Wallet className="w-4 h-4 text-stone-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-950 font-mono">
            {formatMoney(netProfit, profile.currency)}
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Revenue minus operating costs</div>
        </div>
      </div>

      {/* Tax Reserve & Take-Home Planner Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-7 mb-6 shadow-md border border-stone-800">
        <div className="flex items-center space-x-2.5 mb-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold tracking-tight uppercase">Safe Cash Allocation</h3>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-5 max-w-2xl">
          To protect yourself from unexpected tax bills, set aside a calculated portion of your net profit into a separate reserve account before spending.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-stone-800 text-xs">
          <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60">
            <span className="text-stone-400 uppercase font-bold text-[10px] tracking-wider block">
              Recommended Tax Reserve ({taxReserveRate}%)
            </span>
            <span className="text-2xl font-extrabold text-amber-400 font-mono mt-1 block">
              {formatMoney(recommendedTaxReserve, profile.currency)}
            </span>
            <span className="text-[11px] text-stone-400 mt-1 block">Keep safely in your tax reserve account</span>
          </div>

          <div className="bg-stone-800/60 p-4 rounded-xl border border-stone-700/60">
            <span className="text-stone-400 uppercase font-bold text-[10px] tracking-wider block">
              Safe Owner Take-Home
            </span>
            <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-1 block">
              {formatMoney(safeTakeHome, profile.currency)}
            </span>
            <span className="text-[11px] text-stone-400 mt-1 block">Safe to pay yourself or reinvest today</span>
          </div>
        </div>
      </div>

      {/* Expense Management Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-stone-900">Recorded Expenses</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Track raw materials, packaging boxes, delivery fees, and phone/internet bills.
            </p>
          </div>

          <button
            onClick={() => setShowExpenseForm(!showExpenseForm)}
            className="flex items-center space-x-1.5 text-xs py-2 px-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Expense Entry Form */}
        {showExpenseForm && (
          <form
            onSubmit={handleExpenseSubmit}
            className="p-5 bg-stone-50 border border-stone-200 rounded-xl mb-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Expense Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Shipping boxes and bubble mailers"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Amount ({profile.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono font-bold bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as Expense['category'])}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                >
                  <option value="Supplies & Materials">Supplies & Materials</option>
                  <option value="Packaging & Shipping">Packaging & Shipping</option>
                  <option value="Internet & Phone">Internet & Phone</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseForm(false)}
                className="px-3.5 py-2 text-xs text-stone-600 hover:text-stone-900 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
              >
                Save Expense
              </button>
            </div>
          </form>
        )}

        {/* Expenses List */}
        <div className="divide-y divide-stone-100">
          {expenses.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center">No expenses recorded yet.</p>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-stone-900">{expense.title}</div>
                  <div className="text-stone-500 text-[11px] mt-0.5 font-mono">
                    {expense.category} • {expense.date}
                  </div>
                </div>

                <div className="flex items-center space-x-3.5">
                  <span className="font-extrabold text-stone-950 font-mono text-sm">
                    -{formatMoney(expense.amount, profile.currency)}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

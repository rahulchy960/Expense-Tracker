const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId, Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid or missing user id" });
    }

    const userObjectId = new Types.ObjectId(String(userId));

    // Totals
    const totalIncomeAgg = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalExpenseAgg = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncomes = totalIncomeAgg[0]?.total || 0;
    const totalExpenses = totalExpenseAgg[0]?.total || 0;

    // Date windows
    const now = Date.now();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Income last 60 days
    const last60daysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: sixtyDaysAgo },
    })
      .sort({ date: -1 })
      .lean();

    const incomeLast60Days = last60daysIncomeTransactions.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0
    );

    // Expense last 30 days
    const last30daysExpenseTransactions = await Expense.find({
      userId: userObjectId,
      date: { $gte: thirtyDaysAgo },
    })
      .sort({ date: -1 })
      .lean();

    const expenseLast30Days = last30daysExpenseTransactions.reduce(
      (sum, t) => sum + (Number(t.amount) || 0),
      0
    );

    // Recent transactions (5 income + 5 expense)
    const recentIncomes = await Income.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);
    const recentExpenses = await Expense.find({ userId: userObjectId })
      .sort({ date: -1 })
      .limit(5);

    const lastTransactions = [
      ...recentIncomes.map((txn) => ({ ...txn.toObject(), type: "income" })),
      ...recentExpenses.map((txn) => ({ ...txn.toObject(), type: "expense" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Response
    res.json({
      totalBalance: totalIncomes - totalExpenses,
      totalIncomes,
      totalExpenses,
      last30daysExpenses: {
        total: expenseLast30Days,
        transactions: last30daysExpenseTransactions,
      },
      last60daysIncomes: {
        total: incomeLast60Days,
        transactions: last60daysIncomeTransactions,
      },
      recentTransactions: lastTransactions,
    });
  } catch (err) {
    console.error("getDashboardData error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

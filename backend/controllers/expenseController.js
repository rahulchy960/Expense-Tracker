const User = require("../models/User");
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

exports.addExpense = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.id;

    const { icon, category, amount, date } = req.body;
    if (!category || amount === undefined || !date) {
      return res.status(400).json({ message: "Category, amount, and date are required" });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt)) {
      return res.status(400).json({ message: "amount must be a number" });
    }
    const when = new Date(date);
    if (isNaN(when.getTime())) {
      return res.status(400).json({ message: "date must be a valid date" });
    }

    const newExpense = await Expense.create({
      userId,
      icon: icon || "",
      category,
      amount: amt,
      date: when,
    });

    return res.status(201).json(newExpense);
  } catch (err) {
    console.error("addExpense error:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getAllExpense = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expense = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean(); // optional: faster, safer for JSON

    return res.status(200).json(expense);
  } catch (error) {
    // Always respond to avoid hanging requests
    return res
      .status(500)
      .json({ message: "Server Error", error: error?.message || String(error) });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Expense id is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Expense id" });
    }

    const deleted = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("deleteExpense error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

exports.downloadExpenseExcel = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const expenses = await Expense.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean();

    const XLSX = require("xlsx");

    // Build worksheet using AOA for consistent headers
    const header = ["SNo", "Icon", "Category", "Amount", "Date"];
    const rows = (expenses || []).map((inc, idx) => [
      idx + 1,
      inc.icon || "",
      inc.source,
      inc.amount,
      inc.date ? new Date(inc.date).toISOString().split("T")[0] : "",
    ]);
    const aoa = [header, ...rows];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, "Expense");

    let buffer;
    try {
      buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
    } catch (e) {
      const binary = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
      buffer = Buffer.from(binary, "binary");
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", 'attachment; filename="expense.xlsx"');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("downloadExpenseExcel error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

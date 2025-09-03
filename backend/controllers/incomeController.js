const User = require("../models/User");
const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = req.user.id;

    const { icon, source, amount, date } = req.body;
    if (!source || amount === undefined || !date) {
      return res.status(400).json({ message: "source, amount, and date are required" });
    }

    const amt = Number(amount);
    if (!Number.isFinite(amt)) {
      return res.status(400).json({ message: "amount must be a number" });
    }
    const when = new Date(date);
    if (isNaN(when.getTime())) {
      return res.status(400).json({ message: "date must be a valid date" });
    }

    const newIncome = await Income.create({
      userId,
      icon: icon || "",
      source,
      amount: amt,
      date: when,
    });

    return res.status(201).json(newIncome);
  } catch (err) {
    console.error("addIncome error:", err);
    return res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getAllIncome = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const income = await Income.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean(); // optional: faster, safer for JSON

    return res.status(200).json(income);
  } catch (error) {
    // Always respond to avoid hanging requests
    return res
      .status(500)
      .json({ message: "Server Error", error: error?.message || String(error) });
  }
};


exports.deleteIncome = async (req, res) => {}

exports.downloadIncomeExcel = async (req, res) => {}

const User = require("../models/User");
const Income = require("../models/Income");
const mongoose = require("mongoose");
const xlsx = require('xlsx')

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


exports.deleteIncome = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Income id is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid income id" });
    }

    const deleted = await Income.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Income not found" });
    }

    return res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("deleteIncome error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

exports.downloadIncomeExcel = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const incomes = await Income.find({ userId: req.user.id })
      .sort({ date: -1 })
      .lean();

    const XLSX = require("xlsx");

    // Build worksheet using AOA for consistent headers
    const header = ["SNo", "Icon", "Source", "Amount", "Date"];
    const rows = (incomes || []).map((inc, idx) => [
      idx + 1,
      inc.icon || "",
      inc.source,
      inc.amount,
      inc.date ? new Date(inc.date).toISOString().split("T")[0] : "",
    ]);
    const aoa = [header, ...rows];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, "Income");

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
    res.setHeader("Content-Disposition", 'attachment; filename="income.xlsx"');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("downloadIncomeExcel error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
}

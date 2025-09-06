import moment from "moment";

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email); 
};

export const getInitials = (name) => {
    if(!name) return "";
    const words = name.split(" ");
    let initials = "";
    for(let i=0;i < Math.min(words.length, 2); i++){
        initials += words[i][0];
    }
    return initials.toUpperCase();
};

export const addThousandsSeparator = (num) => {
    if( num == null || isNaN(num)) return "";

    const [integerPart, fractionalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return fractionalPart 
        ? `${formattedInteger}.${fractionalPart}`
        :  formattedInteger;
};

export const prepareExpenseBarChartData = (data = []) => {
    const chartData = data.map((item) => ({
        category: item?.category,
        amount: item?.amount,
    }));
    return chartData;
};


export const prepareIncomeBarChartData = (data = []) => {
  if (!Array.isArray(data)) return [];

  const grouped = {};

  data.forEach((item) => {
    const dateKey = moment(item?.date).format("DD MMM"); // e.g. "06 Sep"
    const amt = Number(item?.amount) || 0;

    if (!grouped[dateKey]) {
      grouped[dateKey] = 0;
    }
    grouped[dateKey] += amt; // sum all amounts for same day
  });

  // Convert grouped object into an array
  const chartData = Object.entries(grouped).map(([date, total]) => ({
    category: date,   // XAxis
    amount: total,    // Bar
  }));

  // Sort by actual date (not string)
  return chartData.sort(
    (a, b) =>
      moment(a.category, "DD MMM").toDate() -
      moment(b.category, "DD MMM").toDate()
  );
};


import React, { useEffect, useState } from 'react'
import CustomPieChart from '../../components/charts/CustomPieChart'

const COLORS = ["#AAEFDF", "#A3D5FF", "#7692FF", "#9561e2"]

export const RecentIncomeWithChart = ({data, totalIncome}) => {
  const [chartData, setChartData] = useState([]);
  const prepareChartData = () => {
    const dataArr = data?.map((item) => ({
      name: item?.source,
      amount: item?.amount,
    }));
    setChartData(dataArr);
  };

  useEffect(() => {
    prepareChartData();
    return ()=>{};
  },[data]);
  
  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>Last 60 Days Income</h5>        
      </div>
      <CustomPieChart
        data = {chartData}
        label = "Total Income"
        totalAmount={`₹${totalIncome}`}
        showTextAnchor
        colors={COLORS}
      />
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { prepareIncomeBarChartData } from '../../utils/helper';
import { LuPlus } from 'react-icons/lu';
import CustomBarChart from '../charts/CustomBarChart';

const IncomeOverView = ({transactions, onAddIncome}) => {
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const result = prepareIncomeBarChartData(transactions);
    setChartData(result);
    return () => {};
  }, [transactions]);
  return (
    <div className='card'>
      <div  className='flex items-center justify-between gap-2'>
        <div className=''>
          <h5 className='text-lg'>Income Overview</h5>
        </div>
        <button className='add-btn' onClick={onAddIncome}>
          <LuPlus className='text-lg' />
          Add Income
        </button>
      </div>
      <div className='mt-10'>
        <CustomBarChart data={chartData} />
      </div>  
    </div>
  )
}

export default IncomeOverView
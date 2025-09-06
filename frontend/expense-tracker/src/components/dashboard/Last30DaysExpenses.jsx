import React, { useEffect, useState } from 'react'
import { prepareExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../charts/CustomBarChart';

const Last30daysExpenses = ({data}) => {

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const result = prepareExpenseBarChartData(data);
        setChartData(result);
        return () => {};
    }, [data]);
  return (
    <div className='card  col-span-1'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>Last 30 Days Transactions</h5>
      </div>  

      <CustomBarChart data={chartData} />
    </div>
  )
}

export default Last30daysExpenses
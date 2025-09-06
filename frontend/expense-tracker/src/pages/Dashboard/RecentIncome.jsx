import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../../components/cards/TransactionInfoCard';
import moment from 'moment';

const RecentIncome = ({transactions, onSeeMore}) => {
  return (
    <div className='card'>
      <div className='flex justify-between items-center'>
        <h5 className='text-lg'>Incomes</h5>

        <button className='card-btn' onClick={onSeeMore}>
          See All <LuArrowRight className='text-base' />
        </button>
      </div>
    
      <div className='mt-6'>
        {transactions?.slice(0,5)?.map((item) => (
          <TransactionInfoCard
            key = {item._id}
            title = {item.source}
            icon = {item.icon}
            date = {moment(item.date).format("Do MMM YYYY")}
            amount = {item.amount}
            type = "income"
            hideDeleteBtn
          />
        ))}
      </div>
    </div>
  );
};

export default RecentIncome
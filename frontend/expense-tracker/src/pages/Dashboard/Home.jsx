import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { IoMdCard } from 'react-icons/io';
import InfoCard from '../../components/cards/InfoCard';
import { addThousandsSeparator } from '../../utils/helper';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import FinanceOverview from '../../components/dashboard/FinanceOverview';
import ExpenseTransactions from '../../components/dashboard/ExpenseTransactions';
import Last30daysExpenses from '../../components/dashboard/last30daysExpenses';
import { RecentIncomeWithChart } from './RecentIncomeWithChart';
import RecentIncome from './RecentIncome';

function Home() {
  useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setdashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchDashboardData = async () => {
    if(loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `${API_PATHS.DASHBOARD.GET_DATA}`
      );
      if(response.data) {
        setdashboardData(response.data);
      }
    } catch (error) {
      console.error("Something went wrong. Please try again", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect( () => {
    fetchDashboardData();
    return () => {};
  }, []);
  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='my-5 mx-auto'>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6' >
          <InfoCard
            icon = {<IoMdCard />}
            label = "Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color = 'bg-primary'
          />  
          <InfoCard
            icon = {<LuWalletMinimal />}
            label = "Total Income"
            value={addThousandsSeparator(dashboardData?.totalIncomes || 0)}
            color = 'bg-green-500'
          />  
          <InfoCard
            icon = {<LuHandCoins />}
            label = "Total Expense"
            value={addThousandsSeparator(dashboardData?.totalExpenses || 0)}
            color = 'bg-red-600'
          />  
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>

          <RecentTransactions
            transactions = {dashboardData?.recentTransactions}
            onSeeMore = {() => navigate("/expense")} 
          />

          <FinanceOverview 
            totalBalance = {dashboardData?.totalBalance || 0}
            totalIncome = {dashboardData?.totalIncomes || 0}
            totalExpense = {dashboardData?.totalExpenses || 0}
          />
          
          <ExpenseTransactions
            transactions = {dashboardData?.last30daysExpenses?.transactions}
            onSeeMore = {() => navigate("/expense")}
          />

          <Last30daysExpenses
            data = {dashboardData?.last30daysExpenses?.transactions}
          />

          <RecentIncomeWithChart
            data = {dashboardData?.last60daysIncomes?.transactions?.slice(0,4) || []}
            totalIncome={dashboardData?.totalIncomes || 0}
          />

          <RecentIncome
            transactions = {dashboardData?.last60daysIncomes?.transactions || []}
            onSeeMore = {() => navigate("/income")}
          />
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Home
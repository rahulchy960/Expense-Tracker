import { useEffect, useState } from 'react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { useUserAuth } from '../../hooks/useUserAuth'
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { ExpenseOverview } from '../../components/expense/ExpenseOverview';
import { MdOutlineAlarmAdd } from 'react-icons/md';
import { Modal } from '../../components/layouts/Modal';
import AddExpenseForm from '../../components/expense/AddExpenseForm';

function Expense() {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
      show: false,
      data: null
    });
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    
    const fetchExpenseDetails = async () => {
    if(loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.GET_ALL_EXPENSE
      );
      if(response.data) {
        setExpenseData(response.data);
      }
    } catch (error) {
      console.error("Something went Wrong. Please try again", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon } = expense;
    if(!category.trim()) {
      toast.error("Category is Required");
      return;
    }
    if(!amount ||isNaN(amount) || Number(amount) <= 0 ){
      toast.error("Amount should be valid");
      return;
    }
    if(!date){
      toast.error("Date is required");
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });
      setOpenAddExpenseModal(false);
      toast.success("Expense added Successfully");
      fetchExpenseDetails();
    } catch(error) {
      console.error("Error adding expense: ",
        error.response?.data?.message || error.message
      );
    }
  };

  useEffect(() => {
    fetchExpenseDetails();
    return () => {};
  }, [])
  return (
    <DashboardLayout activeMenu= "Expense">
      <div className='my-5 mx-auto'>
        <div className=''>
          <div className=''>
            <ExpenseOverview 
              transactions={expenseData}
              onAddExpense={() => setOpenAddExpenseModal(true)}
            />
          </div>
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={()=> setOpenAddExpenseModal(true)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />  
        </Modal> 
      </div>
    </DashboardLayout>
  )
}

export default Expense
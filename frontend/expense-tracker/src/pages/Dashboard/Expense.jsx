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
import ExpenseList from '../../components/expense/ExpenseList';
import { DeleteAlert } from '../../components/layouts/DeleteAlert';

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

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({show:false, data: null});
      toast.success("Expense deleted successfully");
      fetchExpenseDetails();
    } catch(error) {
      console.error("Error deleting expense: ",
        error.response?.data?.message || error.message
      );
    }
  };
  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expenses.csv"); // or .xlsx / .pdf
      document.body.appendChild(link);
      link.click();
      toast.success("Expense details downloaded successfully");
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details");
    };
  }
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
          <ExpenseList
            transactions = {expenseData}
            onDelete = { (id) => {
              setOpenDeleteAlert({ show: true, data: id });
            }}
            onDownload = {handleDownloadExpenseDetails}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={()=> setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />  
        </Modal> 

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show: false, data:null})}
          title= "Delete Expense"
          >
          <DeleteAlert
            content = "Are you sure you want to delete this expense details?"
            onDelete = {() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Expense

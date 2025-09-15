import React, { useState } from 'react'
import { DashboardLayout } from '../../components/layouts/DashboardLayout'
import IncomeOverView from '../../components/income/IncomeOverView';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useEffect } from 'react';
import { useUserAuth } from '../../hooks/useUserAuth';
import { Modal } from '../../components/layouts/Modal';
import AddIncomeForm from '../../components/income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../components/income/IncomeList';
import { DeleteAlert } from '../../components/layouts/DeleteAlert';

function Income() {
  useUserAuth();
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null
  });
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);

  const fetchIncomeDetails = async () => {
    if(loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.INCOME.GET_ALL_INCOME
      );
      if(response.data) {
        setIncomeData(response.data);
      }
    } catch (error) {
      console.error("Something went Wrong. Please try again", error);
    } finally {
      setLoading(false);
    }
  };
  const handleAddIncome = async (income) => {
    const { source, amount, date, icon } = income;
    if(!source.trim()) {
      toast.error("Source is Required");
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
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source,
        amount,
        date,
        icon,
      });
      setOpenAddIncomeModal(false);
      toast.success("Income added Successfully");
      fetchIncomeDetails();
    } catch(error) {
      console.error("Error adding income: ",
        error.response?.data?.message || error.message
      );
    }
  };
  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      setOpenDeleteAlert({show:false, data: null});
      toast.success("Income deleted successfully");
      fetchIncomeDetails();
    } catch(error) {
      console.error("Error deleting income: ",
        error.response?.data?.message || error.message
      );
    }
  };
  const handleDownloadIncomeDetails = async () => {
    try {
      const headers = ["Source", "Amount", "Date"];
      const rows = incomeData.map((i) => [
        i?.source ?? "",
        i?.amount ?? "",
        i?.date ? new Date(i.date).toISOString().split("T")[0] : "",
      ]);

      const escapeCSV = (value) => {
        const str = String(value ?? "");
        const needsQuotes = /[",\n]/.test(str);
        const escaped = str.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
      };

      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCSV).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Income details downloaded successfully");
    } catch (error) {
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details");
    }
  };

  useEffect(() => {
    fetchIncomeDetails();
    return () => {};
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <IncomeOverView
              transactions = {incomeData}
              onAddIncome = {() => setOpenAddIncomeModal(true)}
            />
          </div>

          <IncomeList
            transactions = {incomeData}
            onDelete = {(id) => {
              setOpenDeleteAlert({ show: true, data: id});
            }}
            onDownload = {handleDownloadIncomeDetails}
          />
        </div>

        <Modal
          isOpen = {openAddIncomeModal}
          onClose = {() => setOpenAddIncomeModal(false)}
          title = "Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show: false, data:null})}
          title= "Delete Income"
        >
          <DeleteAlert
            content = "Are you sure you want to delete this income details?"
            onDelete = {() => deleteIncome(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Income

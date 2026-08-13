import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Table from "../../core/common/dataTable2/index";
import PredefinedDateRanges from "../../core/common/datePicker";
import CommonSelect from "../../core/common/commonSelect";
import CommonSelect2 from "../../core/common/commonSelect2";
import CommonSelect3 from "../../core/common/commonSelect3";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import Select from "react-select";
import { all_routes } from "../router/all_routes";
import TooltipOption from "../../core/common/tooltipOption";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { BookExpense, GetExpensesPaged, UpdateExpense } from "../../store/apps/expense";
import { GetAllExpenseCategories } from "../../store/apps/expense-category";
import { GetCampusBanksByCampus } from "../../store/apps/campus-bank";
import useRegionsList from "../../core/common/selectoption/master/useRegions";
import { useCampusesList } from "../../core/common/selectoption/master/useCampusesList";
import { useCampusFeeRecAccount } from "../../core/common/selectoption/financial/useCampusFeeRecAccount";
import { useLastFinancialYearId } from "../../core/common/selectoption/financial/useLastFinancialYearId";
import { usePermission } from "../../core/common/selectoption/selectoption";
import { Companylogo, CompanyName } from '../../environment';
import toast from "react-hot-toast";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const Expense = () => {
  const routes = all_routes;
  const dispatch = useDispatch<AppDispatch>();
  const hasPermission = usePermission("Expenses");

  // --- Auth & Initial State ---
  const storedUserData = window.localStorage.getItem("userData");
  const userInfo = storedUserData ? JSON.parse(storedUserData) : null;
  const loginInfo = userInfo?.data;
  const userLevel = loginInfo?.userLevel;
  const userLevelId = loginInfo?.userLevelId;
  const currentUserId = loginInfo?.id;

  // --- Financial Year ---
  const lastFinancialYearId = useLastFinancialYearId();

  // --- Date Restriction ---
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month');

  // --- Top Filters State ---
  const regionsList = useRegionsList();
  const [regionId, setRegionId] = useState<number | null>(
    userLevel === 2 ? userLevelId : null
  );

  const campuses = useCampusesList(
    userLevel === 2 ? userLevelId : regionId
  );

  const [selectedCampusId, setSelectedCampusId] = useState<number>(
    userLevel === 3 ? userLevelId : 0
  );

  const [filterExpenseCategoryId, setFilterExpenseCategoryId] = useState<number | null>(null);

  // --- Pagination State ---
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  // --- Redux Data ---
  const { data: expenses, loading, totalCount } = useSelector((state: RootState) => state.expense);
  const { data: categories } = useSelector((state: RootState) => state.expenseCategory);
  const { data: bankDetails } = useSelector((state: RootState) => state.campusBank);
  const feeRecAccountOptions = useCampusFeeRecAccount();

  // --- Bank Account Options ---
  const bankOptions = (bankDetails || []).map((bank: any) => ({
    value: bank.accountId,
    label: `${bank.tblAccountBank?.name || 'Bank'} (${bank.iban || ''})`
  }));

  const combinedBankOptions = [
    ...feeRecAccountOptions,
    ...bankOptions
  ];

  // --- Form Modal State ---
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewRecord, setViewRecord] = useState<any>(null);

  const [addForm, setAddForm] = useState({
    expenseCategoryId: 0,
    amount: 0,
    description: "",
    date: today.format("YYYY-MM-DD"),
    isAlreadyPaid: true,
    campusId: selectedCampusId || 0,
    bankAccountId: 0,
    financialYearId: 0,
    createdBy: currentUserId || 0,
    modifiedBy: currentUserId || 0
  });

  // --- Load Categories ---
  useEffect(() => {
    dispatch(GetAllExpenseCategories());
  }, [dispatch]);

  // --- Fetch Expenses & Banks whenever Campus or Pagination or Filter changes ---
  useEffect(() => {
    if (selectedCampusId) {
      const payload = {
        pageNo,
        pageSize,
        campusId: selectedCampusId,
        expenseCategoryId: filterExpenseCategoryId
      };
      dispatch(GetExpensesPaged(payload));
      dispatch(GetCampusBanksByCampus(selectedCampusId));
      setAddForm(prev => ({ ...prev, campusId: selectedCampusId }));
    }
  }, [selectedCampusId, filterExpenseCategoryId, pageNo, pageSize, dispatch]);

  useEffect(() => {
    if (lastFinancialYearId) {
      setAddForm(prev => ({ ...prev, financialYearId: lastFinancialYearId }));
    }
  }, [lastFinancialYearId]);

  // --- Handlers ---
  const handleRegionChange = (option: any) => {
    setRegionId(option?.value || null);
    setSelectedCampusId(0); // Reset campus
  };

  const handleCampusChange = (option: any) => {
    setSelectedCampusId(option?.value || 0);
    setPageNo(1); // Reset to first page
  };

  const handleAddChange = (e: any) => {
    const { name, value } = e.target;

    // Description word limit (e.g., 50 words)
    if (name === "description") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 50) {
        toast.error("Description limited to 50 words");
        return;
      }
    }

    setAddForm(prev => ({ ...prev, [name]: name === "amount" ? Number(value) : value }));
  };

  const handleCategoryChange = (option: any) => {
    const selectedCat = (categories as any[])?.find(c => c.id === option?.value);
    const isPayableNull = selectedCat && !selectedCat.payableAccountId;

    setAddForm(prev => ({
      ...prev,
      expenseCategoryId: option ? option.value : 0,
      isAlreadyPaid: isPayableNull ? true : prev.isAlreadyPaid
    }));
  };

  const handleDateChange = (e: any) => {
    const selectedDate = dayjs(e.target.value);

    // Check if future date
    if (selectedDate.isAfter(today, 'day')) {
      toast.error("Future dates are not allowed.");
      return;
    }

    if (!selectedDate.isBetween(startOfMonth, endOfMonth, 'day', '[]')) {
      toast.error("You can only select a date in the current month.");
      return;
    }
    setAddForm(prev => ({ ...prev, date: e.target.value }));
  };

  const resetForm = () => {
    setAddForm({
      expenseCategoryId: 0,
      amount: 0,
      description: "",
      date: today.format("YYYY-MM-DD"),
      isAlreadyPaid: true,
      campusId: selectedCampusId || 0,
      bankAccountId: 0,
      financialYearId: lastFinancialYearId || 0,
      createdBy: currentUserId || 0,
      modifiedBy: currentUserId || 0
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleEdit = (record: any) => {
    setIsEditMode(true);
    setEditingId(record.id);
    setAddForm({
      expenseCategoryId: record.expenseCategoryId,
      amount: record.amount,
      description: record.description,
      date: dayjs(record.date).format("YYYY-MM-DD"),
      isAlreadyPaid: record.isAlreadyPaid,
      campusId: record.campusId,
      bankAccountId: record.bankAccountId,
      financialYearId: record.financialYearId,
      createdBy: record.createdBy,
      modifiedBy: currentUserId || 0
    });
  };

  const handleView = (record: any) => {
    setViewRecord(record);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addForm.amount <= 0) {
      toast.error("Amount must be greater than zero.");
      return;
    }

    if (!addForm.expenseCategoryId) {
      toast.error("Please select an expense category.");
      return;
    }

    if (!addForm.bankAccountId) {
      toast.error("Please select a bank/cash account.");
      return;
    }

    const payload = {
      ...addForm,
      date: dayjs(addForm.date).toISOString()
    };

    let res: any;
    if (isEditMode && editingId) {
      // For update, exclude createdBy as the backend doesn't expect it
      const { createdBy, ...updatePayload } = payload;
      res = await dispatch(UpdateExpense({ ...updatePayload, id: editingId } as any));
    } else {
      // For booking, exclude modifiedBy as the backend doesn't expect it
      const { modifiedBy, ...bookPayload } = payload;
      res = await dispatch(BookExpense(bookPayload as any));
    }

    if (res.meta.requestStatus === 'fulfilled') {
      // Success - Refresh list
      const fetchPayload = {
        pageNo,
        pageSize,
        campusId: selectedCampusId,
        expenseCategoryId: filterExpenseCategoryId
      };
      dispatch(GetExpensesPaged(fetchPayload));
      resetForm();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintSingle = () => {
    document.body.classList.add('printing-single');
    // Minimal delay to ensure class is applied and layout updated
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-single');
    }, 50);
  };

  // --- Check Logic for Payable Account ---
  const selectedCategoryData = (categories as any[])?.find(c => c.id === addForm.expenseCategoryId);
  const isPayableLinkNull = selectedCategoryData && !selectedCategoryData.payableAccountId;

  // --- Table Columns ---
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: any) => (
        <Link to="#" className="link-primary">
          {text || "N/A"}
        </Link>
      ),
      sorter: (a: any, b: any) => (a.id || 0) - (b.id || 0),
      width: 80,
    },
    {
      title: "Category",
      dataIndex: "expenseCategoryName",
      sorter: (a: any, b: any) => a.expenseCategoryName?.localeCompare(b.expenseCategoryName),
      width: 250,
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date: string) => date ? dayjs(date).format("DD-MMM-YYYY") : "-",
      sorter: (a: any, b: any) => dayjs(a.date || 0).unix() - dayjs(b.date || 0).unix(),
      width: 120,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount: number) => <strong>{amount != null ? amount.toLocaleString() : "0"}</strong>,
      sorter: (a: any, b: any) => (a.amount || 0) - (b.amount || 0),
      width: 120,
    },
    {
      title: "Paid?",
      dataIndex: "isAlreadyPaid",
      render: (paid: boolean) => (
        <span className={`badge ${paid ? "bg-success" : "bg-danger"}`}>
          {paid ? "Yes" : "No"}
        </span>
      ),
      width: 100,
    },
    {
      title: "Bank/Cash",
      dataIndex: "bankAccountName",
      sorter: (a: any, b: any) => a.bankAccountName?.localeCompare(b.bankAccountName),
      width: 180,
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
      width: 250,
    },
    {
      title: "Action",
      width: 100,
      render: (_: any, record: any) => (
        <div className="d-flex align-items-center">
          <Link
            to="#"
            className="btn btn-icon btn-flush-dark btn-rounded flush-soft-hover me-1"
            data-bs-toggle="modal"
            data-bs-target="#view_expense"
            onClick={() => handleView(record)}
          >
            <i className="ti ti-eye" />
          </Link>
          {hasPermission?.editRight && (
            <Link
              to="#"
              className="btn btn-icon btn-flush-dark btn-rounded flush-soft-hover me-1"
              data-bs-toggle="modal"
              data-bs-target="#add_expenses"
              onClick={() => handleEdit(record)}
            >
              <i className="ti ti-edit" />
            </Link>
          )}
        </div>
      ),
    }
  ];

  const categoryOptions = (categories as any[])?.map(cat => ({
    value: cat.id,
    label: cat.name
  })) || [];

  return (
    <div>
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { 
            background: #fff !important; 
            background-color: #fff !important;
            -webkit-print-color-adjust: exact; 
          }
          /* Ensure app UI is hidden */
          .page-wrapper, .modal, .modal-backdrop, .header, .sidebar, .no-print, #add_expenses { 
            display: none !important; 
          }
          /* Target specific area to show */
          #print-area { display: block !important; }
          body.printing-single #print-single-area { 
            display: block !important; 
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15mm;
            background: #fff !important;
          }
        }
        #print-area, #print-single-area { display: none; }
      `}</style>

      <div className="page-wrapper">
        <div className="content">
          {/* Page Header */}
          <div className="d-md-flex d-block align-items-center justify-content-between mb-3 no-print">
            <div className="my-auto mb-2">
              <h3 className="page-title mb-1">Expense</h3>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="#">Finance &amp; Accounts</Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Expense
                  </li>
                </ol>
              </nav>
            </div>
            <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
              <div className="mb-2 me-2">
                <button
                  className={`btn btn-info d-flex align-items-center ${!expenses.length && 'disabled'}`}
                  onClick={handlePrint}
                >
                  <i className="ti ti-printer me-2" />
                  Print PDF
                </button>
              </div>
              <div className="mb-2">
                {hasPermission?.addRight && (
                  <Link
                    to="#"
                    className={`btn btn-primary d-flex align-items-center ${!selectedCampusId && 'disabled'}`}
                    data-bs-toggle="modal"
                    data-bs-target="#add_expenses"
                    onClick={resetForm}
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    Add Expense
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="card mb-3 no-print">
            <div className="card-body">
              <div className="row">
                {userLevel === 1 && (
                  <div className="col-md-3">
                    <label className="form-label">Region</label>
                    <CommonSelect3
                      options={regionsList}
                      onChange={handleRegionChange}
                      value={regionsList.find(r => r.value === regionId) || null}
                      placeholder="Select Region"
                    />
                  </div>
                )}
                {(userLevel === 1 || userLevel === 2) && (
                  <div className="col-md-3">
                    <label className="form-label">Campus</label>
                    <CommonSelect3
                      options={campuses}
                      onChange={handleCampusChange}
                      value={campuses.find(c => c.value === selectedCampusId) || null}
                      placeholder="Select Campus"
                    />
                  </div>
                )}
                <div className="col-md-3">
                  <label className="form-label">Expense Category</label>
                  <Select
                    classNamePrefix="react-select"
                    options={[{ value: null, label: 'All Categories' }, ...categoryOptions]}
                    value={categoryOptions.find(o => o.value === filterExpenseCategoryId) || { value: null, label: 'All Categories' }}
                    onChange={(opt: any) => {
                      setFilterExpenseCategoryId(opt?.value || null);
                      setPageNo(1);
                    }}
                    placeholder="Filter by Category"
                    isSearchable
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <div className="mb-0 text-muted">
                    {selectedCampusId ? `Showing expenses for selected campus.` : `Please select a campus to view/add expenses.`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expense List Table */}
          <div className="card no-print">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
              <h4 className="mb-3">Expense List</h4>
              <div className="d-flex align-items-center flex-wrap">
                <div className="input-icon-start mb-3 me-2 position-relative">
                  <PredefinedDateRanges />
                </div>
              </div>
            </div>
            <div className="card-body p-0 py-3">
              <Table
                dataSource={Array.isArray(expenses) ? expenses : []}
                columns={columns}
                loading={loading}
                Selection={true}
              />
            </div>
          </div>

          {/* Print Area */}
          <div id="print-area">
            <div className="print-header">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ color: '#004a99', margin: 0, fontWeight: 800, fontSize: '28px', fontFamily: "'RevuenCustom', sans-serif", letterSpacing: '1px' }}>
                  DAR-E-ARQAM
                </h1>
                <h4 style={{ margin: 0, color: '#004a99', fontWeight: 600, letterSpacing: '2px', fontSize: '14px', fontFamily: "'RevuenCustom', sans-serif" }}>
                  CENTRAL REGIONS
                </h4>
              </div>
              <div className="text-end">
                <h4 style={{ margin: 0, color: '#333', fontWeight: 700 }}>Central Regions Office</h4>
                <p style={{ margin: 0, fontWeight: 500 }}>Expense Transaction Summary</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Report Generated: {dayjs().format('DD MMMM YYYY, hh:mm A')}</p>
              </div>
            </div>

            <div className="print-title">
              <h3>Expense Details Report</h3>
              {selectedCampusId && campuses.find(c => c.value === selectedCampusId) && (
                <div style={{ padding: '8px 15px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', display: 'inline-block' }}>
                  <strong>Campus:</strong> {campuses.find(c => c.value === selectedCampusId)?.label}
                </div>
              )}
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>ID</th>
                  <th>Expense Category</th>
                  <th style={{ width: '120px' }}>Date</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Amount (PKR)</th>
                  <th>Paid From</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? expenses.map((exp: any) => (
                  <tr key={exp.id}>
                    <td>{exp.id}</td>
                    <td>{exp.expenseCategoryName}</td>
                    <td>{dayjs(exp.date).format('DD-MMM-YYYY')}</td>
                    <td className="amount-cell">{exp.amount?.toLocaleString()}</td>
                    <td>{exp.bankAccountName || exp.bankAccountTitle || '-'}</td>
                    <td style={{ fontSize: '11px' }}>{exp.description}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>No expense records found for the selected criteria.</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan={3} style={{ textAlign: 'right', fontSize: '14px' }}>Grand Total:</th>
                  <th className="amount-cell" style={{ fontSize: '14px', borderBottom: '3px double #000' }}>
                    {expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0).toLocaleString()}
                  </th>
                  <th colSpan={2}></th>
                </tr>
              </tfoot>
            </table>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                <p style={{ fontSize: '12px', margin: 0 }}>Prepared By</p>
              </div>
              <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                <p style={{ fontSize: '12px', margin: 0 }}>Campus Manager</p>
              </div>
              <div style={{ borderTop: '1px solid #000', width: '200px', textAlign: 'center', paddingTop: '5px' }}>
                <p style={{ fontSize: '12px', margin: 0 }}>Regional Auditor</p>
              </div>
            </div>

            <div className="print-footer">
              <p>Dar-E-Arqam Central Regions - Official Expense Report. System User: {userInfo?.data?.name || 'Authorized Personnel'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal (Add/Edit) */}
      <div className="modal fade no-print" id="add_expenses">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{isEditMode ? "Update Expense" : "Book Expense"}</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row">
                  {/* Category Selection */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expense Category <span className="text-danger">*</span></label>
                    <Select
                      classNamePrefix="react-select"
                      options={categoryOptions}
                      value={categoryOptions.find(o => o.value === addForm.expenseCategoryId)}
                      onChange={handleCategoryChange}
                      placeholder="Search Category"
                      isSearchable
                    />
                  </div>

                  {/* Amount */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Amount <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      name="amount"
                      value={addForm.amount || ""}
                      onChange={handleAddChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={addForm.date}
                      onChange={handleDateChange}
                      max={today.format("YYYY-MM-DD")}
                      required
                    />
                    <small className="text-info">No future dates allowed (current month only).</small>
                  </div>

                  {/* Is Already Paid Checkbox */}
                  <div className="col-md-6 mb-3 d-flex align-items-center">
                    <div className="form-check form-switch mt-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isAlreadyPaid"
                        name="isAlreadyPaid"
                        checked={addForm.isAlreadyPaid}
                        onChange={(e) => setAddForm(prev => ({ ...prev, isAlreadyPaid: e.target.checked }))}
                        disabled={isPayableLinkNull === true}
                      />
                      <label className="form-check-label" htmlFor="isAlreadyPaid">
                        Is Already Paid?
                      </label>
                    </div>
                    {isPayableLinkNull && (
                      <small className="text-muted ms-2 mt-4">(Auto-locked: No payable account linked)</small>
                    )}
                  </div>

                  {/* Campus (Auto-select if campus level) */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Campus</label>
                    <Select
                      classNamePrefix="react-select"
                      options={campuses}
                      value={campuses.find(c => c.value === addForm.campusId)}
                      onChange={(opt: any) => setAddForm(prev => ({ ...prev, campusId: opt?.value || 0 }))}
                      isDisabled={userLevel === 3}
                    />
                  </div>

                  {/* Bank/Cash Account */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Paid From (Bank/Cash Account) <span className="text-danger">*</span></label>
                    <Select
                      classNamePrefix="react-select"
                      options={combinedBankOptions}
                      value={combinedBankOptions.find(o => o.value === addForm.bankAccountId)}
                      onChange={(opt: any) => setAddForm(prev => ({ ...prev, bankAccountId: opt?.value || 0 }))}
                      placeholder="Select Account"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="col-md-12 mb-0">
                    <label className="form-label">Description (Max 50 words)</label>
                    <textarea
                      rows={4}
                      className="form-control"
                      name="description"
                      value={addForm.description}
                      onChange={handleAddChange}
                      placeholder="Provide a brief description..."
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" data-bs-dismiss={addForm.amount > 0 ? "modal" : ""}>
                  {isEditMode ? "Confirm & Update" : "Confirm & Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View Expense Modal */}
      <div className="modal fade no-print" id="view_expense">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h4 className="modal-title">Expense Details</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              {viewRecord ? (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Transaction ID</label>
                    <div className="fw-bold fs-5 text-primary">#{viewRecord.id}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Date</label>
                    <div className="fw-bold">{dayjs(viewRecord.date).format("DD MMMM YYYY")}</div>
                  </div>
                  <hr className="my-2" />
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Category</label>
                    <div className="fw-bold">{viewRecord.expenseCategoryName}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Status</label>
                    <span className={`badge ${viewRecord.isAlreadyPaid ? "bg-success" : "bg-danger"}`}>
                      {viewRecord.isAlreadyPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                  <div className="col-md-12">
                    <div className="p-3 bg-light rounded-2 mt-2">
                      <div className="row align-items-center">
                        <div className="col">
                          <label className="text-muted small d-block">Amount</label>
                          <div className="fw-bold fs-3">PKR {viewRecord.amount?.toLocaleString()}</div>
                        </div>
                        <div className="col-auto text-end">
                          <label className="text-muted small d-block">Paid From</label>
                          <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                            {viewRecord.bankAccountName || viewRecord.bankAccountTitle || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <label className="text-muted small d-block">Description</label>
                    <p className="border p-2 rounded bg-white mt-1" style={{ minHeight: '60px' }}>
                      {viewRecord.description || "No description provided."}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small d-block">Recorded By</label>
                    <div className="small fw-medium">{viewRecord.createdByName || "System User"}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Loading details...</div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-info d-flex align-items-center"
                onClick={handlePrintSingle}
                disabled={!viewRecord}
              >
                <i className="ti ti-printer me-2" />
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Single Expense Print Area (Hidden) */}
      <div id="print-single-area">
        {viewRecord && (
          <div style={{ padding: '40px', background: '#fff' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #004a99', paddingBottom: '20px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ color: '#004a99', margin: 0, fontWeight: 800, fontSize: '26px', fontFamily: "'RevuenCustom', sans-serif", letterSpacing: '1px' }}>
                  DAR-E-ARQAM
                </h1>
                <h6 style={{ margin: 0, color: '#004a99', fontWeight: 600, letterSpacing: '2px', fontSize: '12px', fontFamily: "'RevuenCustom', sans-serif" }}>
                  CENTRAL REGIONS
                </h6>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontWeight: 800, color: '#004a99', fontSize: '16px' }}>CASH/BANK PAYMENT VOUCHER</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#333' }}>Voucher No: EXP-{viewRecord.id}</p>
              </div>
            </div>

            {/* Meta Info */}
            <div style={{ display: 'flex', gap: '50px', marginBottom: '30px', padding: '15px', border: '1px solid #eee', background: '#fff' }}>
              <div style={{ minWidth: '120px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Voucher Date</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{dayjs(viewRecord.date).format('DD-MMM-YYYY')}</p>
              </div>
              <div style={{ minWidth: '130px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Payment Status</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{viewRecord.isAlreadyPaid ? 'ALREADY PAID' : 'PENDING'}</p>
              </div>
              <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>Campus Detail</p>
                <p style={{ margin: 0, fontWeight: 800, color: '#004a99', fontSize: '15px' }}>{viewRecord.campusName || '-'}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#333', fontWeight: 500 }}>Dar-E-Arqam Central Regions Schools</p>
              </div>
            </div>

            {/* Main Content Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
              <thead>
                <tr style={{ background: '#fff' }}>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'left' }}>DESCRIPTION / CATEGORY</th>
                  <th style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', width: '150px' }}>AMOUNT (PKR)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '15px', verticalAlign: 'top', minHeight: '150px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '10px' }}>{viewRecord.expenseCategoryName}</div>
                    <div style={{ fontSize: '13px', color: '#333', fontStyle: 'italic' }}>{viewRecord.description || 'No additional description'}</div>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'right', fontWeight: 700, fontSize: '18px' }}>
                    {viewRecord.amount?.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', fontWeight: 700, background: '#fff' }}>TOTAL:</td>
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'right', fontWeight: 700, background: '#fff', fontSize: '18px' }}>
                    {viewRecord.amount?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bank Info */}
            <div style={{ marginBottom: '50px', padding: '15px', borderLeft: '4px solid #004a99', background: '#fff' }}>
              <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>PAID FROM / BANK ACCOUNT</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{viewRecord.bankAccountName || viewRecord.bankAccountTitle || 'N/A'}</p>
            </div>

            {/* Signatures */}
            <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '12px' }}>Recieved By</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '12px' }}>Prepared By</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderTop: '1px solid #000', paddingTop: '5px', fontSize: '12px' }}>Authorized Signature</div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ position: 'fixed', bottom: '40px', width: 'calc(100% - 80px)', fontSize: '10px', color: '#999', textAlign: 'center' }}>
              System generated voucher. Printed on {dayjs().format('DD-MMM-YYYY HH:mm')}.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expense;

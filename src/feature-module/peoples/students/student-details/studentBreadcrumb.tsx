import React, { useState } from 'react'
import { all_routes } from '../../../router/all_routes'
import { Link, useNavigate } from 'react-router-dom'
import StudentFeeModel from './editFee'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../../../store'
import { GetFeeInvoices } from '../../../../store/apps/fee-invoice'
import toast from 'react-hot-toast'

const StudentBreadcrumb = ({ studentId }: { studentId: number }) => {
  const routes = all_routes
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [loadingReceipt, setLoadingReceipt] = useState(false)

  const handleFeeReceiptNav = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoadingReceipt(true)
    try {
      const response: any = await dispatch(GetFeeInvoices({ pageNo: 1, pageSize: 1, admissionId: studentId }))
      const invoices = response?.payload?.data
      if (invoices && invoices.length > 0) {
        navigate(routes.feeReceipt, { state: { invoiceNumber: invoices[0].invoiceNumber, campusId: invoices[0].campusId } })
      } else {
        toast.error('No fee invoices found for this student')
      }
    } catch (error) {
      toast.error('Error fetching latest fee invoice')
    } finally {
      setLoadingReceipt(false)
    }
  }
  return (
    <div className="col-md-12">
      <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
        <div className="my-auto mb-2">
          <h3 className="page-title mb-1">Student Details</h3>
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to={routes.adminDashboard}>Dashboard</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={routes.studentList}>Student</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Student Details
              </li>
            </ol>
          </nav>
        </div>
        <div className="d-flex my-xl-auto right-content align-items-center  flex-wrap">
          {/* <Link
            to="#"
            className="btn btn-light me-2 mb-2"
            data-bs-toggle="modal"
            data-bs-target="#login_detail"
          >
            <i className="ti ti-lock me-2" />
            Login Details
          </Link> */}
          <button
            onClick={handleFeeReceiptNav}
            className="btn btn-warning me-2 mb-2 d-flex align-items-center"
            disabled={loadingReceipt}
          >
            {loadingReceipt ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="ti ti-receipt me-2" />}
            Fee Receipt
          </button>
          <Link
            to="#"
            className="btn btn-danger me-2 mb-2"
            data-bs-toggle="modal"
            data-bs-target="#edit_fee_details"
          >
            <i className="ti ti-receipt me-2" />
            Edit Fee
          </Link>
          <Link
            to={routes.studentFeeGenerate.replace(":id", studentId.toString())}
            className="btn btn-success me-2 mb-2"
          >
            <i className="ti ti-receipt me-2" />
            Fee Generate
          </Link>
          <Link
            to={`/student/edit-student/${studentId}`}
            className="btn btn-primary d-flex align-items-center mb-2"
          >
            <i className="ti ti-edit-circle me-2" />
            Edit Student Info
          </Link>
        </div>
      </div>
      <StudentFeeModel isEditData={studentId} />
    </div>
  )
}

export default StudentBreadcrumb
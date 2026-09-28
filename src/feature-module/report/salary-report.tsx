import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { GetSalaryReport, SalaryReportData } from '../../store/apps/salary-payroll';
import { Table, Button, Card, Row, Col, Typography, DatePicker, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import TooltipOption from '../../core/common/tooltipOption';
import CommonSelect3 from '../../core/common/commonSelect3';
import { useCampusesList } from '../../core/common/selectoption/master/useCampusesList';
import useRegionsList from '../../core/common/selectoption/master/useRegions';
import { exportSalaryReportToExcel } from '../../core/common/excelExportUtils';

const { Title, Text } = Typography;

const SalaryReport = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  const userInfoString = localStorage.getItem("userData");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const loginInfo = userInfo?.data;

  const [regionId, setRegionId] = useState<number | null>(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : null);
  const campuses = useCampusesList(loginInfo?.userLevel === 2 ? loginInfo?.userLevelId : regionId);
  const regionsList = useRegionsList();
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalaryReportData | null>(null);
  const [month, setMonth] = useState<Dayjs | null>(dayjs());
  const [campusId, setCampusId] = useState<number | null>(loginInfo?.userLevel === 3 ? loginInfo?.userLevelId : null); 

  const fetchReport = async () => {
    if (!campusId) return message.warning('Please select a campus');
    if (!month) return message.warning('Please select a month');
    
    setLoading(true);
    try {
      const payload = {
        campusId,
        salaryMonth: month.startOf('month').format('YYYY-MM-DD'),
        month: month.month() + 1,
        year: month.year()
      };
      const res = await dispatch(GetSalaryReport(payload)).unwrap();
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Emp Code', dataIndex: 'employeeKey', key: 'employeeKey' },
    { title: 'Employee', dataIndex: 'employeeName', key: 'employeeName' },
    { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'Designation', dataIndex: 'designationName', key: 'designationName' },
    { title: 'CNIC', dataIndex: 'cnic', key: 'cnic' },
    { title: 'Days (Tot/Pay)', key: 'days', render: (_: any, record: any) => `${record.totalDays} / ${record.payableDays}` },
    { title: 'Gross', dataIndex: 'grossAmount', key: 'grossAmount' },
    { title: 'Allw.', dataIndex: 'totalAllowance', key: 'totalAllowance' },
    { title: 'Ded.', dataIndex: 'totalDeduction', key: 'totalDeduction' },
    { title: 'Net', dataIndex: 'netAmount', key: 'netAmount' },
    { title: 'Pay Mode', dataIndex: 'paymentMode', key: 'paymentMode' },
    { title: 'Voucher/Cheque', key: 'voucher', render: (_: any, record: any) => record.chequeNumber || record.paymentVoucherNumber || '-' },
    { title: 'Status', dataIndex: 'statusName', key: 'statusName', render: (text: string) => <span className="badge badge-success">{text}</span> },
  ];

  const expandedRowRender = (record: any) => {
    return (
      <Row gutter={16}>
        <Col span={12}>
          <Text strong>Allowances</Text>
          <Table 
            columns={[{ title: 'Head Name', dataIndex: 'headName' }, { title: 'Amount', dataIndex: 'amount' }]} 
            dataSource={record.allowances || []} 
            pagination={false} 
            size="small"
            rowKey="id"
          />
        </Col>
        <Col span={12}>
          <Text strong>Deductions</Text>
          <Table 
            columns={[{ title: 'Head Name', dataIndex: 'headName' }, { title: 'Amount', dataIndex: 'amount' }]} 
            dataSource={record.deductions || []} 
            pagination={false} 
            size="small"
            rowKey="id"
          />
        </Col>
      </Row>
    );
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Salary Report</h3>
            </div>
            <div className="col-auto">
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                <TooltipOption onExportExcel={() => exportSalaryReportToExcel(data)} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-sm-12">
            <div className="card">
              <div className="card-body">
                <Row gutter={16}>
                  {loginInfo?.userLevel === 1 && (
                    <Col span={6}>
                      <CommonSelect3
                        options={regionsList}
                        onChange={(selected) => {
                          setRegionId(selected?.value ? Number(selected.value) : null);
                          setCampusId(null);
                        }}
                        value={regionId ? regionsList?.find((r: any) => r.value === regionId) : null}
                        placeholder="Select Region"
                      />
                    </Col>
                  )}
                  <Col span={6}>
                    <CommonSelect3
                      options={campuses}
                      onChange={(selected) => setCampusId(selected?.value ? Number(selected.value) : null)}
                      value={campusId ? campuses?.find(r => r.value === campusId) : null}
                      placeholder="Select Campus"
                      isDisabled={loginInfo?.userLevel === 3}
                    />
                  </Col>
                  <Col span={6}>
                    <DatePicker 
                      picker="month" 
                      value={month} 
                      onChange={setMonth} 
                      style={{ width: '100%', height: '38px' }} 
                    />
                  </Col>
                  <Col span={6}>
                    <Button type="primary" onClick={fetchReport} loading={loading} style={{ height: '38px' }}>
                      Generate Report
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>

            {data && (
              <div className="card mt-4">
                <div className="card-body">
                  <Row gutter={16} className="mb-3">
                    <Col span={6}><Text strong>Total Gross:</Text> {data.totalGrossSalary}</Col>
                    <Col span={6}><Text strong>Total Net:</Text> {data.totalNetPayable}</Col>
                    <Col span={6}><Text strong>Employees:</Text> {data.totalEmployees}</Col>
                  </Row>
                  <div className="table-responsive">
                    <Table 
                      dataSource={data.employees} 
                      columns={columns} 
                      rowKey="detailId" 
                      pagination={false} 
                      expandable={{ expandedRowRender }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryReport;

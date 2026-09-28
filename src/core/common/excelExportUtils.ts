import { SalaryReportData } from "../../store/apps/salary-payroll";

export const exportSalaryReportToExcel = (data: SalaryReportData | null) => {
  if (!data) return;

  const title = `Salary_Report_${data.salaryMonthName}_${data.campusName?.replace(/\s+/g, '_')}`;

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Salary Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; font-family: sans-serif; }
          th { background-color: #003366; color: #ffffff; font-weight: bold; border: 1px solid #000; padding: 5px; text-align: left; }
          td { border: 1px solid #000; padding: 5px; }
          .header-row { background-color: #f2f2f2; font-weight: bold; }
          .allowance-th { background-color: #2e8b57; color: #ffffff; font-weight: bold; }
          .deduction-th { background-color: #b22222; color: #ffffff; font-weight: bold; }
          .allowance-td { background-color: #e8f5e9; }
          .deduction-td { background-color: #ffebee; }
          .summary { font-weight: bold; background-color: #e0e0e0; }
        </style>
      </head>
      <body>
        <h2>Salary Report - ${data.salaryMonthName} - ${data.campusName}</h2>
        <table>
          <tr>
            <th colspan="2">Campus:</th>
            <td colspan="2">${data.campusName}</td>
            <th colspan="2">Month:</th>
            <td colspan="2">${data.salaryMonthName}</td>
            <th colspan="2">Status:</th>
            <td colspan="2">${data.statusName}</td>
          </tr>
          <tr>
            <th colspan="2">Total Employees:</th>
            <td colspan="2">${data.totalEmployees}</td>
            <th colspan="2">Total Gross:</th>
            <td colspan="2">${data.totalGrossSalary}</td>
            <th colspan="2">Total Net Payable:</th>
            <td colspan="2">${data.totalNetPayable}</td>
          </tr>
          <tr><td colspan="12"></td></tr>
          
          <tr>
            <th>Emp Code</th>
            <th>Employee Name</th>
            <th>Department</th>
            <th>Designation</th>
            <th>CNIC</th>
            <th>Days (Total/Pay)</th>
            <th>Gross</th>
            <th>Allowances</th>
            <th>Deductions</th>
            <th>Net</th>
            <th>Pay Mode</th>
            <th>Cheque/Voucher</th>
          </tr>
  `;

  data.employees.forEach(emp => {
    tableHtml += `
          <tr>
            <td>${emp.employeeKey}</td>
            <td>${emp.employeeName}</td>
            <td>${emp.departmentName}</td>
            <td>${emp.designationName}</td>
            <td>${emp.cnic}</td>
            <td>${emp.totalDays} / ${emp.payableDays}</td>
            <td>${emp.grossAmount}</td>
            <td>${emp.totalAllowance}</td>
            <td>${emp.totalDeduction}</td>
            <td>${emp.netAmount}</td>
            <td>${emp.paymentMode}</td>
            <td>${emp.chequeNumber || emp.paymentVoucherNumber || '-'}</td>
          </tr>
    `;

    // Add Allowances and Deductions if they exist
    if ((emp.allowances && emp.allowances.length > 0) || (emp.deductions && emp.deductions.length > 0)) {
        tableHtml += `
          <tr>
            <td></td>
            <td colspan="11">
              <table>
                <tr>
                  <th class="allowance-th" style="width: 200px;">Allowance Head</th>
                  <th class="allowance-th" style="width: 100px;">Amount</th>
                  <th class="deduction-th" style="width: 200px;">Deduction Head</th>
                  <th class="deduction-th" style="width: 100px;">Amount</th>
                </tr>
        `;
        
        const maxRows = Math.max(emp.allowances?.length || 0, emp.deductions?.length || 0);
        for (let i = 0; i < maxRows; i++) {
          const allowance = emp.allowances?.[i];
          const deduction = emp.deductions?.[i];
          
          tableHtml += `
                <tr>
                  <td class="allowance-td">${allowance?.headName || ''}</td>
                  <td class="allowance-td">${allowance ? allowance.amount : ''}</td>
                  <td class="deduction-td">${deduction?.headName || ''}</td>
                  <td class="deduction-td">${deduction ? deduction.amount : ''}</td>
                </tr>
          `;
        }
        
        tableHtml += `
              </table>
            </td>
          </tr>
        `;
    }
  });

  tableHtml += `
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

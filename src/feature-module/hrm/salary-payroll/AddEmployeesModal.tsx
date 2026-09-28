import React, { useEffect, useMemo, useState } from "react";
import { Modal, Table, Tag, Spin, Input, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { GetEligibleEmployees, EligibleEmployee } from "../../../store/apps/salary-payroll";
import { formatAmount } from "./index";

/**
 * Picks employees a draft missed — a late joiner, or someone a generate-time filter excluded.
 * Employees already on the run are listed but not selectable, so it is obvious why a name is
 * not offered rather than simply absent.
 */
interface AddEmployeesModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  campusId: number;
  salaryPayrollId: number;
  saving: boolean;
  onAdd: (employeeIds: number[]) => void;
}

const AddEmployeesModal: React.FC<AddEmployeesModalProps> = ({
  isOpen,
  setIsOpen,
  campusId,
  salaryPayrollId,
  saving,
  onAdd,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { eligibleEmployees } = useSelector((state: RootState) => state.salaryPayroll);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !campusId) return;

    setSelectedIds([]);
    setLoading(true);
    dispatch(GetEligibleEmployees({ campusId, salaryPayrollId })).finally(() => setLoading(false));
  }, [dispatch, isOpen, campusId, salaryPayrollId]);

  const rows = useMemo(() => {
    if (!searchText.trim()) return eligibleEmployees;
    const needle = searchText.trim().toLowerCase();
    return eligibleEmployees.filter(
      (e) =>
        e.employeeName?.toLowerCase().includes(needle) ||
        e.employeeKey?.toLowerCase().includes(needle) ||
        e.designationName?.toLowerCase().includes(needle)
    );
  }, [eligibleEmployees, searchText]);

  const columns = [
    { title: "Employee ID", dataIndex: "employeeKey", render: (text: string) => text || "—" },
    { title: "Name", dataIndex: "employeeName", render: (text: string) => text || "—" },
    { title: "Designation", dataIndex: "designationName", render: (text: string) => text || "—" },
    {
      title: "Mode",
      dataIndex: "paymentMode",
      render: (text: string) => <Tag color={text === "Cash" ? "green" : "blue"}>{text || "Cash"}</Tag>,
    },
    {
      title: "Allowance",
      dataIndex: "totalAllowance",
      align: "right" as const,
      render: (value: number) => formatAmount(value),
    },
    {
      title: "Deduction",
      dataIndex: "totalDeduction",
      align: "right" as const,
      render: (value: number) => formatAmount(value),
    },
    {
      title: "Net",
      dataIndex: "netAmount",
      align: "right" as const,
      render: (value: number) => <span className="fw-semibold">{formatAmount(value)}</span>,
    },
    {
      title: "",
      key: "state",
      render: (_: any, row: EligibleEmployee) => {
        if (row.alreadyInPayroll) return <Tag>Already added</Tag>;
        if (!row.hasPayrollHeads)
          return (
            <Tooltip title="Nothing on this employee's profile applies to this salary month. Add their allowance/deduction heads on the employee profile first — a payslip line with no profile head behind it never reaches the employee's ledger.">
              <Tag color="orange">No heads configured</Tag>
            </Tooltip>
          );
        return null;
      },
    },
  ];

  return (
    <Modal
      title="Add Employees to Salary Run"
      open={isOpen}
      width={900}
      onCancel={() => setIsOpen(false)}
      okText={selectedIds.length ? `Add ${selectedIds.length}` : "Add"}
      okButtonProps={{ disabled: selectedIds.length === 0 || saving, loading: saving }}
      onOk={() => onAdd(selectedIds)}
    >
      <Spin spinning={loading}>
        <Input
          className="mb-3"
          placeholder="Search employee..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="employeeId"
          size="small"
          pagination={{ pageSize: 10 }}
          rowSelection={{
            selectedRowKeys: selectedIds,
            onChange: (keys) => setSelectedIds(keys as number[]),
            getCheckboxProps: (row: EligibleEmployee) => ({
              disabled: row.alreadyInPayroll || !row.hasPayrollHeads,
            }),
          }}
        />
        <small className="text-muted">
          Only employees with an allowance or deduction on their profile can be added. A payslip
          line reaches the employee's ledger through that profile head, so an employee with none
          configured would be paid with nothing recorded against them.
        </small>
      </Spin>
    </Modal>
  );
};

export default AddEmployeesModal;

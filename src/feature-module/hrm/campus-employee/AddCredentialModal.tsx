import React, { useState, useEffect } from "react";
import { Modal, Spin, Button, Form, Input, Select } from "antd";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { AddUser } from "../../../store/apps/account";
import { UpdateEmployee } from "../../../store/apps/campus-employee";
import { useRolesList } from "../../../core/common/selectoption/rolerights/useRolesList";

interface Props {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  employee: any;
  onSuccess: () => void;
}

const AddCredentialModal: React.FC<Props> = ({ isOpen, setIsOpen, employee, onSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Campus Level = 3
  const userLevel = 3;
  const rolesList = useRolesList(userLevel);

  useEffect(() => {
    if (isOpen && employee) {
      form.setFieldsValue({
        username: employee.email || "",
        password: "",
        email: employee.email || "",
        contactNumber: employee.contactNumber || "",
        roleId: undefined,
      });
    }
  }, [isOpen, employee, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    const payload = {
      userLevel: userLevel,
      userLevelId: employee.campusId,
      roleId: values.roleId,
      username: values.username,
      firstname: employee.firstName || "",
      lastname: employee.lastName || "",
      password: values.password,
      email: values.email,
      contactNumber: values.contactNumber,
      isEnabled: true,
      employeeId: employee.id // Assuming backend needs this to link credential to employee
    };

    try {
      const res = await dispatch(AddUser(payload));
      if (res.payload && (res.payload as any).status !== false) {
        const newUserId = (res.payload as any).id || (res.payload as any).userId || 0;
        
        const updatePayload = {
          ...employee,
          userId: newUserId
        };
        await dispatch(UpdateEmployee(updatePayload));

        setIsOpen(false);
        form.resetFields();
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <Modal
      title="Add Employee Credential"
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Role"
            name="roleId"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select Role">
              {rolesList.map((r: any) => (
                <Select.Option key={r.value} value={r.value}>
                  {r.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter a username" }]}
          >
            <Input placeholder="Username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter a password" }]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter an email" }, { type: 'email', message: "Invalid email" }]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="contactNumber"
            rules={[{ required: true, message: "Please enter a contact number" }]}
          >
            <Input placeholder="Contact Number" />
          </Form.Item>

          <div className="d-flex justify-content-end mt-4">
            <Button onClick={() => setIsOpen(false)} className="me-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Credential
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};

export default AddCredentialModal;

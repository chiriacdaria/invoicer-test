import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Button, Space, DatePicker, message, Typography, Divider } from "antd";
import moment from "moment";
import axios from "axios";

const { Title } = Typography;

interface LineItem {
  id?: number;
  description?: string | null;
  quantity?: number;
  amount?: number;
}

interface FormValues {
  customerDetails: string;
  date: moment.Moment;
  lineItems: LineItem[];
}

const CreateOrUpdateInvoice: React.FC = () => {
  const [form] = Form.useForm<FormValues>();
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const initialValuesRef = useRef<FormValues | null>(null);

useEffect(() => {
  if (id) {
    setLoading(true);
    axios.get(`/api/invoice/${id}`)
      .then(res => {
        const invoice = res.data;
       form.setFieldsValue({
          customerDetails: invoice.customerDetails,
          date: moment(invoice.date),
          lineItems: invoice.lineItems.map((li: any) => ({
            id: li.id,
            description: li.description,
            quantity: li.quantity !== undefined ? Number(li.quantity) : undefined,
            amount: li.amount !== undefined ? Number(li.amount) : undefined,
          })),
        });

        //save initial values for comparison with form changes
        initialValuesRef.current = {
          customerDetails: invoice.customerDetails,
          date: moment(invoice.date), 
          lineItems: invoice.lineItems.map((li: any) => ({
            id: li.id,
            description: li.description,
            quantity: Number(li.quantity),
            amount: Number(li.amount),
          })),
        };
      })
      .catch(() => {
        message.error("Failed to load invoice data");
      })
      .finally(() => setLoading(false));
  }
}, [id, form]);

  const onFinish = async (values: FormValues) => {
    setLoading(true);

     const normalizedCurrent = {
      ...values,
      date: values.date.toISOString(),
      lineItems: values.lineItems.map(li => ({
      ...li,
      quantity: li.quantity ?? 0,
      amount: li.amount ?? 0,
    })),
     };
    
    const normalizedInitial = initialValuesRef.current
    ? {
        ...initialValuesRef.current,
        date: initialValuesRef.current.date.toISOString(),
        lineItems: initialValuesRef.current.lineItems.map(li => ({
          ...li,
          quantity: li.quantity ?? 0,
          amount: li.amount ?? 0,
        })),
      }
    : null;

  if (normalizedInitial && JSON.stringify(normalizedCurrent) === JSON.stringify(normalizedInitial)) {
    setLoading(false);
      navigate("/"); 
    message.info("No changes detected.");
    return; 
  }

    const totalAmount = values.lineItems.reduce((sum, li) => sum + (li.amount || 0), 0);

    // payload for API
    const payload = {
      customerDetails: values.customerDetails,
      date: values.date.toDate(),
      totalAmount,
      lineItems: values.lineItems,
    };

    try {
      if (id) {
        await axios.put(`/api/invoice/${id}`, payload);
        message.success("Invoice updated successfully!");
      } else {
        await axios.post("/api/invoice", payload);
        message.success("Invoice created successfully!");
      }
      navigate("/"); 
    } catch (error) {
      message.error("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div style={{ padding: "24px" }}>
      <Title level={3}>{id ? `Edit Invoice #${id}` : "Create Invoice"}</Title>
      <Divider />
    <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
      <Form.Item
        label="Customer Details"
        name="customerDetails"
        rules={[{ required: true, message: "Please input customer details" }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>

      <Form.Item
        label="Date"
        name="date"
        rules={[{ required: true, message: "Please select the date" }]}
      >
        <DatePicker />
      </Form.Item>

<Form.List name="lineItems" initialValue={[{ description: "", quantity: 1, amount: 0.01 }]}>
  {(fields, { add, remove }) => (
    <>
      {fields.map(({ key, name, ...restField }) => (
        <Space
          key={key}
          style={{ display: "flex", marginBottom: 8 }}
          align="baseline"
        >
          <Form.Item
            {...restField}
            label="Description"
            name={[name, "description"]}
            rules={[{ required: true, message: "Missing description" }]}
          >
            <Input placeholder="Description" />
          </Form.Item>

          <Form.Item
            {...restField}
            label="Quantity"
            name={[name, "quantity"]}
            rules={[
              { required: true, type: "number", min: 1, message: "At least 1" },
            ]}
          >
            <InputNumber min={1} />
          </Form.Item>

          <Form.Item
            {...restField}
            label="Amount"
            name={[name, "amount"]}
            rules={[
              { required: true, type: "number", min: 0.01, message: "Amount must be at least 0.01" },
            ]}
          >
            <InputNumber min={0.01} step={0.01} />
          </Form.Item>

          {fields.length > 1 && (
            <Button danger type="text" onClick={() => remove(name)}>
              Remove
            </Button>
          )}
        </Space>
      ))}
      <Form.Item>
        <Button onClick={() => add({ amount: 0.01, quantity: 1, description: "" })}>Add Line Item</Button>
      </Form.Item>
    </>
  )}
</Form.List>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {id ? "Update Invoice" : "Create Invoice"}
        </Button>
      </Form.Item>
      </Form>
      </div>
  );
};

export default CreateOrUpdateInvoice;

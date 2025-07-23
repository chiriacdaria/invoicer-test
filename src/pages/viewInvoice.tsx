import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Descriptions, Spin, Alert, Table, Row, Col, Typography, Divider, Button, Space } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceWithLineItems } from '../../api/db/schema';
import { PrinterOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ViewInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceWithLineItems | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string | number) => `$${Number(amount).toFixed(2)}`,
    },
  ];

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const response = await axios.get(`/api/invoice/${id}`);
        setInvoice(response.data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Error fetching the invoice');
      } finally {
        setLoading(false);
      }
    }

    fetchInvoice();
  }, [id]);

  const handleEdit = () => {
    navigate(`/create/${id}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px' }}>
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <Alert message={error} type="error" />
      ) : (
        <>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3}>Invoice #{invoice?.id}</Title>
            </Col>
            <Col>
              <Space>
                <Button icon={<EditOutlined />} onClick={handleEdit}>
                  Edit
                </Button>
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  Print
                </Button>
              </Space>
            </Col>
          </Row>

          <Divider />

          <Descriptions bordered column={2}>
            <Descriptions.Item label="Customer Details">{invoice?.customerDetails}</Descriptions.Item>
            <Descriptions.Item label="Date">
              {invoice?.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount" span={2}>
              ${Number(invoice?.totalAmount).toFixed(2)}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5}>Line Items</Title>
          <Table
            dataSource={invoice?.lineItems}
            columns={columns}
            pagination={false}
            rowKey="id"
            style={{ marginTop: '8px' }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={1} />
                <Table.Summary.Cell index={2}>
                  ${Number(invoice?.totalAmount).toFixed(2)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </>
      )}
    </div>
  );
};

export default ViewInvoice;

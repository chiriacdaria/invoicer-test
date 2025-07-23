import { useEffect, useState } from "react";
import { Table as RSTable, Container, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { Space, message, Popconfirm, Input, Row, Col } from "antd";
import { DeleteOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { Invoice } from "api/db/schema";

const { Search } = Input;

function Invoices() {
  const { invoices, fetchInvoices, deleteInvoice } = useInvoiceStore();
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const lower = searchText.toLowerCase();
      const filtered = invoices.filter((inv) =>
        inv.customerDetails.toLowerCase().includes(lower) ||
        inv.id.toString().includes(lower)
      );
      setFilteredInvoices(filtered);
    }, 300); // debounce delay 300ms

    return () => clearTimeout(timeout); // clear if user types again
  }, [invoices, searchText]);

  const handleDelete = async (id: number) => {
    try {
      await deleteInvoice(id);
      message.success("Invoice deleted successfully");
    } catch {
      message.error("Failed to delete invoice");
    }
  };

  return (
    <Container>
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2 className="my-2">Invoices</h2>
        </Col>
        <Col>
          <Search
            placeholder="Search by customer or ID"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Col>
      </Row>

      <RSTable striped responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer Details</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No invoices found.
              </td>
            </tr>
          ) : (
            filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>{invoice.id}</td>
                <td>{invoice.customerDetails}</td>
                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                <td>${Number(invoice.totalAmount).toFixed(2)}</td>
                <td>
                  <Space>
                    <Button
                      size="sm"
                      color="primary"
                      onClick={() => navigate(`/invoice/${invoice.id}`)}
                    >
                      <EyeOutlined /> View
                    </Button>

                    <Button
                      size="sm"
                      color="warning"
                      onClick={() => navigate(`/create/${invoice.id}`)}
                    >
                      <EditOutlined /> Edit
                    </Button>

                    <Popconfirm
                      title="Are you sure you want to delete this invoice?"
                      onConfirm={() => handleDelete(invoice.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button size="sm" color="danger">
                        <DeleteOutlined /> Delete
                      </Button>
                    </Popconfirm>
                  </Space>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </RSTable>
    </Container>
  );
}

export { Invoices };

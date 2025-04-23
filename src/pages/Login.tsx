import React, { useEffect, useState } from "react";
import { Button, Form, Input, Card, Typography, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Title } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [autoLoginDone, setAutoLoginDone] = useState(false);
  const [error, setError] = useState<string | null>(null); // <-- add error state here
  const navigate = useNavigate();
  const location = useLocation();

  // Get ID from localStorage or from query string
  const [id, setId] = useState<string | null>(localStorage.getItem("dataId"));

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const queryId = queryParams.get("id");

    if (!id && queryId) {
      localStorage.setItem("dataId", queryId);
      setId(queryId);
    }
  }, [id, location.search]);

  const login = async (values: any) => {
    setLoading(true);
    setError(null); // Clear previous errors on new login attempt
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        message.success("Login successful");
        navigate(`/data?id=${id}`);
      } else {
        setError(data.error || "Login failed");
        message.error(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
      message.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: any) => {
    login(values);
  };

  useEffect(() => {
    if (!id || autoLoginDone) return;

    const fetchCredentialsAndLogin = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/fetch/${id}`);
        if (!res.ok) {
          setError("Failed to fetch credentials");
          message.error("Failed to fetch credentials");
          return;
        }

        const data = await res.json();
        form.setFieldsValue({
          username: data.username,
          password: data.password,
        });

        login({ username: data.username, password: data.password });
        setAutoLoginDone(true);
      } catch (error) {
        setError("Auto login failed");
        message.error("Auto login failed");
      }
    };

    fetchCredentialsAndLogin();
  }, [form, id, autoLoginDone]);

  // Clear storage on tab/window close
  useEffect(() => {
    const handleUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("dataId");
    };

    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: 100 }}>
      <Card title={<Title level={3}>Login</Title>} style={{ width: 400 }}>
        {id ? (
          <>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Login
                </Button>
              </Form.Item>
            </Form>
            {/* Show error message below form */}
            {error && (
              <Typography.Text
                type="danger"
                style={{ display: "block", marginTop: 10 }}
              >
                {error}
              </Typography.Text>
            )}
          </>
        ) : (
          <Typography.Text type="danger">
            Data ID missing. Please use a valid link with ID.
          </Typography.Text>
        )}
      </Card>
    </div>
  );
};

export default Login;

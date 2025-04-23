import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Spin, Alert, message } from "antd";
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface DecodedData {
  route: string;
  origin: string;
  destination: string;
  username: string;
  password: string;
  video?: string;
  mimetype?: string;
}

const DataPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState<DecodedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAndLogin = async () => {
      setError(null);
      setLoading(true);

      const params = new URLSearchParams(location.search);
      const id = params.get("id");

      if (!id) {
        setError("Missing data ID in URL");
        setLoading(false);
        return;
      }

      // Save ID to localStorage
      localStorage.setItem("dataId", id);

      try {
        // Step 1: Fetch data WITHOUT token
        const res1 = await fetch(
          `https://push-api-server.vercel.app/api/fetch/${id}`
        );
        if (!res1.ok) throw new Error("Data not found");

        const fetchedData: DecodedData = await res1.json();
        setData(fetchedData);

        // Step 2: Check token
        const existingToken = localStorage.getItem("token");
        if (existingToken) {
          console.log("Token already exists, skipping login");
          return;
        }

        // Step 3: Perform login
        const loginRes = await fetch(
          `https://push-api-server.vercel.app/api/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: fetchedData.username,
              password: fetchedData.password,
            }),
          }
        );

        if (!loginRes.ok) {
          message.error("Invalid credentials, please login manually.");
          navigate("/login");
          return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) {
          message.error("Login failed, please login manually.");
          navigate("/login");
          return;
        }

        localStorage.setItem("token", token);
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndLogin();

    // Cleanup on tab/window close
    const handleBeforeUnload = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("dataId");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [location.search, navigate]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ color: "#fff", margin: 16, textAlign: "center" }}>
          LOGO
        </div>
        <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
        </Menu>
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: "#fff", paddingLeft: 16 }}>
          {collapsed ? (
            <MenuUnfoldOutlined onClick={() => setCollapsed(false)} />
          ) : (
            <MenuFoldOutlined onClick={() => setCollapsed(true)} />
          )}
          <span style={{ marginLeft: 16, fontSize: 18 }}>View Route Data</span>
        </Header>

        <Content style={{ margin: "24px 16px 0" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            {error ? (
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
              />
            ) : loading ? (
              <Spin tip="Loading..." size="large" />
            ) : data ? (
              <Card>
                <Title level={3}>Received Route Information</Title>
                <Text strong>Route:</Text>
                <p>{data.route}</p>

                <Text strong>Origin (Lat, Lng):</Text>
                <p>{data.origin}</p>

                <Text strong>Destination (Lat, Lng):</Text>
                <p>{data.destination}</p>

                <Text strong>Username:</Text>
                <p>{data.username}</p>

                <Text strong>Password:</Text>
                <p>{data.password}</p>

                {data.video && data.mimetype && (
                  <>
                    <Text strong>Video Preview:</Text>
                    <div style={{ marginTop: 12 }}>
                      <video
                        width="100%"
                        controls
                        src={`data:${data.mimetype};base64,${data.video}`}
                        autoPlay
                      />
                    </div>
                  </>
                )}
              </Card>
            ) : (
              <Spin tip="Loading..." size="large" />
            )}
          </div>
        </Content>

        <Footer style={{ textAlign: "center" }}>
          ©2025 Created by Muhammad
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DataPage;

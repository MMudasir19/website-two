import React, { useEffect, useState } from "react";
import { Layout, Menu, Typography, Card, Spin, Alert } from "antd";
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

interface DecodedData {
  route: string;
  origin: string;
  destination: string;
  username: string;
  password: string;
}

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState<DecodedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
      fetch(`https://push-api-server.vercel.app/api/fetch/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data);
        })
        .catch((err) => {
          console.error(err);
          setError("Could not fetch route data");
        });
    } else {
      setError("No ID provided in URL");
    }
  }, []);

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
            ) : !data ? (
              <Spin tip="Loading..." size="large" />
            ) : (
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
              </Card>
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

export default App;

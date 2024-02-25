import React from "react";
import {
  LaptopOutlined,
  PaperClipOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  GroupOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme, Button } from "antd";
const { Content, Footer, Sider } = Layout;
const items = [
  {
    key: "logs",
    icon: React.createElement(LaptopOutlined),
    label: "Logs",
  },
  {
    key: "Users",
    icon: React.createElement(UserOutlined),
    label: "Users",
  },
  {
    key: "Roles",
    icon: React.createElement(GroupOutlined),
    label: "Roles",
  },
  {
    key: "Stats",
    icon: React.createElement(PaperClipOutlined),
    label: "Stats",
  },
  {
    key: "Help",
    icon: React.createElement(QuestionCircleOutlined),
    label: "Help",
  },
];

const App = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout
      style={{
        height: "100vh",
      }}
    >
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="demo-logo-vertical">
          <img
            style={{
              width: "100%",
              height: "auto",
              padding: "24px",
              borderRadius: "50%",
            }}
            src="logo.png"
          ></img>
        </div>
        <Menu
          style={{
            fontSize: "2em",
          }}
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={items}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            margin: "24px 16px 0",
          }}
        >
          <div
            style={{
              padding: 24,
              minHeight: "100%",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            content
          </div>
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          <a href="https://github.com/techy2493/ts-disc-control">
            <Button shape="circle" icon={<GithubOutlined />} />
          </a>
          &nbsp;&nbsp;&nbsp;&nbsp;TS-Discord-Bot ©2024 Created by Techy
        </Footer>
      </Layout>
    </Layout>
  );
};
export default App;

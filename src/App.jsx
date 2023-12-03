import { useState } from "react";
import { ConfigProvider, theme } from "antd";
import { Layout } from "antd";
import { appWindow, LogicalSize } from "@tauri-apps/api/window";

const { Header, Sider, Content } = Layout;

const lightTheme = {};
const darkTheme = {};

const headerStyle = {
    color: "#fff",
    height: 48,
    borderBottom: "1px solid #ccc",
};

const contentStyle = {
    height: 350,
    color: "#fff",
};

const siderStyle = {
    color: "#fff",
};

await appWindow.setSize(
    new LogicalSize(800, headerStyle.height + contentStyle.height)
);

function App() {
    const [currentTheme, setCurrentTheme] = useState("light");

    return (
        <ConfigProvider
            theme={{
                token: currentTheme === "light" ? lightTheme : darkTheme,
            }}
        >
            <Layout>
                <Header style={headerStyle}>Header</Header>
                <Layout>
                    <Sider style={siderStyle}>Sider</Sider>
                    <Content style={contentStyle}>Content</Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}

export default App;

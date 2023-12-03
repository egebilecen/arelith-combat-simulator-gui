import { appWindow, LogicalSize } from "@tauri-apps/api/window";
import { useState } from "react";
import { ConfigProvider, theme } from "antd";
import { Layout, Typography, Button, Flex } from "antd";
import { green } from "@ant-design/colors";

const { Header, Sider, Content } = Layout;
const { Text, Link } = Typography;

const lightTheme = {
    token: {
        colorBgContainer: "#fff",
    },
    components: {},
};

const darkTheme = {
    token: {},
    components: {},
};

const headerStyle = {
    height: 32,
    lineHeight: "32px",
    borderBottom: "1px solid #ccc",
    display: "flex",
};

const contentStyle = {
    height: 350,
    backgroundColor: "transparent",
};

const siderStyle = {
    backgroundColor: "transparent",
};

await appWindow.setSize(
    new LogicalSize(800, headerStyle.height + contentStyle.height + 5)
);

function App() {
    const [currentTheme, setCurrentTheme] = useState("light");

    const getTheme = () => {
        if (currentTheme == "dark") return darkTheme;

        return lightTheme;
    };

    const windowMinimize = () => {
        appWindow.minimize();
    };

    const windowClose = () => {
        appWindow.close();
    };

    return (
        <ConfigProvider
            theme={currentTheme === "light" ? lightTheme : darkTheme}
        >
            <Layout>
                <Header
                    data-tauri-drag-region
                    style={{
                        ...headerStyle,
                        background: getTheme().token.colorBgContainer,
                        padding: "0 8px 0 19px",
                    }}
                >
                    <span data-tauri-drag-region style={{ fontWeight: 600 }}>
                        NwN Damage Calculator
                    </span>

                    <Flex
                        gap={5}
                        justify="end"
                        style={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                        }}
                        data-tauri-drag-region
                    >
                        <Button
                            type="primary"
                            shape="circle"
                            style={{
                                minWidth: 16,
                                width: 16,
                                height: 16,
                                backgroundColor: green.primary,
                            }}
                            onClick={windowMinimize}
                        />

                        <Button
                            type="primary"
                            shape="circle"
                            danger
                            style={{
                                minWidth: 16,
                                width: 16,
                                height: 16,
                            }}
                            onClick={windowClose}
                        />
                    </Flex>
                </Header>
                <Layout>
                    <Sider style={{ ...siderStyle }}>Sider</Sider>
                    <Content style={{ ...contentStyle }}>Content</Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}

export default App;

import {
    appWindow,
    LogicalSize,
    currentMonitor,
    PhysicalPosition,
} from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { ConfigProvider, theme } from "antd";
import { Layout, Button, Flex } from "antd";
import { yellow } from "@ant-design/colors";
import LeftMenu from "./LeftMenu";
import HomePage from "./Pages/Home";

const { Header, Sider, Content } = Layout;

const windowConfig = {
    innerPadding: 10 * 4,
    borderRadius: 6,
};

const lightTheme = {
    token: {},
    components: {
        Header: {
            custom: {
                backgroundColor: "#fff",
            },
        },
    },
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
    height: 460,
    padding: 10,
};

const siderStyle = {
    borderBottomLeftRadius: windowConfig.borderRadius,
};

await appWindow.setSize(
    new LogicalSize(
        800 + windowConfig.innerPadding,
        headerStyle.height + contentStyle.height + windowConfig.innerPadding
    )
);

if (await invoke("is_debug")) {
    const monitor = await currentMonitor();

    if (monitor !== null) {
        let size = await appWindow.innerSize();
        await appWindow.setPosition(
            new PhysicalPosition(monitor.size.width - size.width + 10, -10)
        );
    }
} else {
    document.addEventListener("contextmenu", (event) => event.preventDefault());
}

function App() {
    const [currentTheme, setCurrentTheme] = useState("light");
    const [currentPage, setCurrentPage] = useState(<HomePage />);

    const headerButtonSize = 14;

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
            <Layout
                style={{
                    borderRadius: windowConfig.borderRadius,
                    boxShadow: "0px 0px 12px 0px rgba(0,0,0,0.20)",
                }}
            >
                <Header
                    data-tauri-drag-region
                    style={{
                        ...headerStyle,
                        background:
                            getTheme().components.Header.custom.backgroundColor,
                        padding: "0 8px 0 19px",
                        position: "relative",
                        borderTopLeftRadius: windowConfig.borderRadius,
                        borderTopRightRadius: windowConfig.borderRadius,
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
                        <ConfigProvider
                            theme={{
                                components: {
                                    Button: {
                                        colorPrimary: yellow.primary,
                                        colorPrimaryActive: yellow[6],
                                        colorPrimaryHover: yellow[4],
                                    },
                                },
                            }}
                        >
                            <Button
                                type="primary"
                                shape="circle"
                                style={{
                                    minWidth: headerButtonSize,
                                    width: headerButtonSize,
                                    height: headerButtonSize,
                                }}
                                onClick={windowMinimize}
                            />
                        </ConfigProvider>

                        <Button
                            type="primary"
                            shape="circle"
                            danger
                            style={{
                                minWidth: headerButtonSize,
                                width: headerButtonSize,
                                height: headerButtonSize,
                            }}
                            onClick={windowClose}
                        />
                    </Flex>
                </Header>
                <Layout
                    id="app-body"
                    style={{
                        borderRadius: windowConfig.borderRadius,
                        position: "relative"
                    }}
                >
                    <Sider style={{ ...siderStyle }} theme={currentTheme}>
                        <LeftMenu
                            theme={currentTheme}
                            setCurrentPage={setCurrentPage}
                        />
                    </Sider>
                    <Content style={{ ...contentStyle }}>{currentPage}</Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}

export default App;

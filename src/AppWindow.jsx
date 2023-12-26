import { invoke } from "@tauri-apps/api";
import {
    appWindow,
    LogicalSize,
    currentMonitor,
    PhysicalPosition,
} from "@tauri-apps/api/window";
import { useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { ConfigProvider, Layout, Button, Flex, Typography, theme } from "antd";
import { yellow } from "@ant-design/colors";
import LeftMenu from "./LeftMenu";
import HomePage from "./Pages/Home";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const appVersion = await getVersion();

const headerConfig = {
    height: 32,
    lineHeight: "32px",
    borderBottom: "1px solid #ccc",
    display: "flex",
};

const windowConfig = {
    innerPadding: 10 * 4,
    borderRadius: 6,
};

const innerWindowConfig = {
    height: 460,
    padding: 10,
    overflowX: "hidden",
    overflowY: "auto",
};

const siderStyle = {
    borderBottomLeftRadius: windowConfig.borderRadius,
};


await appWindow.setSize(
    new LogicalSize(
        800 + windowConfig.innerPadding,
        headerConfig.height + innerWindowConfig.height + windowConfig.innerPadding
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

function AppWindow( { themeStr } ) {
    const { token } = theme.useToken();
    const [currentPage, setCurrentPage] = useState(<HomePage />);

    const headerButtonSize = 14;

    const windowMinimize = () => {
        appWindow.minimize();
    };

    const windowClose = () => {
        appWindow.close();
    };

    return (
        <Layout
            style={{
                borderRadius: windowConfig.borderRadius,
                boxShadow: "0px 0px 12px 0px rgba(0,0,0,0.20)",
            }}
        >
            <Header
                data-tauri-drag-region
                style={{
                    ...headerConfig,
                    background:
                        token.Header.custom.backgroundColor,
                    padding: "0 8px 0 19px",
                    position: "relative",
                    borderTopLeftRadius: windowConfig.borderRadius,
                    borderTopRightRadius: windowConfig.borderRadius,
                }}
            >
                <span data-tauri-drag-region style={{ fontWeight: 600 }}>
                    Arelith Combat Simulator
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
                    position: "relative",
                }}
            >
                <Sider style={{ ...siderStyle }} theme={themeStr}>
                    <LeftMenu
                        theme={themeStr}
                        setCurrentPage={setCurrentPage}
                    />

                    <Text
                        type="secondary"
                        style={{
                            position: "absolute",
                            bottom: 5,
                            left: 10,
                        }}
                    >
                        Version {appVersion}
                    </Text>
                </Sider>
                <Content id="app-body-content" style={{ ...innerWindowConfig }}>
                    {currentPage}
                </Content>
            </Layout>
        </Layout>
    );
}

export default AppWindow;

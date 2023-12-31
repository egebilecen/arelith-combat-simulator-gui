import { invoke } from "@tauri-apps/api";
import {
    appWindow,
    LogicalSize,
    currentMonitor,
    PhysicalPosition,
} from "@tauri-apps/api/window";
import {
    isPermissionGranted,
    requestPermission,
} from "@tauri-apps/api/notification";
import { useState, useEffect, useContext } from "react";
import { getVersion } from "@tauri-apps/api/app";
import {
    compare as compareSemVer,
    validate as validateSemVer,
} from "compare-versions";
import {
    ConfigProvider,
    Layout,
    Button,
    Flex,
    Typography,
    theme,
    Space,
} from "antd";
import { yellow } from "@ant-design/colors";
import { AppContext } from "./App";
import LeftMenu, { getMenuItemFromRoute } from "./LeftMenu";
import { LATEST_RELEASE_URL, RELEASES_URL } from "./config";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const headerButtonSize = 14;
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

document.getElementById("root").style.maxHeight =
    headerConfig.height + innerWindowConfig.height + "px";

function AppWindow({ themeStr }) {
    const { pageRoute, notificationApi } = useContext(AppContext);
    const { token } = theme.useToken();
    const [appVersion, setAppVersion] = useState("0.0.0");

    useEffect(() => {
        async function func() {
            const appVer = await getVersion();
            setAppVersion(appVer);

            let permissionGranted = await isPermissionGranted();

            if (!permissionGranted) {
                const permission = await requestPermission();
                permissionGranted = permission === "granted";
            }

            await appWindow.setSize(
                new LogicalSize(
                    800 + windowConfig.innerPadding,
                    headerConfig.height +
                        innerWindowConfig.height +
                        windowConfig.innerPadding
                )
            );

            if (await invoke("is_debug")) {
                const monitor = await currentMonitor();

                if (monitor !== null) {
                    let size = await appWindow.innerSize();
                    await appWindow.setPosition(
                        new PhysicalPosition(
                            monitor.size.width - size.width + 10,
                            -10
                        )
                    );
                }
            } else {
                document.addEventListener("contextmenu", (event) =>
                    event.preventDefault()
                );
            }

            // Check update
            const response = await fetch(LATEST_RELEASE_URL, {
                method: "GET",
                timeout: 15,
            });
            const latestRelease = JSON.parse(await response.text());
            const latestVersion = latestRelease.tag_name;

            if (
                validateSemVer(latestVersion) &&
                compareSemVer(latestVersion, appVer, ">")
            ) {
                const notificationKey = Date.now();
                notificationApi.info({
                    key: notificationKey,
                    message: "A new version is available!",
                    description:
                        "A new version of the application is available. It is recommended to update the application as it may offer new features and/or bug fixes.",
                    placement: "topRight",
                    duration: 0,
                    btn: (
                        <Space>
                            <Button
                                type="primary"
                                href={RELEASES_URL}
                                target="_blank"
                                onClick={() =>
                                    notificationApi.destroy(notificationKey)
                                }
                            >
                                View
                            </Button>
                        </Space>
                    ),
                });
            }
        }

        func();
    }, []);

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
            }}
        >
            <Header
                data-tauri-drag-region
                style={{
                    ...headerConfig,
                    background: token.Header.custom.backgroundColor,
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
                    <LeftMenu theme={themeStr} />

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
                    {getMenuItemFromRoute(pageRoute)}
                </Content>
            </Layout>
        </Layout>
    );
}

export default AppWindow;

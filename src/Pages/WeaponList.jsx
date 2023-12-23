import { useEffect, useState } from "react";
import {
    Spin,
    Button,
    Flex,
    Result,
    List,
    Drawer,
    Row,
    Col,
    Form,
    Space,
    Input,
    Divider,
    Select,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import PageContainer from "../Sections/PageContainer";
import { invoke } from "@tauri-apps/api";

function WeaponListPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [weaponList, setWeaponList] = useState([]);
    const [isWeaponFormOpen, setIsWeaponFormOpen] = useState(false);
    const [weaponForm] = Form.useForm();

    const handleNewWeaponClick = (e) => {
        setIsWeaponFormOpen(true);
    };

    const handleWeaponFormCancelClick = (e) => {
        weaponForm.resetFields();
        setIsWeaponFormOpen(false);
    };

    const handleWeaponCreateClick = async (e) => {
        try {
            const values = await weaponForm.validateFields();
            console.log("Success:", values);
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
        }
    };

    // Load weapons
    useEffect(() => {
        async function func() {
            let res = await invoke("get_rows", { table: "weapons" });
            setIsLoading(false);

            console.log(res);

            if (!res.success) {
                setErrorText(res.msg);
                setIsErrorOccured(true);
                return;
            }

            setWeaponList(res.result);
        }

        func();
    }, []);

    return (
        <>
            <PageContainer>
                <Flex
                    justify="end"
                    style={{
                        marginBottom: 10,
                        display: isLoading || isErrorOccured ? "none" : "flex",
                    }}
                >
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleNewWeaponClick}
                    >
                        New
                    </Button>
                </Flex>

                <Spin
                    indicator={<LoadingOutlined />}
                    tip="Loading..."
                    spinning={isLoading}
                >
                    <p
                        style={{
                            display: isLoading === true ? "block" : "none",
                        }}
                    >
                        &nbsp;
                    </p>
                </Spin>

                <Result
                    style={{
                        display: isErrorOccured ? "block" : "none",
                    }}
                    status="warning"
                    title="An error occured while getting the character list."
                    subTitle={"Error — " + errorText}
                />

                <List
                    style={{ display: isLoading ? "none" : "block" }}
                    itemLayout="horizontal"
                    dataSource={weaponList}
                    renderItem={(item) => (
                        <List.Item actions={[<a key="delete">delete</a>]}>
                            <List.Item.Meta
                                title="Test Title"
                                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
                            />
                        </List.Item>
                    )}
                />

                <Drawer
                    title="Create a new weapon"
                    width={window.innerWidth / 1.75}
                    open={isWeaponFormOpen}
                    closable={false}
                    getContainer={document.querySelector("#app-body")}
                    rootStyle={{ position: "absolute" }}
                    extra={
                        <Space>
                            <Button onClick={handleWeaponFormCancelClick}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleWeaponCreateClick}
                            >
                                Create
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        form={weaponForm}
                        layout="vertical"
                        requiredMark={false}
                    ></Form>
                </Drawer>
            </PageContainer>
        </>
    );
}

export default WeaponListPage;

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

function CharacterListPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [characterList, setCharacterList] = useState([]);
    const [isCharacterFormOpen, setIsCharacterFormOpen] = useState(false);
    const [characterForm] = Form.useForm();

    const handleNewCharacterClick = (e) => {
        setIsCharacterFormOpen(true);
    };

    const handleCharacterFormCancelClick = (e) => {
        characterForm.resetFields();
        setIsCharacterFormOpen(false);
    };

    const handleCharacterCreateClick = async (e) => {
        try {
            const values = await characterForm.validateFields();
            console.log("Success:", values);
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
        }
    };

    // Load characters
    useEffect(() => {
        async function func() {
            let res = await invoke("get_rows", { table: "characters" });
            setIsLoading(false);

            console.log(res);

            if (!res.success) {
                setErrorText(res.msg);
                setIsErrorOccured(true);
                return;
            }

            setCharacterList(res.result);
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
                        onClick={handleNewCharacterClick}
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
                    dataSource={characterList}
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
                    title="Create a new character"
                    width={window.innerWidth / 1.75}
                    open={isCharacterFormOpen}
                    closable={false}
                    getContainer={document.querySelector("#app-body")}
                    rootStyle={{ position: "absolute" }}
                    extra={
                        <Space>
                            <Button onClick={handleCharacterFormCancelClick}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleCharacterCreateClick}
                            >
                                Create
                            </Button>
                        </Space>
                    }
                >
                    <Form
                        form={characterForm}
                        layout="vertical"
                        requiredMark={false}
                    >
                        <Row gutter={16}>
                            <Col flex="auto">
                                <Form.Item
                                    name="name"
                                    label="Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a name.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="23 f / 7 wm" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={16}>
                            <Col span={6}>
                                <Form.Item
                                    name="ab"
                                    label="AB"
                                    rules={[
                                        {
                                            required: true,
                                            pattern: new RegExp(
                                                /^[1-9]+([0-9]+)?$/g
                                            ),
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="50" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="str"
                                    label="STR Score"
                                    rules={[
                                        {
                                            required: true,
                                            pattern: new RegExp(
                                                /^[1-9]+([0-9]+)?$/g
                                            ),
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="40" />
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <div
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        height: "100%",
                                        paddingTop: 10,
                                        paddingBottom: 20,
                                    }}
                                >
                                    <Divider
                                        type="vertical"
                                        style={{
                                            height: "50%",
                                            width: 5,
                                            height: "100%",
                                        }}
                                    />
                                </div>
                            </Col>
                            <Col span={5}>
                                <Form.Item
                                    name="base_apr"
                                    label="Base APR"
                                    rules={[
                                        {
                                            required: true,
                                            pattern: new RegExp(
                                                /^[1-9]+([0-9]+)?$/g
                                            ),
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="4" />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item
                                    name="extra_apr"
                                    label="Extra APR"
                                    rules={[
                                        {
                                            required: true,
                                            pattern: new RegExp(/^[0-9]+$/g),
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="0" />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="weapon"
                                    label="Weapon"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please select a weapon.",
                                        },
                                    ]}
                                >
                                    <Select placeholder="Select a weapon.">
                                        <Option
                                            title=""
                                            value="temp"
                                        >
                                            <b>Temp</b> — Scimitar (12-20 x3)
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="features"
                                    label="Features"
                                    rules={[
                                        {
                                            required: false,
                                        },
                                    ]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="(Optional) Select any features."
                                        defaultValue={["Blind Fight"]}
                                    >
                                        <Option
                                            title="Feat"
                                            value="Blind Fight"
                                        >
                                            Blind Fight
                                        </Option>
                                        <Option
                                            title="Feat — Considers the user as having all dual-wielding feats."
                                            value="Dual Wielding"
                                        >
                                            Dual Wielding
                                        </Option>
                                        <Option
                                            title="Feat"
                                            value="Bane of Enemies"
                                        >
                                            Bane of Enemies
                                        </Option>
                                        <Option
                                            title="Feat"
                                            value="Overwhelming Critical"
                                        >
                                            Overwhelming Critical
                                        </Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
            </PageContainer>
        </>
    );
}

export default CharacterListPage;

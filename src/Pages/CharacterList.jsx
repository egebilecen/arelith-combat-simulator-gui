import { useEffect, useState } from "react";
import {
    Spin,
    Button,
    Flex,
    Result,
    List,
    Row,
    Col,
    Form,
    Space,
    Input,
    Divider,
    Select,
    Tooltip,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import Drawer from "../Components/Drawer";
import PageContainer from "../Sections/PageContainer";
import { invoke } from "@tauri-apps/api";

function CharacterListPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [characterList, setCharacterList] = useState([]);
    const [weaponList, setWeaponList] = useState([]);
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
            const [rows, weapon_rows] = await Promise.all([
                invoke("get_rows", { table: "characters" }),
                invoke("get_rows", { table: "weapons" }),
            ]);

            setIsLoading(false);

            if (!rows.success) {
                setErrorText(rows.msg);
                setIsErrorOccured(true);
                return;
            }

            if (!weapon_rows.success) {
                setErrorText(weapon_rows.msg);
                setIsErrorOccured(true);
                return;
            } else {
                weapon_rows.result.map((weapon_row) => {
                    weapon_row.obj = JSON.parse(weapon_row.json);
                });
            }

            console.log(rows);
            console.log(weapon_rows);
            console.log("---");

            setCharacterList(rows.result);
            setWeaponList(weapon_rows.result);
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
                    title="An error occured"
                    subTitle={errorText}
                />

                <List
                    style={{
                        display: isLoading || isErrorOccured ? "none" : "block",
                    }}
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
                    open={isCharacterFormOpen}
                    closable={false}
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
                                    <Input placeholder="23 F / 7 WM" />
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
                                    <Tooltip
                                        title="APR gained from level / class progression."
                                        placement="bottomLeft"
                                    >
                                        <Input placeholder="4" />
                                    </Tooltip>
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
                                    <Tooltip
                                        title="APR gained from effects such as haste, thundering rage, etc. Do NOT add the dual-wielding APR bonus here. Just select dual-wielding from the features below."
                                        placement="bottomLeft"
                                    >
                                        <Input placeholder="0" />
                                    </Tooltip>
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
                                    <Select
                                        placeholder="Select a weapon"
                                        options={weaponList.map(
                                            (weapon_row) => {
                                                const threat_range =
                                                    weapon_row.obj
                                                        .item_properties[0]
                                                        .ThreatRangeOverride;
                                                const crit_mult =
                                                    weapon_row.obj
                                                        .item_properties[1]
                                                        .CriticalMultiplierOverride;

                                                return {
                                                    key:
                                                        "weapon-" +
                                                        weapon_row.id,
                                                    label:
                                                        weapon_row.name +
                                                        " (" +
                                                        (threat_range < 20
                                                            ? threat_range +
                                                              "-20"
                                                            : "20") +
                                                        ", x" +
                                                        crit_mult +
                                                        ")",
                                                    value: weapon_row.id,
                                                    title: "",
                                                };
                                            }
                                        )}
                                    />
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
                                    initialValue={["Blind Fight"]}
                                >
                                    <Select
                                        mode="multiple"
                                        placeholder="Select any features (Optional)"
                                        options={[
                                            {
                                                label: "Blind Fight",
                                                value: "Blind Fight",
                                                title: "Feat",
                                            },
                                            {
                                                label: "Dual Wielding",
                                                value: "Dual Wielding",
                                                title: "Feat — Considers the user as having all dual-wielding feats.",
                                            },
                                            {
                                                label: "Bane of Enemies",
                                                value: "Bane of Enemies",
                                                title: "Feat",
                                            },
                                            {
                                                label: "Overwhelming Critical",
                                                value: "Overwhelming Critical",
                                                title: "Feat",
                                            },
                                        ]}
                                    />
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

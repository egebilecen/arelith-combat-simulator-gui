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
    Select,
    Tooltip,
    message,
    InputNumber,
    Typography,
    Divider,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import Drawer from "../Components/Drawer";
import PageContainer from "../Sections/PageContainer";
import { invoke } from "@tauri-apps/api";

const { Text } = Typography;

function CharacterListPage() {
    const [messageApi, contextHolder] = message.useMessage();

    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [characterList, setCharacterList] = useState([]);
    const [weaponList, setWeaponList] = useState([]);
    const [isCharacterFormOpen, setIsCharacterFormOpen] = useState(false);
    const [characterForm] = Form.useForm();
    const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);

    const showMessage = (type, text) => {
        messageApi.open({
            type: type,
            content: text,
            style: {
                marginTop: 64,
            },
        });
    };

    const handleNewCharacterClick = (e) => {
        setIsCharacterFormOpen(true);
    };

    const handleCharacterFormCancelClick = (e) => {
        characterForm.resetFields();
        setIsCharacterFormOpen(false);
    };

    const handleCharacterCreateClick = async (e) => {
        setIsCreatingCharacter(true);

        try {
            const values = await characterForm.validateFields();
            const weapon = await invoke("get_row_by_id", {
                table: "weapons",
                id: values.weapon_id,
            });

            if (!weapon.success) {
                showMessage(
                    "error",
                    "An error occured while fetching the selected weapon: " +
                        weapon.msg
                );
                setIsCreatingCharacter(false);
                return;
            } else {
                weapon.result.obj = JSON.parse(weapon.result.json);
            }

            const character = await invoke("create_character", {
                name: values.name,
                size: values.size,
                ab: values.ab,
                strength: values.str,
                baseApr: values.base_apr,
                extraApr: values.extra_apr,
                weapon: weapon.result.obj,
                features: values.features,
            });

            let characterJsonStr = JSON.stringify(character);

            let res = await invoke("insert_row", {
                table: "characters",
                name: character.name,
                json: characterJsonStr,
            });

            if (res.success) {
                showMessage(
                    "success",
                    "The character is successfully created."
                );
            } else {
                showMessage(
                    "error",
                    "An error occured while creating the character: " + res.msg
                );
                setIsCreatingCharacter(false);
                return;
            }

            setCharacterList([
                ...characterList,
                {
                    id: res.result,
                    name: character.name,
                    json: characterJsonStr,
                },
            ]);

            setIsCreatingCharacter(false);
            handleCharacterFormCancelClick();
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
            setIsCreatingCharacter(false);
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
            {contextHolder}
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
                    renderItem={(item) => {
                        item.obj = JSON.parse(item.json);
                        console.log(item);

                        return (
                            <List.Item actions={[<a key="delete">delete</a>]}>
                                <List.Item.Meta
                                    title={
                                        <>
                                            <Text>{item.name}</Text>
                                            <Divider type="vertical" />
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontWeight: "normal",
                                                }}
                                            >
                                                <b>Size:</b> {item.obj.size}
                                            </Text>
                                        </>
                                    }
                                    description={
                                        <Row gutter={16}>
                                            <Col span={2}>
                                                <Text strong underline>
                                                    AB
                                                </Text>
                                                <br />
                                                <Text>{item.obj.ab}</Text>
                                            </Col>
                                            <Col span={3}>
                                                <Text strong underline>
                                                    STR
                                                </Text>
                                                <br />
                                                <Text>
                                                    {item.obj.abilities.str}
                                                </Text>
                                            </Col>
                                            <Col span={5}>
                                                <Text strong underline>
                                                    Base APR
                                                </Text>
                                                <br />
                                                <Text>{item.obj.base_apr}</Text>
                                            </Col>
                                            <Col span={5}>
                                                <Text strong underline>
                                                    Extra APR
                                                </Text>
                                                <br />
                                                <Text>
                                                    {item.obj.extra_apr}
                                                </Text>
                                            </Col>
                                            <Col flex="auto">
                                                <Text strong underline>
                                                    Weapon
                                                </Text>
                                                <br />
                                                <Tooltip>
                                                    <Typography.Link
                                                        style={{
                                                            cursor: "inherit",
                                                        }}
                                                    >
                                                        {item.obj.weapon.name}
                                                    </Typography.Link>
                                                </Tooltip>
                                            </Col>
                                        </Row>
                                    }
                                />
                            </List.Item>
                        );
                    }}
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
                                loading={isCreatingCharacter}
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
                            <Col span={16}>
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
                            <Col span={8}>
                                <Tooltip
                                    title="Character size will only be used to check if the weapon is held two-handed in order to gain half of the STR modifier as extra damage. Monkey grip is not considered."
                                    placement="bottomLeft"
                                >
                                    <Form.Item
                                        name="size"
                                        label="Size"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Please select a size.",
                                            },
                                        ]}
                                        initialValue={"Medium"}
                                    >
                                        <Select
                                            placeholder="Select a size"
                                            options={[
                                                {
                                                    label: "Tiny",
                                                    value: "Tiny",
                                                    title: "",
                                                },
                                                {
                                                    label: "Small",
                                                    value: "Small",
                                                    title: "",
                                                },
                                                {
                                                    label: "Medium",
                                                    value: "Medium",
                                                    title: "",
                                                },
                                                {
                                                    label: "Large",
                                                    value: "Large",
                                                    title: "",
                                                },
                                                {
                                                    label: "Huge",
                                                    value: "Huge",
                                                    title: "",
                                                },
                                            ]}
                                            title=""
                                        />
                                    </Form.Item>
                                </Tooltip>
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
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="50" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="str"
                                    label="STR Score"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <InputNumber placeholder="40" />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Tooltip
                                    title="APR gained from level / class progression."
                                    placement="bottomLeft"
                                >
                                    <Form.Item
                                        name="base_apr"
                                        label="Base APR"
                                        rules={[
                                            {
                                                required: true,
                                                pattern: new RegExp(
                                                    /^[1-9]+(?:[0-9]+)?$/g
                                                ),
                                                message: "Not valid.",
                                            },
                                        ]}
                                    >
                                        <InputNumber placeholder="4" min={1} />
                                    </Form.Item>
                                </Tooltip>
                            </Col>
                            <Col span={6}>
                                <Tooltip
                                    title="APR gained from effects such as haste, thundering rage, etc. Do NOT add the dual-wielding APR bonus here. Just select dual-wielding from the features below."
                                    placement="bottomLeft"
                                >
                                    <Form.Item
                                        name="extra_apr"
                                        label="Extra APR"
                                        rules={[
                                            {
                                                required: true,
                                                pattern: new RegExp(
                                                    /^[0-9]+$/g
                                                ),
                                                message: "Not valid.",
                                            },
                                        ]}
                                    >
                                        <InputNumber placeholder="0" min={0} />
                                    </Form.Item>
                                </Tooltip>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item
                                    name="weapon_id"
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

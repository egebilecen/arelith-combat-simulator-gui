import { useContext, useEffect, useState } from "react";
import {
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
    InputNumber,
    Typography,
    Divider,
    Popconfirm,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import Drawer from "../Components/Drawer";
import PageContainer from "../Sections/PageContainer";
import { invoke } from "@tauri-apps/api";
import WeaponStats from "../Components/WeaponStats";
import { getWeaponBaseStr } from "../Util/weapon";
import { AppContext } from "../App";
import Loading from "../Components/Loading";
import HelpText from "../Components/HelpText";

const { Text, Link } = Typography;

function CharacterListPage() {
    const { showMessage } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [characterList, setCharacterList] = useState([]);
    const [weaponList, setWeaponList] = useState([]);
    const [isCharacterFormOpen, setIsCharacterFormOpen] = useState(false);
    const [characterForm] = Form.useForm();
    const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);

    const handleNewCharacterClick = () => {
        setIsCharacterFormOpen(true);
    };

    const handleDeleteAllCharatacterClick = async () => {
        const res = await invoke("delete_all_rows", {
            table: "characters",
        });

        if (res.success) {
            showMessage("success", "All characters are successfully deleted.");
            setCharacterList([]);
        } else {
            showMessage(
                "error",
                "An error occured while deleting all characters: " + res.msg
            );
        }
    };

    const handleDeleteCharacterClick = async (id) => {
        const res = await invoke("delete_row", {
            table: "characters",
            id: id,
        });

        if (res.success) {
            showMessage("success", "The character is successfully deleted.");
            setCharacterList(characterList.filter((e, i) => e.id !== id));
        } else {
            showMessage(
                "error",
                "An error occured while deleting the character: " + res.msg
            );
        }
    };

    const handleCharacterFormCancelClick = () => {
        characterForm.resetFields();
        setIsCharacterFormOpen(false);
    };

    const handleCharacterCreateClick = async () => {
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

            const characterJsonStr = JSON.stringify(character);

            const res = await invoke("insert_row", {
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

            setCharacterList(rows.result);
            setWeaponList(weapon_rows.result);
        }

        func();
    }, []);

    return (
        <>
            <PageContainer>
                {!isLoading && !isErrorOccured && (
                    <Flex justify="end" gap="small">
                        {characterList.length > 1 && (
                            <Popconfirm
                                title="Warning"
                                description="Are you sure to delete all characters?"
                                onConfirm={handleDeleteAllCharatacterClick}
                                okText="Yes"
                                cancelText="No"
                                placement="bottom"
                            >
                                <Button
                                    type="primary"
                                    icon={<DeleteOutlined />}
                                    danger
                                >
                                    Delete All
                                </Button>
                            </Popconfirm>
                        )}

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleNewCharacterClick}
                        >
                            New
                        </Button>
                    </Flex>
                )}

                <Loading loading={isLoading} />

                {isErrorOccured && (
                    <Result
                        status="warning"
                        title="An error occured"
                        subTitle={errorText}
                    />
                )}

                {!isLoading && !isErrorOccured && (
                    <List
                        itemLayout="horizontal"
                        dataSource={characterList}
                        renderItem={(item) => {
                            item.obj = JSON.parse(item.json);

                            const actions = [
                                <Popconfirm
                                    title="Warning"
                                    description="Are you sure to delete this character?"
                                    onConfirm={() =>
                                        handleDeleteCharacterClick(item.id)
                                    }
                                    okText="Yes"
                                    cancelText="No"
                                    placement="left"
                                >
                                    <Link type="danger">delete</Link>
                                </Popconfirm>,
                            ];

                            return (
                                <List.Item actions={actions}>
                                    <List.Item.Meta
                                        title={
                                            <Space
                                                split={
                                                    <Divider type="vertical" />
                                                }
                                                size={0}
                                            >
                                                <Text>{item.name}</Text>
                                                <span>
                                                    <HelpText
                                                        items={item.obj.feats}
                                                        emptyText="This character has no features."
                                                    >
                                                        {item.obj.feats.length}{" "}
                                                        Feature
                                                    </HelpText>
                                                </span>
                                                <Text
                                                    type="secondary"
                                                    style={{
                                                        fontWeight: "normal",
                                                    }}
                                                >
                                                    <b>Size:</b> {item.obj.size}
                                                </Text>
                                            </Space>
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
                                                    <Text>
                                                        {item.obj.base_apr}
                                                    </Text>
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
                                                    <HelpText
                                                        items={[
                                                            <WeaponStats
                                                                weapon={
                                                                    item.obj
                                                                        .weapon
                                                                }
                                                            />,
                                                        ]}
                                                    >
                                                        {item.obj.weapon.name}
                                                    </HelpText>
                                                </Col>
                                            </Row>
                                        }
                                    />
                                </List.Item>
                            );
                        }}
                    />
                )}

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
                        autoComplete="off"
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
                                    <InputNumber placeholder="40" min={4} />
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
                                                    title: getWeaponBaseStr(
                                                        weapon_row.obj.base
                                                    ),
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

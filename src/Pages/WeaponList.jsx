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
    InputNumber,
    Tooltip,
    Checkbox,
    Divider,
    message,
    Typography,
} from "antd";
import {
    LoadingOutlined,
    PlusOutlined,
    MinusCircleOutlined,
} from "@ant-design/icons";
import Drawer from "../Components/Drawer";
import PageContainer from "../Sections/PageContainer";
import { invoke } from "@tauri-apps/api";

const { Text } = Typography;

const itemProperties = ["Damage Bonus", "Massive Critical"];

const damageTypes = [
    "Slashing",
    "Piercing",
    "Bludgeoning",
    "Magical",
    "Acid",
    "Cold",
    "Divine",
    "Electrical",
    "Fire",
    "Negative",
    "Positive",
    "Sonic",
    "Entropy",
    "Force",
    "Psychic",
    "Poison",
];

function WeaponListPage() {
    const [messageApi, contextHolder] = message.useMessage();

    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [weaponList, setWeaponList] = useState([]);
    const [isWeaponFormOpen, setIsWeaponFormOpen] = useState(false);
    const [weaponForm] = Form.useForm();
    const [baseWeapons, setBaseWeapons] = useState([]);
    const [showExtraField, setShowExtraField] = useState({});
    const [isCreatingWeapon, setIsCreatingWeapon] = useState(false);

    const handleNewWeaponClick = (e) => {
        setIsWeaponFormOpen(true);
    };

    const handleWeaponFormCancelClick = (e) => {
        weaponForm.resetFields();
        setShowExtraField({});
        setIsWeaponFormOpen(false);
    };

    const handleWeaponFormValueChange = (e) => {
        if (e.item_properties !== undefined) {
            const keys = Object.keys(e.item_properties);

            for (const key of keys) {
                const iprop = e.item_properties[key];

                if (iprop !== undefined && iprop.type !== undefined) {
                    if (iprop.type == "Damage Bonus") {
                        let obj = Object.assign({}, showExtraField);
                        obj[key] = true;

                        setShowExtraField(obj);
                    } else {
                        let obj = Object.assign({}, showExtraField);
                        obj[key] = false;

                        setShowExtraField(obj);
                    }
                }
            }
        }
    };

    const handleWeaponFormCreateClick = async (e) => {
        setIsCreatingWeapon(true);

        try {
            const values = await weaponForm.validateFields();
            const weapon = await invoke("create_weapon", {
                name: values.weapon.name,
                baseWeapon: values.weapon.base_weapon,
                threatRange: values.weapon.threat_range_ovr,
                critMult: values.weapon.crit_mult_ovr,
                itemProps: values.item_properties || [],
            });

            let res = await invoke("insert_row", {
                table: "weapons",
                name: weapon.name,
                json: JSON.stringify(weapon),
            });

            if (res.success) {
                messageApi.open({
                    type: "success",
                    content: "The weapon is successfully created.",
                    style: {
                        marginTop: 64,
                    },
                });
            } else {
                messageApi.open({
                    type: "error",
                    content: "An error occured while creating the weapon.",
                    style: {
                        marginTop: 64,
                    },
                });
            }

            setIsCreatingWeapon(false);
            handleWeaponFormCancelClick();
        } catch (errorInfo) {
            console.log("Failed:", errorInfo);
            setIsCreatingWeapon(false);
        }
    };

    // Load weapons
    useEffect(() => {
        async function func() {
            const [rows, baseWeapons] = await Promise.all([
                invoke("get_rows", { table: "weapons" }),
                invoke("get_base_weapons", {}),
            ]);

            setIsLoading(false);

            if (!rows.success) {
                setErrorText(rows.msg);
                setIsErrorOccured(true);
                return;
            }

            if (Object.keys(baseWeapons).length < 1) {
                setErrorText("Couldn't fetch base weapons.");
                setIsErrorOccured(true);
                return;
            }

            setWeaponList(rows.result);

            const baseWeaponsList = [];
            for (const [key, val] of Object.entries(baseWeapons)) {
                baseWeaponsList.push({
                    title:
                        key +
                        " (" +
                        val.damage.rolls +
                        "d" +
                        val.damage.faces +
                        ", " +
                        (val.threat_range < 20
                            ? val.threat_range + "-20"
                            : "20") +
                        ", x" +
                        val.crit_multiplier +
                        ")",
                    label: key,
                    value: key,
                });
            }

            setBaseWeapons(baseWeaponsList);
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
                    title="An error occured"
                    subTitle={errorText}
                />

                <List
                    key="weapon-list"
                    style={{
                        display: isLoading || isErrorOccured ? "none" : "block",
                    }}
                    itemLayout="horizontal"
                    dataSource={weaponList}
                    renderItem={(item) => {
                        item.obj = JSON.parse(item.json);

                        const threatRange = item.obj.item_properties.find(
                            (e) => e.ThreatRangeOverride !== undefined
                        ).ThreatRangeOverride;

                        const critMultiplier = item.obj.item_properties.find(
                            (e) => e.CriticalMultiplierOverride !== undefined
                        ).CriticalMultiplierOverride;

                        const properties = item.obj.item_properties
                            .slice(2)
                            .map((obj) => {
                                const get_value = (value) => {
                                    let val = value.faces;

                                    if (value.rolls > 1) {
                                        val = val + "d" + value.rolls;
                                    }

                                    return val;
                                };

                                const key = Object.keys(obj)[0];
                                let iprop = obj[key];

                                if (key == "DamageBonus") {
                                    return (
                                        <Text
                                            style={{
                                                color: "white",
                                            }}
                                        >
                                            <Text
                                                style={{ color: "inherit" }}
                                                strong
                                            >
                                                Damage Bonus:
                                            </Text>{" "}
                                            {get_value(iprop.amount)}{" "}
                                            {iprop.type_}
                                        </Text>
                                    );
                                } else if (key == "MassiveCrit") {
                                    return (
                                        <Text
                                            style={{
                                                color: "white",
                                            }}
                                        >
                                            <Text
                                                style={{ color: "inherit" }}
                                                strong
                                            >
                                                Massive Critical:
                                            </Text>{" "}
                                            {get_value(iprop)}
                                        </Text>
                                    );
                                }
                            });

                        return (
                            <List.Item
                                key={"weapon-" + item.id}
                                actions={[<a key="delete">delete</a>]}
                            >
                                <List.Item.Meta
                                    title={item.name}
                                    description={
                                        <Row gutter={16}>
                                            {/* <Col span={2}>
                                                <Text strong>ID </Text>
                                                <br />
                                                <Text>{item.id}</Text>
                                            </Col> */}
                                            <Col span={6}>
                                                <Text strong underline>Base Weapon</Text>
                                                <br />
                                                <Text>
                                                    {item.obj.base.name}
                                                </Text>
                                            </Col>
                                            <Col span={6}>
                                                <Text strong underline>Threat Range</Text>
                                                <br />
                                                <Text>
                                                    {threatRange == 20
                                                        ? threatRange
                                                        : threatRange +
                                                          " - " +
                                                          "20"}
                                                </Text>
                                            </Col>
                                            <Col span={6}>
                                                <Text strong underline>
                                                    Crit. Multiplier
                                                </Text>
                                                <br />
                                                <Text>x{critMultiplier}</Text>
                                            </Col>
                                            <Col span={6}>
                                                <Text strong underline>Properties</Text>
                                                <br />
                                                <Tooltip
                                                    title={
                                                        <Row
                                                            style={{
                                                                maxWidth: 200,
                                                            }}
                                                        >
                                                            {properties.map(
                                                                (prop, i) => (
                                                                    <Col
                                                                        key={
                                                                            "props-" +
                                                                            i
                                                                        }
                                                                        span={
                                                                            24
                                                                        }
                                                                    >
                                                                        {prop}
                                                                    </Col>
                                                                )
                                                            )}
                                                        </Row>
                                                    }
                                                >
                                                    <Typography.Link
                                                        style={{
                                                            cursor: "inherit",
                                                        }}
                                                    >
                                                        {item.obj
                                                            .item_properties
                                                            .length - 2}
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
                    title="Create a new weapon"
                    open={isWeaponFormOpen}
                    closable={false}
                    extra={
                        <Space>
                            <Button onClick={handleWeaponFormCancelClick}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                onClick={handleWeaponFormCreateClick}
                                loading={isCreatingWeapon}
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
                        onValuesChange={handleWeaponFormValueChange}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name={["weapon", "name"]}
                                    label="Name"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Please enter a name.",
                                        },
                                    ]}
                                >
                                    <Input placeholder="M. Damask Scimitar" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={["weapon", "base_weapon"]}
                                    label="Base Weapon"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please select a base weapon.",
                                        },
                                    ]}
                                >
                                    <Select
                                        placeholder="Select a base weapon"
                                        options={baseWeapons}
                                        showSearch
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <span>
                                <b>Override</b>
                            </span>
                        </Row>
                        <Row gutter={16}>
                            <Col span={7}>
                                <Form.Item
                                    name={["weapon", "threat_range_ovr"]}
                                    label="Threat Range"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        addonAfter="- 20"
                                        min={10}
                                        max={20}
                                        placeholder="10"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name={["weapon", "crit_mult_ovr"]}
                                    label="Crit. Mult."
                                    rules={[
                                        {
                                            required: true,
                                            message: "Not valid.",
                                        },
                                    ]}
                                >
                                    <InputNumber
                                        addonBefore="x"
                                        min={2}
                                        max={4}
                                        placeholder="3"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <span>
                                <b>Item Properties</b>
                            </span>
                        </Row>
                        <Row gutter={16}>
                            <Col flex="auto">
                                <Form.List name="item_properties">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(
                                                ({
                                                    key,
                                                    name,
                                                    ...restField
                                                }) => {
                                                    return (
                                                        <Row
                                                            gutter={16}
                                                            key={key}
                                                        >
                                                            <Col span={9}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[
                                                                        name,
                                                                        "type",
                                                                    ]}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message:
                                                                                "Please select an item property.",
                                                                        },
                                                                    ]}
                                                                    label="Property Type"
                                                                >
                                                                    <Select
                                                                        options={itemProperties.map(
                                                                            (
                                                                                elem
                                                                            ) => ({
                                                                                label: elem,
                                                                                value: elem,
                                                                                title: "",
                                                                            })
                                                                        )}
                                                                        placeholder="Select a property"
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col
                                                                span={8}
                                                                style={{
                                                                    display:
                                                                        showExtraField[
                                                                            name
                                                                        ] ===
                                                                        true
                                                                            ? "block"
                                                                            : "none",
                                                                }}
                                                            >
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[
                                                                        name,
                                                                        "extra",
                                                                    ]}
                                                                    rules={[
                                                                        {
                                                                            required:
                                                                                showExtraField[
                                                                                    name
                                                                                ],
                                                                            message:
                                                                                "Please select an option.",
                                                                        },
                                                                    ]}
                                                                    label="Damage Type"
                                                                >
                                                                    <Select
                                                                        options={damageTypes.map(
                                                                            (
                                                                                elem
                                                                            ) => ({
                                                                                label: elem,
                                                                                value: elem,
                                                                                title: "",
                                                                            })
                                                                        )}
                                                                        placeholder="Select an option"
                                                                        showSearch
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={6}>
                                                                <Tooltip
                                                                    trigger={[
                                                                        "focus",
                                                                    ]}
                                                                    placement="bottomLeft"
                                                                    title="Either a number such as 4 or a dice such as 1d6."
                                                                >
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[
                                                                            name,
                                                                            "value",
                                                                        ]}
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                pattern:
                                                                                    new RegExp(
                                                                                        /^((?:[1-9][0-9]*)|(?:[1-9][0-9]*d[1-9][0-9]*))$/g
                                                                                    ),
                                                                                message:
                                                                                    "Please enter a valid value.",
                                                                            },
                                                                        ]}
                                                                        label="Value / Dice"
                                                                    >
                                                                        <Input placeholder="1d6" />
                                                                    </Form.Item>
                                                                </Tooltip>
                                                            </Col>
                                                            <Col span={1}>
                                                                <Flex
                                                                    style={{
                                                                        height: "100%",
                                                                    }}
                                                                    align="center"
                                                                >
                                                                    <MinusCircleOutlined
                                                                        onClick={() => {
                                                                            let obj =
                                                                                Object.assign(
                                                                                    {},
                                                                                    showExtraField
                                                                                );
                                                                            delete obj[
                                                                                name
                                                                            ];

                                                                            setShowExtraField(
                                                                                obj
                                                                            );

                                                                            remove(
                                                                                name
                                                                            );
                                                                        }}
                                                                    />
                                                                </Flex>
                                                            </Col>
                                                            <Col
                                                                span={24}
                                                                style={{
                                                                    display:
                                                                        showExtraField[
                                                                            name
                                                                        ] ===
                                                                        true
                                                                            ? "block"
                                                                            : "none",
                                                                }}
                                                            >
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[
                                                                        name,
                                                                        "dmg_props",
                                                                    ]}
                                                                    label="Damage Properties"
                                                                    initialValue={[
                                                                        "can_crit",
                                                                        "resistable",
                                                                    ]}
                                                                >
                                                                    <Checkbox.Group>
                                                                        <Checkbox value="can_crit">
                                                                            Can
                                                                            critical
                                                                            hit
                                                                        </Checkbox>

                                                                        <Tooltip
                                                                            trigger={[
                                                                                "hover",
                                                                                "click",
                                                                            ]}
                                                                            title="If damage is resistable, it will be affected from damage resistance, damage reduction, and damage immunity."
                                                                        >
                                                                            <Checkbox value="resistable">
                                                                                Resistable
                                                                            </Checkbox>
                                                                        </Tooltip>
                                                                    </Checkbox.Group>
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={24}>
                                                                <Divider
                                                                    style={{
                                                                        marginTop: 0,
                                                                    }}
                                                                />
                                                            </Col>
                                                        </Row>
                                                    );
                                                }
                                            )}
                                            <Form.Item>
                                                <Button
                                                    type="dashed"
                                                    onClick={() => {
                                                        add();

                                                        setInterval(() => {
                                                            let refElem =
                                                                document.querySelector(
                                                                    ".ant-drawer-body"
                                                                );
                                                            refElem.scrollTop =
                                                                refElem.scrollHeight;
                                                        }, 0);
                                                    }}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    Add new property
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
            </PageContainer>
        </>
    );
}

export default WeaponListPage;

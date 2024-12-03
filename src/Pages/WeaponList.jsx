import { useEffect, useState, useContext } from "react";
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
    InputNumber,
    Tooltip,
    Checkbox,
    Divider,
    Typography,
    Popconfirm,
    Segmented,
} from "antd";
import {
    PlusOutlined,
    MinusCircleOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import Drawer from "../Components/Drawer";
import PageContainer from "../Sections/PageContainer";
import ItemPropStats from "../Components/ItemPropStats";
import { invoke } from "@tauri-apps/api";
import { getWeaponBaseStr } from "../Util/weapon";
import { AppContext } from "../App";
import Loading from "../Components/Loading";
import HelpText from "../Components/HelpText";

const { Text, Link } = Typography;

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
    const { showMessage } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [isErrorOccured, setIsErrorOccured] = useState(false);
    const [errorText, setErrorText] = useState("Unknown");
    const [weaponList, setWeaponList] = useState([]);
    const [isWeaponFormOpen, setIsWeaponFormOpen] = useState(false);
    const [weaponForm] = Form.useForm();
    const [arelithBaseWeapons, setArelithBaseWeapons] = useState([]);
    const [customBaseWeapons, setCustomBaseWeapons] = useState([]);
    const [showExtraField, setShowExtraField] = useState({});
    const [isCreatingWeapon, setIsCreatingWeapon] = useState(false);
    const [baseWeaponType, setBaseWeaponType] = useState("Arelith");

    const handleNewWeaponClick = () => {
        setIsWeaponFormOpen(true);
    };

    const handleDeleteAllWeaponClick = async () => {
        const res = await invoke("delete_all_rows", {
            table: "weapons",
        });

        if (res.success) {
            showMessage("success", "All weapons are successfully deleted.");
            setWeaponList([]);
        } else {
            showMessage(
                "error",
                "An error occured while deleting all weapons: " + res.msg
            );
        }
    };

    const handleDeleteWeaponClick = async (id) => {
        const res = await invoke("delete_row", {
            table: "weapons",
            id: id,
        });

        if (res.success) {
            showMessage("success", "The weapon is successfully deleted.");
            setWeaponList(weaponList.filter((e) => e.id !== id));
        } else {
            showMessage(
                "error",
                "An error occured while deleting the weapon: " + res.msg
            );
        }
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

    const handleWeaponFormCancelClick = () => {
        weaponForm.resetFields();
        setShowExtraField({});
        setIsWeaponFormOpen(false);
    };

    const handleWeaponFormCreateClick = async () => {
        setIsCreatingWeapon(true);

        try {
            const values = await weaponForm.validateFields();
            const baseWeapon =
                baseWeaponType === "Arelith"
                    ? arelithBaseWeapons.filter(
                          (e) => e.value == values.weapon.base_weapon
                      )
                    : customBaseWeapons.filter(
                          (e) => e.value == values.weapon.base_weapon
                      );

            if (baseWeapon.length < 1) {
                showMessage("error", "Couldn't get the selected base weapon.");
                setIsCreatingWeapon(false);
                return;
            }

            const weapon = await invoke("create_weapon", {
                name: values.weapon.name,
                baseWeapon: baseWeapon[0].obj,
                threatRange: values.weapon.threat_range_ovr,
                critMult: values.weapon.crit_mult_ovr,
                itemProps: values.item_properties || [],
            });

            const weaponJsonStr = JSON.stringify(weapon);

            const res = await invoke("insert_row", {
                table: "weapons",
                name: weapon.name,
                json: weaponJsonStr,
            });

            if (res.success) {
                showMessage("success", "The weapon is successfully created.");
            } else {
                showMessage(
                    "error",
                    "An error occured while creating the weapon: " + res.msg
                );
                setIsCreatingWeapon(false);
                return;
            }

            setWeaponList([
                ...weaponList,
                {
                    id: res.result,
                    name: weapon.name,
                    json: weaponJsonStr,
                },
            ]);

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
            const [rows, _arelithBaseWeapons, _customBaseWeapons] =
                await Promise.all([
                    invoke("get_rows", { table: "weapons" }),
                    invoke("get_base_weapons", {}),
                    invoke("get_rows", { table: "base_weapons" }),
                ]);

            setIsLoading(false);

            if (!rows.success) {
                setErrorText(rows.msg);
                setIsErrorOccured(true);
                return;
            }

            if (Object.keys(_arelithBaseWeapons).length < 1) {
                setErrorText("Couldn't fetch base weapons.");
                setIsErrorOccured(true);
                return;
            }

            if (!_customBaseWeapons.success) {
                setErrorText(_customBaseWeapons.msg);
                setIsErrorOccured(true);
                return;
            }

            setWeaponList(rows.result);

            setArelithBaseWeapons(
                Object.entries(_arelithBaseWeapons).map(([key, val]) => {
                    return {
                        title: getWeaponBaseStr(val),
                        label: key,
                        value: key,
                        obj: val,
                    };
                })
            );

            setCustomBaseWeapons(
                _customBaseWeapons.result.map((e) => {
                    let obj = JSON.parse(e.json);

                    return {
                        title: getWeaponBaseStr(obj),
                        label: e.name,
                        value: e.id,
                        obj: obj,
                    };
                })
            );
        }

        func();
    }, []);

    return (
        <>
            <PageContainer>
                {!isLoading && !isErrorOccured && (
                    <Flex justify="end" gap="small">
                        {weaponList.length > 1 && (
                            <Popconfirm
                                title="Warning"
                                description="Are you sure to delete all weapons?"
                                onConfirm={handleDeleteAllWeaponClick}
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
                            onClick={handleNewWeaponClick}
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
                        key="weapon-list"
                        itemLayout="horizontal"
                        dataSource={weaponList}
                        renderItem={(item) => {
                            item.obj = JSON.parse(item.json);

                            const threatRange = item.obj.item_properties.find(
                                (e) => e.ThreatRangeOverride !== undefined
                            ).ThreatRangeOverride;

                            const critMultiplier =
                                item.obj.item_properties.find(
                                    (e) =>
                                        e.CriticalMultiplierOverride !==
                                        undefined
                                ).CriticalMultiplierOverride;

                            const actions = [
                                <Popconfirm
                                    title="Warning"
                                    description="Are you sure to delete this weapon?"
                                    onConfirm={() =>
                                        handleDeleteWeaponClick(item.id)
                                    }
                                    okText="Yes"
                                    cancelText="No"
                                    placement="left"
                                >
                                    <Link type="danger">delete</Link>
                                </Popconfirm>,
                            ];

                            return (
                                <List.Item
                                    key={"weapon-" + item.id}
                                    actions={actions}
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
                                                    <Text strong underline>
                                                        Base Weapon
                                                    </Text>
                                                    <br />
                                                    <Text>
                                                        {item.obj.base.name}
                                                    </Text>
                                                </Col>
                                                <Col span={6}>
                                                    <Text strong underline>
                                                        Threat Range
                                                    </Text>
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
                                                    <Text>
                                                        x{critMultiplier}
                                                    </Text>
                                                </Col>
                                                <Col span={6}>
                                                    <Text strong underline>
                                                        Properties
                                                    </Text>
                                                    <br />
                                                    <HelpText
                                                        items={[
                                                            <ItemPropStats
                                                                itemProperties={
                                                                    item.obj
                                                                        .item_properties
                                                                }
                                                            />,
                                                        ]}
                                                    >
                                                        {item.obj
                                                            .item_properties
                                                            .length - 2}
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
                        autoComplete="off"
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
										filterSort={(a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())}
                                        options={
                                            baseWeaponType === "Custom"
                                                ? customBaseWeapons
                                                : arelithBaseWeapons
                                        }
                                        dropdownRender={(menu) => (
                                            <>
                                                <Segmented
                                                    options={[
                                                        "Arelith",
                                                        "Custom",
                                                    ]}
                                                    value={baseWeaponType}
                                                    onChange={(val) => {
                                                        setBaseWeaponType(val);
                                                        weaponForm.setFieldValue(
                                                            [
                                                                "weapon",
                                                                "base_weapon",
                                                            ],
                                                            undefined
                                                        );
                                                    }}
                                                    block
                                                />
                                                <Divider
                                                    style={{ margin: "8px 0" }}
                                                />
                                                {menu}
                                            </>
                                        )}
                                        showSearch={
                                            baseWeaponType === "Arelith"
                                        }
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
                                                                        <Space
                                                                            split={
                                                                                <Divider type="vertical" />
                                                                            }
                                                                            size={
                                                                                0
                                                                            }
                                                                        >
                                                                            <Checkbox value="can_crit">
                                                                                Can
                                                                                critical
                                                                                hit
                                                                            </Checkbox>

                                                                            <Tooltip title="If damage is resistable, it will be affected from damage resistance, damage reduction, and damage immunity.">
                                                                                <Checkbox
                                                                                    value="resistable"
                                                                                    style={{
                                                                                        marginLeft: 6,
                                                                                    }}
                                                                                >
                                                                                    Resistable
                                                                                </Checkbox>
                                                                            </Tooltip>
                                                                        </Space>
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

                                                        setTimeout(() => {
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

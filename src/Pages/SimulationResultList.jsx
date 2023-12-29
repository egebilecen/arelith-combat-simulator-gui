import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Table } from "antd";
import { Typography, Space, Divider, Popconfirm, Row, Col } from "antd";
import PageContainer from "../Sections/PageContainer";
import Loading from "../Components/Loading";
import HelpText, { LIST_SYMBOL } from "../Components/HelpText";
import TooltipDivider from "../Components/TooltipDivider";

const { Text, Link } = Typography;

function SimulationResultList() {
    const [isLoading, setIsLoading] = useState(true);
    const [tableData, setTableData] = useState([]);
    const [osLocale, setOsLocale] = useState([]);

    const textRenderer = (text) => <Text>{text}</Text>;
    const dateRenderer = (timestamp) => {
        const date = new Date(timestamp);

        return (
            date.toLocaleDateString(osLocale) +
            ", " +
            date.toLocaleTimeString(osLocale, {
                hour: "2-digit",
                minute: "2-digit",
            })
        );
    };

    const handleDeleteRecord = (id) => {
        console.log(id);
    };

    const handleViewRecord = (record) => {
        console.log(record);
    };

    const cols = [
        {
            title: "ID",
            dataIndex: "id",
            defaultSortOrder: "descend",
            render: textRenderer,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: "Date",
            dataIndex: ["obj", "timestamp"],
            render: dateRenderer,
            sorter: (a, b) => a.obj.timestamp - b.obj.timestamp,
        },
        {
            title: "Details",
            render: (_, record) => (
                <HelpText
                    header={record.obj.data[0].result.total_rounds + " Rounds"}
                    items={record.obj.data.map((e) => e.character.name)}
                    footer={
                        <>
                            <TooltipDivider title="Target Information" />
                            <Row>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Concealment:{" "}
                                    </Text>
                                    {record.obj.target_info.concealment}%
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Damage Immunity:{" "}
                                    </Text>
                                    {record.obj.target_info.damage_immunity}%
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Defensive Essence:{" "}
                                    </Text>
                                    {record.obj.target_info.defensive_essence}
                                </Col>
                                <Col span={24}>
                                    {LIST_SYMBOL}{" "}
                                    <Text style={{ color: "inherit" }} strong>
                                        Has Epic Dodge:{" "}
                                    </Text>
                                    {record.obj.target_info.has_epic_dodge
                                        ? "Yes"
                                        : "No"}
                                </Col>
                            </Row>
                        </>
                    }
                >
                    Combat Information
                </HelpText>
            ),
        },
        {
            title: "Action",
            dataIndex: "action",
            render: (_, record) => (
                <Space split={<Divider type="vertical" />}>
                    <Popconfirm
                        title="Warning"
                        description="Are you sure to delete this record?"
                        onConfirm={() => handleDeleteRecord(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <Link type="danger">delete</Link>
                    </Popconfirm>
                    <Link
                        type="success"
                        onClick={() => handleViewRecord(record.obj)}
                    >
                        view
                    </Link>
                </Space>
            ),
        },
    ];

    // Load stuff
    useEffect(() => {
        async function func() {
            const [results] = await Promise.all([
                invoke("get_rows", {
                    table: "simulation_results",
                }),
            ]);

            setIsLoading(false);

            if (!results.success) {
                // TODO
            }

            setTableData(
                results.result.map((e, i) => {
                    const temp = e;
                    e.key = i;
                    temp.obj = JSON.parse(e.json);

                    return temp;
                })
            );
        }

        func();
    }, []);

    console.log(tableData);

    return isLoading ? (
        <PageContainer>
            <Loading loading={isLoading} />
        </PageContainer>
    ) : (
        <Table
            pagination={{ pageSize: 6, style: { marginBottom: 0 } }}
            columns={cols}
            dataSource={tableData}
        />
    );
}

export default SimulationResultList;

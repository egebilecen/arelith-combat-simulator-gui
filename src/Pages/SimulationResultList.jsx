import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { Table } from "antd";
import { Typography, Space, Divider, Popconfirm } from "antd";
import PageContainer from "../Sections/PageContainer";
import Loading from "../Components/Loading";

const { Text } = Typography;

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

    const handleDeleteResult = (id) => {
        console.log(id);
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
            title: "Action",
            dataIndex: "action",
            render: (_, record) => (
                <Space split={<Divider type="vertical" />}>
                    <Popconfirm
                        title="Warning"
                        description="Are you sure to delete this record?"
                        onConfirm={() => handleDeleteResult(record.id)}
                        okText="Yes"
                        cancelText="No"
                        placement="left"
                    >
                        <a>delete</a>
                    </Popconfirm>
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

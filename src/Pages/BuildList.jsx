import { useState } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import PageContainer from "../Sections/PageContainer";

function BuildListPage() {
    const [displayLoader, setDisplayLoader] = useState(true);

    return (
        <PageContainer>
            <Spin
                indicator={<LoadingOutlined />}
                tip="Loading..."
                spinning={displayLoader}
            >
                <p
                    style={{
                        display: displayLoader === true ? "block" : "none",
                    }}
                >
                    &nbsp;
                </p>
            </Spin>
        </PageContainer>
    );
}

export default BuildListPage;

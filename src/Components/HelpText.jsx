import { Tooltip, Row, Col, Typography } from "antd";
import { isValidElement } from "react";
const { Text } = Typography;

function HelpText({ items, emptyText, listSymbol, placement, ...props }) {
    items ??= [];
    listSymbol ??= <>&#x2022; </>;
    placement ??= "bottom";

    return (
        <Tooltip
            title={
                <Row>
                    {items.length > 0 ? (
                        items.map((e, i) =>
                            isValidElement(e) ? (
                                <Col key={"item-" + i} span={24}>{e}</Col>
                            ) : (
                                <Col key={"item-" + i} span={24}>
                                    <Text
                                        style={{
                                            color: "inherit",
                                        }}
                                    >
                                        {listSymbol}{e}
                                    </Text>
                                </Col>
                            )
                        )
                    ) : (
                        <Col span={24}>{emptyText}</Col>
                    )}
                </Row>
            }
            placement={placement}
        >
            <Typography.Link
                style={{
                    cursor: "inherit",
                    fontWeight: "initial",
                }}
            >
                {props.children}
            </Typography.Link>
        </Tooltip>
    );
}

export default HelpText;

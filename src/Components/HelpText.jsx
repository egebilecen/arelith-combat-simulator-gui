import { Tooltip, Row, Col, Typography } from "antd";
import { isValidElement } from "react";
const { Text, Link } = Typography;

export const LIST_SYMBOL = <>&#x2022;</>;

function HelpText({
    header,
    items,
    footer,
    emptyText,
    listSymbol,
    placement,
    ...props
}) {
    items ??= [];
    listSymbol ??= <>{LIST_SYMBOL} </>;
    placement ??= "bottom";

    return (
        <Tooltip
            title={
                <>
                    {header !== undefined ? (
                        isValidElement(header) ? (
                            header
                        ) : (
                            <Text style={{ color: "inherit" }} strong>
                                {header}
                            </Text>
                        )
                    ) : (
                        <></>
                    )}
                    <Row>
                        {items.length > 0 ? (
                            items.map((e, i) =>
                                isValidElement(e) ? (
                                    <Col key={"item-" + i} span={24}>
                                        {e}
                                    </Col>
                                ) : (
                                    <Col key={"item-" + i} span={24}>
                                        <Text
                                            style={{
                                                color: "inherit",
                                            }}
                                        >
                                            {listSymbol}
                                            {e}
                                        </Text>
                                    </Col>
                                )
                            )
                        ) : (
                            <Col span={24}>{emptyText}</Col>
                        )}
                    </Row>
                    {footer !== undefined ? (
                        isValidElement(footer) ? (
                            footer
                        ) : (
                            <Text style={{ color: "inherit" }} strong>
                                {footer}
                            </Text>
                        )
                    ) : (
                        <></>
                    )}
                </>
            }
            placement={placement}
        >
            <Link
                style={{
                    cursor: "inherit",
                    fontWeight: "initial",
                }}
            >
                {props.children}
            </Link>
        </Tooltip>
    );
}

export default HelpText;

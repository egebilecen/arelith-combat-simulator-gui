import { useState } from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

function AboutPage() {
    return (
        <Card>
            <img
                style={{
                    display: "block",
                    margin: "auto",
                    width: 100,
                    height: 100,
                }}
                src="/EB_logo.png"
                alt="Logo"
            />
            <Text style={{ display: "block", textAlign: "justify" }}>
                This application is developed by{" "}
                <a href="https://github.com/egebilecen" target="_blank">
                    Zaphiel
                </a>
                . It simulates each round in combat, then summarizes the
                statistics. It is open-source software, which can be found{" "}
                <a href="https://github.com/egebilecen">here</a>. If you like
                this application or find it useful, please consider leaving a
                star ⭐ to the repo.
            </Text>
        </Card>
    );
}

export default AboutPage;

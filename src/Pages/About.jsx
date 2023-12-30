import { Typography, Flex } from "antd";
import PageContainer from "../Sections/PageContainer";

const { Text, Link } = Typography;

function AboutPage() {
    return (
        <PageContainer>
            <img
                style={{
                    display: "block",
                    margin: "auto",
                    width: 125,
                    marginBottom: 10,
                }}
                src="EB_logo2.png"
                alt="Logo"
            />
            <Text style={{ display: "block", textAlign: "justify" }}>
                This application is developed by{" "}
                <Link href="https://github.com/egebilecen" target="_blank">
                    Zaphiel
                </Link>
                . It simulates each round in combat, then summarizes the
                statistics. It is open-source software, which can be found{" "}
                <Link
                    href="https://github.com/egebilecen/nwn-damage-calculator/tree/ui"
                    target="_blank"
                >
                    here
                </Link>
                . If you like this application or find it useful, please
                consider leaving a star ⭐ to the repo.
            </Text>
            <Flex style={{ width: "100%", marginTop: 6 }} justify="center">
                <Link
                    href="https://www.buymeacoffee.com/egebilecen"
                    target="_blank"
                >
                    <img src="buymeacoffee.png" style={{
                        width: 250
                    }} />
                </Link>
            </Flex>
        </PageContainer>
    );
}

export default AboutPage;

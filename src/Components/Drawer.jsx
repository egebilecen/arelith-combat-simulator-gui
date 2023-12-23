import { Drawer } from "antd";

function Drawer_(props) {
    return (
        <Drawer
            width={window.innerWidth / 1.75}
            getContainer={document.querySelector("#app-body")}
            rootStyle={{ position: "absolute" }}
            {...props}
        ></Drawer>
    );
}

export default Drawer_;

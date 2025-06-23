import { Flex, Button } from "antd";
import logo from "../../assets/logo_dark_crop.png";
import style from "./Header.module.css";

function Header() {
  return (
      <header className={style.header}>
        <Flex
          align="center"
          justify="space-between"
          style={{ height: "100%", padding: "0 12px" }}
        >
          <img width="100px" src={logo} />
        </Flex>
      </header>
  );
}

export default Header;

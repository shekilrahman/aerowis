import { Flex } from "antd";
import { Link, useLocation } from "react-router-dom";

import { MdOutlineSupervisorAccount } from "react-icons/md";
import { GiTeacher } from "react-icons/gi";
import { RiBookShelfLine } from "react-icons/ri";
import { TfiWrite } from "react-icons/tfi";

import style from "./Nav.module.css";

function Nav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className={style.nav}>
      <Flex align="center" justify="space-around" style={{ height: "100%", padding: "12px" }}>
        <Link to="/" className={`${style.navIcon} ${currentPath === "/" ? style.active : ""}`}>
          <MdOutlineSupervisorAccount size={28} />
        </Link>

        <Link
          to="/Instructors"
          className={`${style.navIcon} ${currentPath === "/Instructors" ? style.active : ""}`}
        >
          <GiTeacher size={28} />
        </Link>

        <Link
          to="/Course"
          className={`${style.navIcon} ${currentPath === "/Course" ? style.active : ""}`}
        >
          <RiBookShelfLine size={28} />
        </Link>

        <Link
          to="/Exams"
          className={`${style.navIcon} ${currentPath === "/Exams" ? style.active : ""}`}
        >
          <TfiWrite size={26} />
        </Link>
      </Flex>
    </nav>
  );
}

export default Nav;

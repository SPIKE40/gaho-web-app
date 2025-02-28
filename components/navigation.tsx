"use client";
import Sider from "antd/es/layout/Sider";
import { Menu } from "antd";
import { HTMLAttributeAnchorTarget, ReactElement } from "react";
import { AiFillMessage, AiFillRead, AiFillSound } from "react-icons/ai";
import Link from "next/link";

type MenuType = {
  name: string;
  path: string;
  icon: ReactElement;
  target?: HTMLAttributeAnchorTarget;
};

const menus: MenuType[] = [
  {
    name: "믿음",
    path: "/",
    icon: <AiFillMessage />,
  },
  {
    name: "DocuSee",
    path: "/docusee",
    icon: <AiFillRead />,
  },
  {
    name: "Sound",
    path: "/soundai",
    icon: <AiFillSound />,
  },
];

const Navigation = () => {
  const items = menus.map((menu, index) => ({
    key: String(index + 1),
    icon: menu.icon,
    label: <Link href={menu.path}>{menu.name}</Link>,
  }));

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
      style={{ height: "100%" }}
    >
      <div className="logo" />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={items}
      />
    </Sider>
  );
};
export default Navigation;

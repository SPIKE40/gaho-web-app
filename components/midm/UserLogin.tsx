import React from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, MenuProps } from "antd";

const UserLogin: React.FC = () => {
  const items: MenuProps["items"] = [
    { key: "1", label: "설정" },
    { key: "2", label: "로그아웃" },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={["click"]}>
      <Button style={{ height: "100%", border: "0px", boxShadow: "none" }}>
        <Avatar
          style={{ backgroundColor: "#1890ff" }}
          icon={<UserOutlined />}
        />
        <span>UserName</span>
      </Button>
    </Dropdown>
  );
};
export default UserLogin;

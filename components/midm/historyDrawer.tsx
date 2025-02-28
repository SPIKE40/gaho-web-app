import React, { useState } from "react";
import { Button, Drawer } from "antd";
import { MdHistory } from "react-icons/md";

const HistoryDrawer = () => {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button type="primary" onClick={showDrawer}>
        <MdHistory />
        History
      </Button>
      <Drawer title="history" onClose={onClose} open={open}>
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Drawer>
    </>
  );
};

export default HistoryDrawer;

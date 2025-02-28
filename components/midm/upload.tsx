import React from "react";
import type { UploadProps } from "antd";
import { Button, message, Upload } from "antd";
import { GoPlus } from "react-icons/go";

const props: UploadProps = {
  name: "file",
  action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload", //"https://localhost:3000/api/test", //업로드할 API URL 경로
  headers: {
    authorization: "authorization-text",
  },
  onChange(info) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  //progress custom
  // progress: {
  //   strokeColor: {
  //     "0%": "#108ee9",
  //     "100%": "#87d068",
  //   },
  //   strokeWidth: 3,
  //   format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
  // },
};

const UploadComponent: React.FC = () => (
  <Upload {...props}>
    <Button icon={<GoPlus />}>첨부</Button>
  </Upload>
);

export default UploadComponent;
